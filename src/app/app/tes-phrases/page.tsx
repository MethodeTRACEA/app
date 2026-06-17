"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getRecentInnerTruths } from "@/lib/memory";
import { supabase } from "@/lib/supabase";

// Date douce : jour + mois, sans heure (ex. « 9 juin »).
function formatSoftDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
}

export default function TesPhrasesPage() {
  const { user, loading: authLoading } = useAuth();
  const [truths, setTruths] = useState<{ inner_truth: string; created_at: string }[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Chargement non bloquant. Les 50 dernières vérités (déjà triées
  // décroissant, non vides, non exclues). Dégrade en silence.
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getRecentInnerTruths(supabase, user.id, 50)
      .then((rows) => {
        if (cancelled) return;
        setTruths(rows);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  // ── Styles ───────────────────────────────────────────────────────
  const pageStyle: React.CSSProperties = {
    minHeight: "calc(100svh - 56px)",
    background:
      "radial-gradient(ellipse at 50% 100%, rgba(184,99,79,0.13) 0%, rgba(184,99,79,0.05) 34%, transparent 66%), " +
      "radial-gradient(ellipse at 15% 0%, rgba(111,106,100,0.16) 0%, transparent 58%), " +
      "#1A120D",
    position: "relative",
  };
  const innerStyle: React.CSSProperties = {
    position: "relative",
    zIndex: 1,
    maxWidth: 640,
    margin: "0 auto",
    padding: "48px 20px 64px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  };
  const titleStyle: React.CSSProperties = {
    fontSize: "clamp(1.75rem, 5vw, 2.25rem)",
    fontWeight: 300,
    color: "#F0E6D6",
    lineHeight: 1.15,
    letterSpacing: "-0.01em",
    margin: 0,
  };
  const introStyle: React.CSSProperties = {
    fontSize: "1rem",
    fontWeight: 300,
    color: "rgba(240,230,214,0.60)",
    lineHeight: 1.5,
    marginTop: -8,
  };
  const cardStyle: React.CSSProperties = {
    background: "rgba(111,106,100,0.18)",
    border: "1px solid rgba(240,230,214,0.10)",
    borderRadius: 24,
    padding: "40px 28px",
    boxShadow:
      "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
    textAlign: "center",
  };
  const phraseStyle: React.CSSProperties = {
    fontFamily: "var(--font-body, 'Cormorant Garamond', serif)",
    fontSize: "clamp(1.5rem, 5vw, 2rem)",
    fontWeight: 300,
    color: "#F0E6D6",
    lineHeight: 1.4,
  };
  const dateStyle: React.CSSProperties = {
    fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
    fontSize: 12,
    color: "rgba(240,230,214,0.45)",
    letterSpacing: "0.04em",
    marginTop: 20,
  };
  const navRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 4,
  };
  const navBtn = (enabled: boolean): React.CSSProperties => ({
    fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
    fontSize: 13,
    letterSpacing: "0.04em",
    color: enabled ? "rgba(240,230,214,0.70)" : "rgba(240,230,214,0.20)",
    background: "transparent",
    border: "none",
    cursor: enabled ? "pointer" : "default",
    padding: "8px 4px",
  });

  const current = truths[index];
  const showLoading = authLoading || loading;

  return (
    <div style={pageStyle}>
      <div style={innerStyle}>
        <h1 className="font-body" style={titleStyle}>
          Ce que tu as su dire
        </h1>
        <p className="font-body" style={introStyle}>
          Des choses que tu as formulées en traversant.
        </p>

        {showLoading ? (
          <div style={cardStyle}>
            <p className="font-body" style={{ ...phraseStyle, fontSize: "1rem", color: "rgba(240,230,214,0.55)" }}>
              Chargement…
            </p>
          </div>
        ) : !current ? (
          <div style={cardStyle}>
            <p className="font-body" style={{ ...phraseStyle, fontSize: "1.05rem", color: "rgba(240,230,214,0.80)" }}>
              Cet espace se remplira au fil de tes traversées.
            </p>
          </div>
        ) : (
          <>
            <div style={cardStyle}>
              <p className="font-body" style={phraseStyle}>
                «&nbsp;{current.inner_truth}&nbsp;»
              </p>
              <p className="font-sans" style={dateStyle}>
                posée le {formatSoftDate(current.created_at)}
              </p>
            </div>

            <div style={navRowStyle}>
              <button
                type="button"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                style={navBtn(index > 0)}
                aria-label="Vérité précédente (plus récente)"
              >
                ‹ Précédente
              </button>
              <button
                type="button"
                onClick={() => setIndex((i) => Math.min(truths.length - 1, i + 1))}
                disabled={index >= truths.length - 1}
                style={navBtn(index < truths.length - 1)}
                aria-label="Vérité suivante (plus ancienne)"
              >
                Suivante ›
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
