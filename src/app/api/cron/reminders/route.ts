import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as Sentry from "@sentry/nextjs";
import { sendNotification, setVapidDetails, WebPushError } from "web-push";
import { isReminderDueNow } from "@/lib/reminder-schedule";
import type { ReminderCreneau } from "@/lib/supabase-store";

// force-dynamic : cf. trial-expiry, empêche l'évaluation statique au build.
export const dynamic = "force-dynamic";
// nodejs (pas edge) : web-push a besoin des primitives crypto Node.
export const runtime = "nodejs";

// =====================================================================
// GET /api/cron/reminders
//
// Cron Vercel HORAIRE (24 entrées dans vercel.json, une par heure UTC,
// toutes vers cette même route — cf. commentaire vercel.json). Chaque
// passage recalcule, pour CHAQUE rappel armé, s'il est dû dans SON PROPRE
// fuseau (jamais une hypothèse de fuseau unique). Envoie à tous les
// abonnements actifs de la personne. Payload figé (§3 spec 57-4) :
//   titre "TRACÉA", corps "C'est le moment que tu avais choisi. Tu peux
//   venir, si tu veux."
//
// P0 doctrine : aucun échec (abonnement expiré, erreur d'envoi) ne doit
// jamais être visible ou avoir de conséquence côté utilisatrice.
//
// Auth : Authorization: Bearer $CRON_SECRET (fail-closed, cf. trial-expiry)
// =====================================================================

const NOTIFICATION_TITLE = "TRACÉA";
const NOTIFICATION_BODY =
  "C'est le moment que tu avais choisi. Tu peux venir, si tu veux.";

type ReminderRow = {
  id: string;
  user_id: string;
  creneau: ReminderCreneau;
  jours: number[];
  fuseau: string;
  last_sent_at: string | null;
};

type SubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function GET(request: NextRequest) {
  // 1. Auth via CRON_SECRET (échec fermé si secret absent ou invalide)
  const expected = process.env.CRON_SECRET;
  const provided =
    request.headers.get("authorization")?.replace("Bearer ", "") ?? null;
  if (!expected || !provided || provided !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 2. Vérifier la présence du service_role + des clés VAPID
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const vapidSubject = process.env.VAPID_SUBJECT?.trim();
  if (!serviceKey || !url) {
    console.error(
      "[CRON REMINDERS] Configuration serveur incomplète — service_role ou URL manquante"
    );
    return NextResponse.json(
      { error: "server_config_missing" },
      { status: 500 }
    );
  }
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    console.error(
      "[CRON REMINDERS] Configuration VAPID incomplète — envoi impossible"
    );
    return NextResponse.json(
      { error: "vapid_config_missing" },
      { status: 500 }
    );
  }

  setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  // cache:"no-store" obligatoire : le fetch global patché par Next.js (App
  // Router) met en cache les requêtes GET de supabase-js par défaut, y
  // compris dans une route `force-dynamic`. Sans ce override, ce cron
  // relirait un instantané figé de reminders/push_subscriptions au lieu de
  // l'état réel — silencieusement, sans erreur — et le garde-fou
  // last_sent_at perdrait toute utilité (double envoi possible). Confirmé
  // par test direct : sans ce override, la route voyait un abonnement
  // supprimé/modifié plusieurs minutes plus tôt comme s'il existait encore.
  const supabaseService = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });

  // 3. Tous les rappels armés — le filtrage "dû maintenant" se fait en
  //    mémoire (par fuseau individuel), pas en SQL.
  const { data: reminders, error: queryError } = await supabaseService
    .from("reminders")
    .select("id, user_id, creneau, jours, fuseau, last_sent_at")
    .eq("arme", true)
    .returns<ReminderRow[]>();

  if (queryError || !reminders) {
    console.error("[CRON REMINDERS] Query failed:", queryError?.message);
    return NextResponse.json({ error: "query_failed" }, { status: 500 });
  }

  const now = new Date();
  const due = reminders.filter((r) =>
    isReminderDueNow({
      fuseau: r.fuseau,
      creneau: r.creneau,
      jours: r.jours,
      lastSentAt: r.last_sent_at,
      now,
    })
  );

  const payload = JSON.stringify({
    title: NOTIFICATION_TITLE,
    body: NOTIFICATION_BODY,
    url: "/app",
  });

  let sent = 0;
  let cleaned = 0;
  let errors = 0;

  for (const reminder of due) {
    try {
      const { data: subscriptions, error: subError } = await supabaseService
        .from("push_subscriptions")
        .select("id, endpoint, p256dh, auth")
        .eq("user_id", reminder.user_id)
        .returns<SubscriptionRow[]>();

      if (subError) {
        Sentry.captureException(new Error(subError.message), {
          tags: { feature: "reminder_send" },
        });
        errors++;
      } else {
        for (const sub of subscriptions ?? []) {
          try {
            await sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              payload,
              { TTL: 3600 }
            );
            sent++;
          } catch (sendErr) {
            const statusCode =
              sendErr instanceof WebPushError ? sendErr.statusCode : null;
            if (statusCode === 404 || statusCode === 410) {
              // Abonnement expiré/révoqué : nettoyage technique silencieux.
              // Ne concerne pas l'utilisatrice — si elle a un autre
              // abonnement actif, il aura été/sera essayé séparément.
              await supabaseService
                .from("push_subscriptions")
                .delete()
                .eq("id", sub.id);
              cleaned++;
            } else {
              Sentry.captureException(
                sendErr instanceof Error ? sendErr : new Error(String(sendErr)),
                { tags: { feature: "reminder_send" } }
              );
              errors++;
            }
          }
        }
      }
    } catch (err) {
      Sentry.captureException(err instanceof Error ? err : new Error(String(err)), {
        tags: { feature: "reminder_send" },
      });
      errors++;
    }

    // Marqué comme traité pour aujourd'hui dans TOUS les cas (aucun
    // abonnement, échec d'envoi, ou succès) : le prochain créneau du même
    // rappel réessaiera naturellement — jamais de conséquence visible.
    await supabaseService
      .from("reminders")
      .update({ last_sent_at: now.toISOString() })
      .eq("id", reminder.id);
  }

  console.log(
    "[CRON REMINDERS] Done — rappels armés:",
    reminders.length,
    "| dus:",
    due.length,
    "| envoyés:",
    sent,
    "| nettoyés:",
    cleaned,
    "| erreurs:",
    errors
  );

  return NextResponse.json({
    checked: reminders.length,
    due: due.length,
    sent,
    cleaned,
    errors,
  });
}
