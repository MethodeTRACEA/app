"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  getCompletedSessionsDb,
  getShortTraces,
  getRecentGestesDb,
  updateSessionDb,
  deleteSessionDb,
  type ShortTrace,
  type RecentGeste,
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

type UnifiedItem =
  | { kind: "courte"; date: string; trace: ShortTrace }
  | { kind: "approfondie"; date: string; session: SessionData };

const LIST_PAGE_SIZE = 5;

// ── Styles partagés (focale + liste) ────────────────────────────────
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
// Carte d'item de liste : même langage visuel, plus discrète que la focale.
const listCardStyle: React.CSSProperties = {
  background: "rgba(111,106,100,0.14)",
  border: "1px solid rgba(240,230,214,0.085)",
  borderRadius: 22,
  padding: "22px 24px",
  boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
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
const bulletStyle: React.CSSProperties = { color: "#C97B6A", flexShrink: 0, lineHeight: 1.5 };

// Les 4 lignes verrouillées d'une trace courte — partagées entre la carte
// focale et son entrée dans la liste unifiée (Chantier 58, D1).
function CourteTraceLines({ trace }: { trace: ShortTrace }) {
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {getTraceLabel("ressenti", trace.ressenti) && (
          <p className="font-body" style={lineStyle}>
            Ce qui était là : {getTraceLabel("ressenti", trace.ressenti)}
          </p>
        )}
        {getTraceLabel("corps", trace.corps) && (
          <p className="font-body" style={lineStyle}>
            Situé plutôt dans : {getTraceLabel("corps", trace.corps)}
          </p>
        )}
        {getTraceLabel("ancrage", trace.ancrer) && (
          <p className="font-body" style={lineStyle}>
            L&apos;appui que tu as choisi : {getTraceLabel("ancrage", trace.ancrer)}
          </p>
        )}
        {trace.geste && (
          <p className="font-body" style={lineStyle}>
            Le pas que tu t&apos;étais proposé : {trace.geste}
          </p>
        )}
      </div>
      {trace.partielle && (
        <p className="font-body" style={{ ...lineStyle, fontStyle: "italic", opacity: 0.6, marginTop: 8 }}>
          Une traversée que tu as gardée pour toi.
        </p>
      )}
    </>
  );
}

