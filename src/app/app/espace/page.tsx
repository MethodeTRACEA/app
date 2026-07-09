"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  getCompletedSessionsDb,
  getShortTraces,
  type ShortTrace,
} from "@/lib/supabase-store";
import { getSessionSummariesByIds } from "@/lib/memory";
import { getTraceLabel } from "@/lib/trace-labels";
import { supabase } from "@/lib/supabase";
import type { SessionData } from "@/lib/types";

// ═══════════════════════════════════════════════════════════════════
// TRACÉA — Chantier 58 — /app/espace ("Ton espace")
// Squelette P2a : chargeur mutualisé (approfondies + traces courtes),
// états unifiés (chargement / connexion / compte vide), carte focale
// "Ta dernière traversée". La liste complète (P2b), les 4 éléments
// d'approfondie (P2c) et les agrégats (P2d) arrivent dans des patchs
// séparés — cf. docs/AUDIT_FUSION_TON_ESPACE.md et la spec du chantier 58.
// ═══════════════════════════════════════════════════════════════════

type SummaryLite = Awaited<ReturnType<typeof getSessionSummariesByIds>>[string];

// Format de date doux (repris de /app/ce-qui-change).
function formatTraceDate(iso: string): string {
  const d = new Date(iso);
  const heure = `${d.getHours()}h${String(d.getMinutes()).padStart(2, "0")}`;
  const now = new Date();
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, now)) return `Aujourd'hui · ${heure}`;
  if (sameDay(d, yesterday)) return `Hier · ${heure}`;
  const jour = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  return `${jour} · ${heure}`;
}

type FocalTrace =
  | { kind: "courte"; trace: ShortTrace }
  | { kind: "approfondie"; session: SessionData; summary: SummaryLite | undefined };

export default function EspacePage() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [shortTraces, setShortTraces] = useState<ShortTrace[]>([]);
  const [summariesById, setSummariesById] = useState<Record<string, SummaryLite>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const userId = user.id;
    let cancelled = false;

    Promise.all([getCompletedSessionsDb(userId), getShortTraces(userId)]).then(
      ([s, traces]) => {
        if (cancelled) return;
        setSessions(s);
        setShortTraces(traces);
        setLoading(false);

        const ids = s.map((x) => x.id);
        if (ids.length > 0) {
          getSessionSummariesByIds(supabase, userId, ids)
            .then((sums) => {
              if (!cancelled) setSummariesById(sums);
            })
            .catch(() => {});
        }
      }
    );

    return () => {
      cancelled = true;
    };
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
          Connecte-toi pour retrouver ton espace.
        </p>
        <Link href="/app/connexion" className="btn-primary inline-block">
          Se connecter
        </Link>
      </div>
    );
  }

  // getCompletedSessionsDb / getShortTraces trient déjà plus récent d'abord.
  const latestApprofondie = sessions[0];
  const latestCourte = shortTraces[0];

  let focal: FocalTrace | null = null;
  if (latestApprofondie && latestCourte) {
    focal =
      new Date(latestApprofondie.date) >= new Date(latestCourte.date)
        ? { kind: "approfondie", session: latestApprofondie, summary: summariesById[latestApprofondie.id] }
        : { kind: "courte", trace: latestCourte };
  } else if (latestApprofondie) {
    focal = { kind: "approfondie", session: latestApprofondie, summary: summariesById[latestApprofondie.id] };
  } else if (latestCourte) {
    focal = { kind: "courte", trace: latestCourte };
  }

  // ── Styles ───────────────────────────────────────────────────────
  const blockStyle: React.CSSProperties = {
    background: "rgba(111,106,100,0.18)",
    border: "1px solid rgba(240,230,214,0.10)",
    borderRadius: 24,
    padding: "28px 26px",
    boxShadow: "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
  };
  // Carte focale : plus grande, plus contrastée (point focal de la page, §3).
  const focalStyle: React.CSSProperties = {
    ...blockStyle,
    padding: "32px 28px",
    border: "1px solid rgba(201,123,106,0.30)",
    boxShadow: "0 26px 56px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.05)",
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
  const lineStyle: React.CSSProperties = { ...blockTextStyle, fontSize: "1rem", margin: 0 };

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
          Ton espace
        </h1>
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
          Ce qui se dépose, ce qui t&apos;aide, ce que tu poses ici.
        </p>

        {/* ── Compte vide (état 0 de la future liste, migré d'historique) ── */}
        {!focal && (
          <div style={blockStyle}>
            <p className="font-body" style={blockTextStyle}>
              Aucune traversée pour le moment.
            </p>
            <p className="font-body" style={{ ...blockTextStyle, opacity: 0.7, marginTop: 8 }}>
              Quand tu en auras fait une, tu la retrouveras ici.
            </p>
          </div>
        )}

        {/* ── Carte focale — Ta dernière traversée ── */}
        {focal && focal.kind === "courte" && (
          <div style={focal.trace.partielle ? { ...focalStyle, border: "1px dashed rgba(240,230,214,0.30)" } : focalStyle}>
            <p className="font-sans" style={kickerStyle}>
              Ta dernière traversée · {formatTraceDate(focal.trace.date)}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {getTraceLabel("ressenti", focal.trace.ressenti) && (
                <p className="font-body" style={lineStyle}>
                  Ce qui était là : {getTraceLabel("ressenti", focal.trace.ressenti)}
                </p>
              )}
              {getTraceLabel("corps", focal.trace.corps) && (
                <p className="font-body" style={lineStyle}>
                  Situé plutôt dans : {getTraceLabel("corps", focal.trace.corps)}
                </p>
              )}
              {getTraceLabel("ancrage", focal.trace.ancrer) && (
                <p className="font-body" style={lineStyle}>
                  L&apos;appui que tu as choisi : {getTraceLabel("ancrage", focal.trace.ancrer)}
                </p>
              )}
              {focal.trace.geste && (
                <p className="font-body" style={lineStyle}>
                  Le pas que tu t&apos;étais proposé : {focal.trace.geste}
                </p>
              )}
            </div>
            {focal.trace.partielle && (
              <p className="font-body" style={{ ...lineStyle, fontStyle: "italic", opacity: 0.6, marginTop: 8 }}>
                Une traversée que tu as gardée pour toi.
              </p>
            )}
          </div>
        )}

        {focal && focal.kind === "approfondie" && (
          <div style={focalStyle}>
            <p className="font-sans" style={kickerStyle}>
              Ta dernière traversée · {formatTraceDate(focal.session.date)}
            </p>
            {focal.summary?.narrative_summary ? (
              <>
                <p className="font-body" style={{ ...lineStyle, opacity: 0.7, marginBottom: 4 }}>
                  Trace à retenir
                </p>
                <p className="font-body" style={lineStyle}>
                  {focal.summary.narrative_summary}
                </p>
              </>
            ) : focal.session.steps?.traverser ? (
              <>
                <p className="font-body" style={{ ...lineStyle, opacity: 0.7, marginBottom: 4 }}>
                  Ce qui s&apos;est passé :
                </p>
                <p className="font-body" style={lineStyle}>
                  {focal.session.steps.traverser}
                </p>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
