"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { useAuth } from "@/lib/auth-context";
import {
  getEligibleGesteDb,
  setGesteStatutDb,
  type EligibleGeste,
  type GesteStatut,
} from "@/lib/supabase-store";

// ════════════════════════════════════════════════════════════
// TRACÉA — Chantier 35-B « Le retour du geste » — Brique B-2
// Carte NON bloquante sur l'accueil connecté /app uniquement.
// Demande ce qu'est devenu le dernier geste éligible (voir getEligibleGesteDb).
// Déterministe de bout en bout : AUCUN LLM sur cette surface.
// Wordings figés / audités B-0 : NE RIEN reformuler ici.
// ════════════════════════════════════════════════════════════

// Bouton → statut écrit → accusé de réception affiché.
// « Passer » n'a aucun message : la carte se ferme (accusé null).
const CHOICES: { statut: GesteStatut; label: string; ack: string | null }[] = [
  { statut: "fait", label: "C'est fait", ack: "C'est noté. Tu l'as fait." },
  { statut: "pas_encore", label: "Pas encore", ack: "C'est ok. Le geste reste posé là." },
  {
    statut: "autre_forme",
    label: "Ça a pris une autre forme",
    ack: "C'est ok comme ça. Tu as fait à ta façon.",
  },
  { statut: "passe", label: "Passer", ack: null },
];

export function GesteRetourCard() {
  const { user, hasPremiumAccess } = useAuth();
  const [geste, setGeste] = useState<EligibleGeste | null>(null);
  const [ack, setAck] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Gating §2.5 : la boucle interactive est une surface d'essai/premium.
    if (!user || !hasPremiumAccess) return;
    let cancelled = false;
    getEligibleGesteDb(user.id)
      .then((g) => {
        if (!cancelled) setGeste(g);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, hasPremiumAccess]);

  // Rien à montrer : pas connecté, hors essai/premium, aucun geste éligible,
  // ou déjà passé. Silencieux, non bloquant (aucune modale).
  if (!user || !hasPremiumAccess || !geste || dismissed) return null;

  async function respond(choice: (typeof CHOICES)[number]) {
    if (!geste || busy) return;
    setBusy(true);
    // Accusé optimiste : le statut est une donnée à faible enjeu, rien créé par
    // l'utilisatrice n'est perdu. Un échec d'écriture n'est PAS silencieux → Sentry.
    const { error } = await setGesteStatutDb(geste.sessionId, choice.statut);
    if (error) {
      Sentry.captureException(new Error(error), {
        tags: { feature: "geste_statut_write" },
      });
    }
    if (choice.statut === "passe") {
      setDismissed(true); // aucun message, la carte se ferme
    } else {
      setAck(choice.ack); // affiche l'accusé, la carte se résout
    }
  }

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

  // Phrases figées B-0, rendues depuis des strings (apostrophes droites, verbatim).
  // Le rappel du geste reste dans les deux états ; la clause d'invitation
  // (encore vraie tant qu'on n'a pas répondu) disparaît dans l'état accusé.
  const recall = `La dernière fois, tu avais choisi un geste : « ${geste.label} ».`;
  const invitation = "Tu peux dire ce que c'est devenu, ou passer.";

  return (
    <div style={blockStyle}>
      <p className="font-body" style={textStyle}>
        {ack ? recall : `${recall} ${invitation}`}
      </p>

      {ack ? (
        <p
          className="font-body"
          style={{ ...textStyle, marginTop: 14, color: "rgba(240,230,214,0.66)" }}
        >
          {ack}
        </p>
      ) : (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {CHOICES.map((c) => (
            <button
              key={c.statut}
              type="button"
              disabled={busy}
              onClick={() => respond(c)}
              className="w-full text-left rounded-[18px] px-5 py-3 font-sans text-sm transition-all duration-200 border border-[rgba(232,216,199,0.15)] t-text-secondary hover:border-[rgba(232,216,199,0.30)] hover:t-text-beige disabled:opacity-50"
              style={{
                background: "transparent",
                // « Passer » reste visible, sans emphase, sans conséquence.
                opacity: c.statut === "passe" && !busy ? 0.7 : undefined,
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