// Aperçu replié d'une trace approfondie (repris d'/app/historique) — date +
// citation courte + émotions dominantes. L'accordéon complet arrive en P2c.
function ApprofondiePreview({ session, summary }: { session: SessionData; summary: SummaryLite | undefined }) {
  const pivotText = summary?.inner_truth || session.veriteInterieure || session.emotionPrimaire || "";
  const pivotIsQuote = !!(summary?.inner_truth || session.veriteInterieure);
  const previewEmotions = (summary?.dominant_emotions ?? [])
    .filter((e) => e && e.trim() !== "")
    .slice(0, 2);
  return (
    <div>
      <p className="font-body" style={{ fontSize: "1rem", fontWeight: 400, color: "#F0E6D6", lineHeight: 1 }}>
        {new Date(session.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
      </p>
      {pivotText && (
        <p
          className="font-body"
          style={{
            fontSize: "0.9rem",
            fontStyle: "italic",
            fontWeight: 300,
            color: "rgba(240,230,214,0.64)",
            marginTop: 6,
          }}
        >
          {pivotIsQuote ? `"${pivotText}"` : pivotText}
        </p>
      )}
      {previewEmotions.length > 0 && (
        <p
          className="font-sans"
          style={{ fontSize: 11, fontWeight: 400, color: "rgba(240,230,214,0.48)", marginTop: 4, letterSpacing: "0.04em" }}
        >
          {previewEmotions.join(" · ")}
        </p>
      )}
    </div>
  );
}

// Item de liste d'une trace approfondie — aperçu replié + accordéon complet
// (Ce qui s'est passé, Trace à retenir, miroir, note, Supprimer). Migré tel
// quel depuis /app/historique (Chantier 58, P2c).
function ApprofondieListItem({
  session,
  summary,
  isExpanded,
  onToggle,
  mirrorOpen,
  onToggleMirror,
  editingNote,
  noteText,
  onNoteTextChange,
  onStartEditNote,
  onSaveNote,
  onCancelNote,
  onDelete,
}: {
  session: SessionData;
  summary: SummaryLite | undefined;
  isExpanded: boolean;
  onToggle: () => void;
  mirrorOpen: boolean;
  onToggleMirror: () => void;
  editingNote: boolean;
  noteText: string;
  onNoteTextChange: (v: string) => void;
  onStartEditNote: () => void;
  onSaveNote: () => void;
  onCancelNote: () => void;
  onDelete: () => void;
}) {
  return (
    <div style={listCardStyle}>
      <button type="button" onClick={onToggle} className="w-full text-left">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <ApprofondiePreview session={session} summary={summary} />
          </div>
          <span
            style={{
              color: "rgba(240,230,214,0.25)",
              fontSize: 20,
              transition: "transform 0.2s",
              transform: isExpanded ? "rotate(90deg)" : "none",
              lineHeight: 1,
              flexShrink: 0,
              marginLeft: 12,
            }}
          >
            ›
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="animate-fade-up" style={{ paddingTop: 20, borderTop: "1px solid rgba(240,230,214,0.07)", marginTop: 16 }}>
          {session.steps.traverser && (
            <div style={{ marginBottom: 16 }}>
              <p className="font-sans" style={{ fontSize: 11, color: "rgba(240,230,214,0.48)", marginBottom: 6, letterSpacing: "0.10em" }}>
                Ce qui s&apos;est passé :
              </p>
              <p className="font-body" style={{ fontSize: "0.9rem", fontStyle: "italic", color: "rgba(240,230,214,0.60)", lineHeight: 1.55 }}>
                {session.steps.traverser}
              </p>
            </div>
          )}

          {summary?.narrative_summary && summary.narrative_summary.trim() !== "" && (
            <div
              style={{
                marginBottom: 16,
                background: "rgba(70,55,45,0.20)",
                border: "1px solid rgba(240,230,214,0.05)",
                borderRadius: 14,
                padding: "16px 18px",
              }}
            >
              <p className="font-sans" style={{ fontSize: 11, color: "rgba(240,230,214,0.48)", marginBottom: 8, letterSpacing: "0.10em" }}>
                Trace à retenir
              </p>
              <p className="font-body" style={{ fontSize: "0.95rem", color: "rgba(240,230,214,0.78)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                {summary.narrative_summary}
              </p>
            </div>
          )}

          {session.analysis && (
            <>
              <button
                type="button"
                onClick={onToggleMirror}
                className="font-sans"
                style={{
                  fontSize: "0.78rem",
                  color: "rgba(240,230,214,0.58)",
                  letterSpacing: "0.04em",
                  marginBottom: 16,
                  marginTop: 4,
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  padding: 0,
                  textAlign: "left",
                }}
              >
                {mirrorOpen ? "Masquer le miroir reçu à chaud" : "Voir le miroir reçu à chaud"}
              </button>
              {mirrorOpen && (
                <div
                  style={{
                    marginBottom: 20,
                    background: "rgba(70,55,45,0.42)",
                    border: "1px solid rgba(240,230,214,0.07)",
                    borderRadius: 16,
                    padding: "18px 20px",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.025), 0 8px 20px rgba(0,0,0,0.20)",
                  }}
                >
                  <p className="font-sans" style={{ fontSize: 11, color: "rgba(240,230,214,0.48)", marginBottom: 12, letterSpacing: "0.10em" }}>
                    Le miroir de cette session
                  </p>
                  <p className="font-body" style={{ fontSize: "1rem", color: "#F0E6D6", lineHeight: 1.65, whiteSpace: "pre-line" }}>
                    {session.analysis}
                  </p>
                </div>
              )}
            </>
          )}

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(240,230,214,0.07)" }}>
            <p className="font-sans" style={{ ...kickerStyle, marginBottom: 10 }}>
              Une note pour plus tard
            </p>
            {editingNote ? (
              <div>
                <textarea
                  value={noteText}
                  onChange={(e) => onNoteTextChange(e.target.value)}
                  placeholder="Ce qui est remonté dans les jours suivants..."
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "rgba(111,106,100,0.20)",
                    border: "1px solid rgba(240,230,214,0.12)",
                    borderRadius: 12,
                    color: "#F0E6D6",
                    fontSize: "0.9rem",
                    fontFamily: "inherit",
                    lineHeight: 1.5,
                    resize: "none",
                    outline: "none",
                    marginBottom: 8,
                  }}
                  rows={2}
                  autoFocus
                />
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={onSaveNote} style={{ fontSize: 12, color: "#C97B6A", fontWeight: 500, cursor: "pointer" }}>
                    Enregistrer
                  </button>
                  <button onClick={onCancelNote} style={{ fontSize: 12, color: "rgba(240,230,214,0.40)", cursor: "pointer" }}>
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div onClick={onStartEditNote} style={{ cursor: "pointer" }}>
                {session.noteEntreSession ? (
                  <p className="font-body" style={{ fontSize: "0.9rem", fontStyle: "italic", color: "rgba(240,230,214,0.70)", lineHeight: 1.55 }}>
                    {session.noteEntreSession}
                  </p>
                ) : (
                  <p style={{ fontSize: "0.9rem", fontStyle: "italic", color: "rgba(240,230,214,0.45)" }}>
                    Ajouter une note...
                  </p>
                )}
              </div>
            )}
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(240,230,214,0.07)", display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Supprimer cette trace ?")) onDelete();
              }}
              style={{ fontSize: 12, color: "rgba(240,230,214,0.45)", cursor: "pointer" }}
            >
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EspacePage() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [shortTraces, setShortTraces] = useState<ShortTrace[]>([]);
  const [gestes, setGestes] = useState<RecentGeste[]>([]);
  const [summariesById, setSummariesById] = useState<Record<string, SummaryLite>>({});
  const [loading, setLoading] = useState(true);
  const [showAllTraces, setShowAllTraces] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [openMirrorIds, setOpenMirrorIds] = useState<Record<string, boolean>>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const userId = user.id;
    let cancelled = false;

    Promise.all([
      getCompletedSessionsDb(userId),
      getShortTraces(userId),
      getRecentGestesDb(userId),
    ]).then(([s, traces, recentGestes]) => {
      if (cancelled) return;
      setSessions(s);
      setShortTraces(traces);
      setGestes(recentGestes);
      setLoading(false);

      const ids = s.map((x) => x.id);
      if (ids.length > 0) {
        getSessionSummariesByIds(supabase, userId, ids)
          .then((sums) => {
            if (!cancelled) setSummariesById(sums);
          })
          .catch(() => {});
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleDelete(id: string) {
    if (!user) return;
    await deleteSessionDb(id, user.id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  async function handleSaveNote(sessionId: string) {
    await updateSessionDb(sessionId, { note_entre_sessions: noteText });
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, noteEntreSession: noteText } : s))
    );
    setEditingNoteId(null);
  }

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

  // Liste unifiée "Tes traversées" — courtes + approfondies, par date (D1).
  // La trace déjà montrée en carte focale n'est pas répétée dans la liste.
  const itemKey = (item: UnifiedItem) =>
    item.kind === "courte" ? `courte-${item.trace.sessionId}` : `approfondie-${item.session.id}`;
  const focalKey =
    focal && (focal.kind === "courte"
      ? `courte-${focal.trace.sessionId}`
      : `approfondie-${focal.session.id}`);
  const merged: UnifiedItem[] = [
    ...sessions.map((session): UnifiedItem => ({ kind: "approfondie", date: session.date, session })),
    ...shortTraces.map((trace): UnifiedItem => ({ kind: "courte", date: trace.date, trace })),
  ]
    .filter((item) => itemKey(item) !== focalKey)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const visibleTraces = showAllTraces ? merged : merged.slice(0, LIST_PAGE_SIZE);

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
            <CourteTraceLines trace={focal.trace} />
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

        {/* ── Tes gestes (reprise verbatim de /app/ce-qui-change) ── */}
        {gestes.length > 0 && (
          <div style={blockStyle}>
            <p className="font-sans" style={kickerStyle}>
              Tes gestes
            </p>
            <p className="font-body" style={blockTextStyle}>
              Les gestes que tu as choisis récemment.
            </p>
            <ul style={listStyle}>
              {gestes.map((g) => {
                const mention =
                  g.statut === "fait" ? "fait" : g.statut === "autre_forme" ? "autrement" : null;
                return (
                  <li key={g.sessionId} style={listItemStyle}>
                    <span style={bulletStyle} aria-hidden="true">•</span>
                    <span>
                      {g.label}
                      {mention && (
                        <span
                          className="font-sans"
                          style={{ marginLeft: 10, fontSize: 12, color: "#C97B6A", letterSpacing: "0.04em" }}
                        >
                          {mention}
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* ── Liste unifiée — Tes traversées, telles que tu les as posées (D1) ── */}
        {merged.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p
              className="font-body"
              style={{ fontSize: "1rem", fontWeight: 300, color: "rgba(240,230,214,0.75)", lineHeight: 1.5 }}
            >
              Tes traversées, telles que tu les as posées.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {visibleTraces.map((item) =>
                item.kind === "courte" ? (
                  <div
                    key={itemKey(item)}
                    style={item.trace.partielle ? { ...listCardStyle, border: "1px dashed rgba(240,230,214,0.20)" } : listCardStyle}
                  >
                    <p className="font-sans" style={{ ...kickerStyle, marginBottom: 10 }}>
                      {formatTraceDate(item.trace.date)}
                    </p>
                    <CourteTraceLines trace={item.trace} />
                  </div>
                ) : (
                  <ApprofondieListItem
                    key={itemKey(item)}
                    session={item.session}
                    summary={summariesById[item.session.id]}
                    isExpanded={expandedId === item.session.id}
                    onToggle={() => setExpandedId(expandedId === item.session.id ? null : item.session.id)}
                    mirrorOpen={!!openMirrorIds[item.session.id]}
                    onToggleMirror={() =>
                      setOpenMirrorIds((prev) => ({ ...prev, [item.session.id]: !prev[item.session.id] }))
                    }
                    editingNote={editingNoteId === item.session.id}
                    noteText={noteText}
                    onNoteTextChange={setNoteText}
                    onStartEditNote={() => {
                      setEditingNoteId(item.session.id);
                      setNoteText(item.session.noteEntreSession || "");
                    }}
                    onSaveNote={() => handleSaveNote(item.session.id)}
                    onCancelNote={() => {
                      setEditingNoteId(null);
                      setNoteText("");
                    }}
                    onDelete={() => handleDelete(item.session.id)}
                  />
                )
              )}
            </div>
            {!showAllTraces && merged.length > LIST_PAGE_SIZE && (
              <button
                type="button"
                onClick={() => setShowAllTraces(true)}
                className="font-sans"
                style={{
                  alignSelf: "center",
                  fontSize: 13,
                  color: "rgba(240,230,214,0.60)",
                  letterSpacing: "0.04em",
                  textDecoration: "none",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px 0",
                }}
              >
                Voir plus
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
