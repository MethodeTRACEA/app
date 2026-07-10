"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  getRemindersForNudgeDb,
  markReminderNudgeShownDb,
  type ReminderForNudge,
} from "@/lib/supabase-store";
import { isReminderDueNow, isSameLocalDay } from "@/lib/reminder-schedule";

// ════════════════════════════════════════════════════════════
// TRACÉA — Chantier 57 « Ancrage contextuel » — Brique 57-5
// Filet in-app pour toute personne sans notification active (permission
// refusée, iOS non installé, navigateur incompatible, ou push tenté mais
// jamais reçu). Carte NON bloquante sur l'accueil connecté /app uniquement,
// dans le même esprit que GesteRetourCard (35-B) mais un mécanisme
// entièrement distinct (rappel temporel, pas retour de geste).
// Wording figé (spec 57-0b) : NE RIEN reformuler ici.
//
// Gating (§4 brief 57-5) : un rappel dû dont le push a déjà été géré
// aujourd'hui (last_sent_at = aujourd'hui, qu'il ait réussi ou juste été
// tenté) n'affiche PAS aussi le nudge — simplification volontaire actée
// avec Alyson : le rappel resonnera de toute façon au prochain créneau si
// le push a échoué silencieusement, pas besoin de distinguer réussite et
// tentative ici.
// ════════════════════════════════════════════════════════════

export function ReminderNudge({
  onVisibilityChange,
}: {
  // Permet à la page parente de coordonner l'affichage avec InstallPrompt
  // (§5 : pas deux demandes différentes en même temps de façon envahissante).
  // Optionnel — le composant reste 100% autonome sans ce prop.
  onVisibilityChange?: (visible: boolean) => void;
}) {
  const { user } = useAuth();
  const [candidate, setCandidate] = useState<ReminderForNudge | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    getRemindersForNudgeDb(user.id).then((reminders) => {
      if (cancelled) return;
      const now = new Date();

      const eligible = reminders.find(
        (r) =>
          isReminderDueNow({
            fuseau: r.fuseau,
            creneau: r.creneau ?? undefined,
            jours: r.jours,
            date: r.date ?? undefined,
            heure: r.heure ?? undefined,
            recurrent: r.recurrent ?? undefined,
            lastSentAt: r.lastSentAt,
            now,
          }) && !isSameLocalDay(r.nudgeShownAt, now, r.fuseau)
      );

      if (!eligible) return;
      setCandidate(eligible);
      // Marqué dès l'affichage réel, pas avant — une fois par jour maximum.
      markReminderNudgeShownDb(eligible.id).catch(() => {});
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    onVisibilityChange?.(!!candidate && !dismissed);
    // onVisibilityChange volontairement absent des deps : c'est une callback
    // de coordination d'affichage, pas une valeur dont ce composant dépend.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate, dismissed]);

  // Rien à montrer : pas connecté, aucun rappel dû sans push géré, ou
  // passé. Silencieux, non bloquant (aucune modale).
  if (!user || !candidate || dismissed) return null;

  const blockStyle: React.CSSProperties = {
    background: "rgba(111,106,100,0.15)",
    border: "1px solid rgba(240,230,214,0.085)",
    borderRadius: 22,
    padding: "22px 24px",
    boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
  };

  const textStyle: React.CSSProperties = {
    fontFamily: "var(--font-body, 'Cormorant Garamond', serif)",
    fontSize: "1rem",
    fontWeight: 300,
    color: "rgba(240,230,214,0.88)",
    lineHeight: 1.55,
  };

  return (
    <div style={blockStyle}>
      <p className="font-body" style={textStyle}>
        C&apos;est le moment que tu avais choisi. Si tu veux, tu peux
        commencer une traversée.
      </p>
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <Link
          href="/start"
          className="w-full text-center rounded-[18px] px-5 py-3 font-sans text-sm transition-all duration-200 border border-[rgba(232,216,199,0.15)] t-text-secondary hover:border-[rgba(232,216,199,0.30)] hover:t-text-beige"
          style={{ background: "transparent" }}
        >
          Choisir ma traversée
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="w-full text-center font-inter text-xs t-text-ghost py-1.5 opacity-60 hover:opacity-100 transition-opacity"
        >
          Pas maintenant
        </button>
      </div>
    </div>
  );
}
