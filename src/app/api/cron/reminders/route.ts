import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as Sentry from "@sentry/nextjs";
import { sendNotification, setVapidDetails, WebPushError } from "web-push";
import { isReminderDueNow, isPastOneTimeReminder } from "@/lib/reminder-schedule";
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
  // Nouveau schéma (57-7), coexiste avec creneau/jours — NULL pour tout
  // rappel créé par l'écran actuel (avant 57-8).
  date: string | null;
  heure: string | null;
  recurrent: boolean | null;
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
    .select("id, user_id, creneau, jours, fuseau, last_sent_at, date, heure, recurrent")
    .eq("arme", true)
    .returns<ReminderRow[]>();

  if (queryError || !reminders) {
    console.error("[CRON REMINDERS] Query failed:", queryError?.message);
    return NextResponse.json({ error: "query_failed" }, { status: 500 });
  }

  const now = new Date();

  // 3bis. Désarmement automatique des rappels PONCTUELS (recurrent=false)
  // dont la date est strictement passée dans le fuseau de la personne
  // (57-7 §4) — intégré ici plutôt qu'un job séparé : ce cron tourne déjà
  // toutes les heures, pas besoin d'un mécanisme supplémentaire. Exclus de
  // `reminders` avant le calcul "dû" (un rappel passé n'est de toute façon
  // jamais dû, mais autant ne pas le réévaluer inutilement).
  let disarmed = 0;
  const stillArmed: ReminderRow[] = [];
  for (const r of reminders) {
    if (
      r.recurrent === false &&
      r.date !== null &&
      isPastOneTimeReminder(r.date, r.fuseau, now)
    ) {
      await supabaseService
        .from("reminders")
        .update({ arme: false, updated_at: now.toISOString() })
        .eq("id", r.id);
      disarmed++;
    } else {
      stillArmed.push(r);
    }
  }

  const due = stillArmed.filter((r) =>
    isReminderDueNow({
      fuseau: r.fuseau,
      creneau: r.creneau,
      jours: r.jours,
      // null -> undefined : le nouveau schéma (57-7) n'est détecté par
      // isReminderDueNow que si date/heure sont réellement fournis.
      date: r.date ?? undefined,
      heure: r.heure ?? undefined,
      recurrent: r.recurrent ?? undefined,
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
    // Vrai si au moins un abonnement existait pour tenter un envoi (succès,
    // nettoyage 404/410, ou autre échec — peu importe l'issue individuelle).
    // Distinct de "0 abonnement du tout" : dans ce cas last_sent_at ne doit
    // PAS bouger plus bas, sinon le nudge (57-5) croit le push géré alors
    // que rien n'a jamais été tenté et ne prend jamais le relais. Bug trouvé
    // et corrigé en 57-6 (confirmé par test croisé cron+nudge).
    let attempted = false;

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
        attempted = (subscriptions?.length ?? 0) > 0;
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

    // Marqué comme traité pour aujourd'hui UNIQUEMENT s'il y a eu au moins
    // une tentative d'envoi réelle (succès, nettoyage 404/410, ou autre
    // échec). Sans abonnement du tout, on ne touche pas last_sent_at : le
    // nudge (57-5) doit pouvoir prendre le relais. Le prochain créneau du
    // même rappel réessaiera naturellement dans tous les cas — jamais de
    // conséquence visible côté utilisatrice.
    if (attempted) {
      await supabaseService
        .from("reminders")
        .update({ last_sent_at: now.toISOString() })
        .eq("id", reminder.id);
    }
  }

  console.log(
    "[CRON REMINDERS] Done — rappels armés:",
    reminders.length,
    "| désarmés (ponctuels passés):",
    disarmed,
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
    disarmed,
    due: due.length,
    sent,
    cleaned,
    errors,
  });
}
