"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getCompletedSessionsDb } from "@/lib/supabase-store";
import { getMemoryProfileClient, type MemoryProfile } from "@/lib/memory";
import { supabase } from "@/lib/supabase";
import type { SessionData } from "@/lib/types";
import Link from "next/link";

// ── APPUIS — fallback si effective_actions absentes ──────────────

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
    .slice(0, 3)
    .map(([action]) => action);
}

// ── Page ─────────────────────────────────────────────────────────

export default function CeQuiChangePage() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [memoryProfile, setMemoryProfile] = useState<MemoryProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getCompletedSessionsDb(user.id),
      getMemoryProfileClient(supabase, user.id),
    ]).then(([s, profile]) => {
      setSessions(s);
      setMemoryProfile(profile);
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

  // ── Données mémoire (avec garde-fous, jamais d'amplification) ──
  const n = sessions.length;
  const recurringPatterns =
    memoryProfile?.recurring_patterns?.filter(Boolean) ?? [];
  const commonTriggers =
    memoryProfile?.common_triggers?.filter(Boolean) ?? [];
  const effectiveActions =
    memoryProfile?.effective_actions?.filter(Boolean) ?? [];
  const memTotal = memoryProfile?.total_sessions ?? 0;

  // Bloc 1 — priorité recurring_patterns, fallback common_triggers
  const block1Items =
    recurringPatterns.length > 0
      ? recurringPatterns.slice(0, 3)
      : commonTriggers.slice(0, 3);

  // Bloc 2 — priorité effective_actions, fallback computeAppuisBlock
  const fallbackAppuis = computeAppuisBlock(sessions);
  const block2Items =
    effectiveActions.length > 0
      ? effectiveActions.slice(0, 3)
      : fallbackAppuis;

  const hasMemoryContent = block1Items.length > 0 || block2Items.length > 0;

  // ── Styles V3 ────────────────────────────────────────────────────
  const blockStyle: React.CSSProperties = {
    background: "rgba(111,106,100,0.18)",
    border: "1px solid rgba(240,230,214,0.10)",
    borderRadius: 24,
    padding: "28px 26px",
    boxShadow:
      "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
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

  const listStyle: React.CSSProperties = {
    listStyle: "none",
    padding: 0,
    margin: "16px 0 0 0",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  };

  const listItemStyle: React.CSSProperties = {
    fontFamily: "var(--font-body, 'Cormorant Garamond', serif)",
    fontSize: "1.05rem",
    fontWeight: 300,
    color: "rgba(240,230,214,0.88)",
    lineHeight: 1.5,
    display: "flex",
    gap: 10,
  };

  const bulletStyle: React.CSSProperties = {
    color: "#C97B6A",
    flexShrink: 0,
    lineHeight: 1.5,
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
          background:
            "radial-gradient(circle at 50% 32%, rgba(201,123,106,0.28) 0%, rgba(201,123,106,0.18) 18%, rgba(201,123,106,0.10) 32%, rgba(26,18,13,0.82) 55%, rgba(26,18,13,1) 75%)",
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
          Ce qui revient, ce qui t&apos;aide, ce que tes traversées montrent.
        </p>

        {/* ── Cas 0 — aucune session ── */}
        {n === 0 && (
          <div style={blockStyle}>
            <p className="font-body" style={blockTextStyle}>
              Cet espace se remplira au fil de tes traversées.
            </p>
          </div>
        )}

        {/* ── Cas 1 — une seule session ── */}
        {n === 1 && (
          <div style={blockStyle}>
            <p className="font-body" style={blockTextStyle}>
              Une première trace existe.
              <br />
              <br />
              Il faut encore quelques traversées pour voir ce qui revient
              vraiment.
            </p>
          </div>
        )}

        {/* ── Cas 2 — sessions présentes mais mémoire pas encore prête ── */}
        {n >= 2 && !hasMemoryContent && (
          <div style={blockStyle}>
            <p className="font-body" style={blockTextStyle}>
              Tes traversées sont bien enregistrées.
              <br />
              <br />
              Avec quelques traversées de plus, ce qui revient apparaîtra ici.
            </p>
          </div>
        )}

        {/* ── Cas 3 — mémoire disponible : 3 blocs ── */}
        {n >= 2 && hasMemoryContent && (
          <>
            {/* Bloc 1 — Ce qui revient souvent */}
            {block1Items.length > 0 && (
              <div style={blockStyle}>
                <p className="font-sans" style={kickerStyle}>
                  Ce qui revient souvent
                </p>
                <p className="font-body" style={blockTextStyle}>
                  Dans tes dernières traversées, certaines choses apparaissent
                  plusieurs fois.
                </p>
                <ul style={listStyle}>
                  {block1Items.map((item, i) => (
                    <li key={`b1-${i}`} style={listItemStyle}>
                      <span style={bulletStyle} aria-hidden="true">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bloc 2 — Ce qui t'aide déjà */}
            {block2Items.length > 0 && (
              <div style={blockStyle}>
                <p className="font-sans" style={kickerStyle}>
                  Ce qui t&apos;aide déjà
                </p>
                <p className="font-body" style={blockTextStyle}>
                  Des appuis reviennent dans tes traversées.
                  <br />
                  Tu peux les retrouver quand ça remonte.
                </p>
                <ul style={listStyle}>
                  {block2Items.map((item, i) => (
                    <li key={`b2-${i}`} style={listItemStyle}>
                      <span style={bulletStyle} aria-hidden="true">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bloc 3 — Ce qui se construit */}
            <div style={blockStyle}>
              <p className="font-sans" style={kickerStyle}>
                Ce qui se construit
              </p>
              {memTotal >= 2 ? (
                <p className="font-body" style={blockTextStyle}>
                  Tu as déjà {memTotal} traversées enregistrées.
                  <br />
                  Ce n&apos;est pas un score.
                  <br />
                  C&apos;est simplement ce que tu as posé ici.
                </p>
              ) : (
                <p className="font-body" style={blockTextStyle}>
                  Plusieurs traversées sont déjà enregistrées.
                  <br />
                  Elles restent ici, sans avoir besoin d&apos;être interprétées.
                </p>
              )}
            </div>
          </>
        )}

        {/* ── Footer discret (inchangé) ── */}
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
            style={{
              fontSize: 11,
              color: "rgba(240,230,214,0.55)",
              letterSpacing: "0.12em",
            }}
          >
            Stabilit&eacute; &eacute;motionnelle &middot; Entra&icirc;nement
            physiologique
          </p>
        </div>
      </div>
    </div>
  );
}
