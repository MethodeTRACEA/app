"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getCompletedSessionsDb } from "@/lib/supabase-store";
import type { SessionData } from "@/lib/types";
import Link from "next/link";

// ── NORMALISATION AFFICHAGE — je → tu ────────────────────────────

function normalizeActionDisplay(action: string): string {
  return action
    .replace(/\bje\b/gi, "tu")
    .replace(/\bj['']/gi, "tu ")
    .replace(/\bme\b/gi, "te")
    .replace(/\bmon\b/gi, "ton")
    .replace(/\bma\b/gi, "ta")
    .replace(/\bmes\b/gi, "tes")
    .trim();
}

// ── APPUIS GLOBAUX ────────────────────────────────────────────────

function computeAppuisBlock(sessions: SessionData[]): string[] {
  const counts: Record<string, number> = {};
  for (const s of sessions) {
    if (!s.actionAlignee) continue;
    const key = s.actionAlignee.toLowerCase().trim();
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.entries(counts)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([action]) => action);
}

// ── Page ─────────────────────────────────────────────────────────

export default function CeQuiChangePage() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getCompletedSessionsDb(user.id).then((data) => {
      setSessions(data);
      setLoading(false);
    });
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="font-serif text-2xl text-terra animate-pulse-gentle">
          Chargement...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="font-serif text-2xl text-espresso mb-4">
          Connexion requise
        </h1>
        <p className="text-warm-gray mb-6">
          Connecte-toi pour voir ce qui change.
        </p>
        <Link href="/app/connexion" className="btn-primary inline-block">
          Se connecter
        </Link>
      </div>
    );
  }

  const appuis = computeAppuisBlock(sessions);

  const n = sessions.length;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentCount = sessions.filter((s) => new Date(s.date) >= thirtyDaysAgo).length;

  const rythmeText =
    recentCount >= 2 ? "Tu as traversé plusieurs fois ce mois-ci."
    : n === 0 ? "Ta première traversée ouvrira le chemin."
    : n <= 2 ? "Tu commences à laisser une trace."
    : n <= 5 ? "Tu reviens. C'est déjà un mouvement."
    : "Un rythme commence à se dessiner.";

  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const recentActionSessions = sessions
    .filter((s) => s.actionAlignee?.trim())
    .filter((s) => new Date(s.date) >= sixtyDaysAgo)
    .slice(0, 3);
  const recentActionCounts: Record<string, number> = {};
  for (const s of recentActionSessions) {
    const key = s.actionAlignee!.trim().toLowerCase();
    recentActionCounts[key] = (recentActionCounts[key] ?? 0) + 1;
  }
  const recentRepeatedAction =
    Object.entries(recentActionCounts).find(([, count]) => count >= 2)?.[0] ?? null;

  const recentRepeatedActionDisplay = recentRepeatedAction
    ? normalizeActionDisplay(recentRepeatedAction)
    : null;
  const appuisDisplay = appuis.map(normalizeActionDisplay);

  let transformationLines: string[] = [];
  if (n === 1) {
    transformationLines = ["Tu as commencé à t'arrêter."];
  } else if (n >= 2 && recentCount === 0) {
    transformationLines = ["Tu es déjà revenu(e) plusieurs fois."];
  } else if (n >= 2 && recentCount >= 1 && recentCount < 2) {
    transformationLines = ["Tu reviens quand ça s'active."];
  } else if (n >= 3 && recentCount >= 2) {
    transformationLines = [
      "Tu ne laisses plus tout passer comme avant.",
      "Tu ne fais plus comme avant.",
    ];
  }

  // ── Styles V3 ────────────────────────────────────────────────────
  const blockStyle: React.CSSProperties = {
    background: "rgba(111,106,100,0.18)",
    border: "1px solid rgba(240,230,214,0.10)",
    borderRadius: 24,
    padding: "28px 26px",
    boxShadow: "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
  };

  const kickerStyle: React.CSSProperties = {
    fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
    fontSize: 12,
    fontWeight: 400,
    color: "#C97B6A",
    letterSpacing: "0.20em",
    textTransform: "uppercase" as const,
    marginBottom: 18,
  };

  const blockTextStyle: React.CSSProperties = {
    fontFamily: "var(--font-body, 'Cormorant Garamond', serif)",
    fontSize: "1.05rem",
    fontWeight: 300,
    color: "#F0E6D6",
    lineHeight: 1.6,
  };

  const emStyle: React.CSSProperties = {
    color: "rgba(240,230,214,0.70)",
    fontStyle: "italic",
  };

  return (
    <div
      style={{
        minHeight: "calc(100svh - 56px)",
        background:
          "radial-gradient(ellipse at 50% 100%, rgba(184,99,79,0.13) 0%, rgba(184,99,79,0.05) 34%, transparent 66%), " +
          "radial-gradient(ellipse at 15% 0%, rgba(111,106,100,0.16) 0%, transparent 58%), " +
          "#1A120D",
        position: "relative",
      }}
    >
      {/* Halo V3 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background: "radial-gradient(circle at 50% 35%, rgba(201,123,106,0.22) 0%, rgba(201,123,106,0.12) 25%, rgba(26,18,13,0.85) 55%, rgba(26,18,13,1) 75%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 640,
          margin: "0 auto",
          padding: "48px 20px 64px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Titre */}
        <h1
          className="font-body"
          style={{
            fontSize: "clamp(1.75rem, 5vw, 2.25rem)",
            fontWeight: 300,
            color: "#F0E6D6",
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            marginBottom: 0,
          }}
        >
          Ce qui change
        </h1>

        {/* Sous-titre */}
        <p
          className="font-body"
          style={{
            fontSize: "1rem",
            fontWeight: 300,
            color: "rgba(240,230,214,0.60)",
            lineHeight: 1.5,
            marginTop: -8,
          }}
        >
          Ce qui se construit en toi, traversée après traversée.
        </p>

        {/* ── TON RYTHME ── */}
        <div style={blockStyle}>
          <p className="font-sans" style={kickerStyle}>
            Ton rythme
          </p>
          <p className="font-body" style={blockTextStyle}>
            {rythmeText}
          </p>
        </div>

        {/* ── CE QUI BOUGE EN TOI ── */}
        {transformationLines.length > 0 && (
          <div style={blockStyle}>
            <p className="font-sans" style={kickerStyle}>
              Ce qui bouge en toi
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {transformationLines.map((line, index) => (
                <p key={index} className="font-body" style={blockTextStyle}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* ── TON CHEMIN DE RETOUR ── */}
        <div style={{ ...blockStyle, display: "flex", flexDirection: "column", gap: 16 }}>
          <p className="font-sans" style={kickerStyle}>
            Ton chemin de retour
          </p>

          {recentRepeatedActionDisplay ? (
            <p className="font-body" style={blockTextStyle}>
              Quand ça s&apos;active,{" "}
              <br />
              tu reviens à :
              <br />
              <br />
              <em style={emStyle}>« {recentRepeatedActionDisplay} »</em>.
            </p>
          ) : recentActionSessions.length >= 2 ? (
            <>
              <p className="font-body" style={blockTextStyle}>Tu explores encore plusieurs façons de revenir.</p>
              <p className="font-body" style={blockTextStyle}>Rien n&apos;est figé, mais tu reviens.</p>
            </>
          ) : appuisDisplay.length === 0 ? (
            <p className="font-body" style={blockTextStyle}>
              Ton chemin de retour se dessine traversée après traversée.
            </p>
          ) : appuisDisplay.length === 1 ? (
            <p className="font-body" style={blockTextStyle}>
              Tu reviens souvent à :{" "}
              <em style={emStyle}>« {appuisDisplay[0]} »</em>.
            </p>
          ) : (
            <p className="font-body" style={blockTextStyle}>
              Tu reviens souvent à :{" "}
              <em style={emStyle}>« {appuisDisplay[0]} »</em> et{" "}
              <em style={emStyle}>« {appuisDisplay[1]} »</em>.
            </p>
          )}
        </div>

        {/* ── CE QUI SE STABILISE ── */}
        {sessions.length >= 2 && (
          <div style={blockStyle}>
            <p className="font-sans" style={kickerStyle}>
              Ce qui se stabilise
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p className="font-body" style={blockTextStyle}>
                Tu reviens.
              </p>
              <p className="font-body" style={blockTextStyle}>
                Tu traverses.
              </p>
              <p className="font-body" style={blockTextStyle}>
                Tu fais un pas.
              </p>
            </div>
          </div>
        )}

        {/* ── Footer discret ── */}
        <div
          style={{
            marginTop: 48,
            borderTop: "1px solid rgba(240,230,214,0.07)",
            paddingTop: 24,
            textAlign: "center",
            opacity: 0.5,
          }}
        >
          <p
            className="font-sans"
            style={{ fontSize: 11, color: "rgba(240,230,214,0.55)", letterSpacing: "0.12em" }}
          >
            Stabilit&eacute; &eacute;motionnelle &middot; Entra&icirc;nement physiologique
          </p>
        </div>
      </div>
    </div>
  );
}
