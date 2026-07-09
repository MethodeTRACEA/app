"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  getCompletedSessionsDb,
  getShortTraces,
  getRecentGestesDb,
  getPremiumMemory,
  updateSessionDb,
  deleteSessionDb,
  type ShortTrace,
  type RecentGeste,
  type PremiumMemory,
} from "@/lib/supabase-store";
import {
  getSessionSummariesByIds,
  getMemoryProfileClient,
  getRecurringEmotions,
  getRecurringNeeds,
  type MemoryProfile,
} from "@/lib/memory";
import { getTraceLabel } from "@/lib/trace-labels";
import { supabase } from "@/lib/supabase";
import type { SessionData } from "@/lib/types";
import { ReflectRecurrent } from "@/components/ReflectRecurrent";

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

// ── APPUIS — fallback si effective_actions absentes (repris de /app/ce-qui-change) ──

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

// Nettoyage éditorial des actions affichées dans "Ce qui t'aide déjà" — filtre
// les formulations trop introspectives, déduplique les quasi-doublons (Jaccard
// ≥ 0.7), limite à 2 entrées. Repris verbatim de /app/ce-qui-change.

const APPUI_BLOCKLIST = [
  "réveillé",
  "reveille",
  "démêler",
  "demeler",
  "ce qui appartient",
  "analyser",
  "comprendre pourquoi",
];

const APPUI_STOPWORDS = new Set([
  "le", "la", "les", "de", "du", "des", "un", "une", "et", "ou", "mais",
  "ce", "cette", "ces", "mon", "ma", "mes", "ton", "ta", "tes",
  "que", "qui", "quoi", "sur", "dans", "pour", "avec", "sans",
  "tu", "il", "elle", "on", "me", "te", "se",
]);

function normalizeAppui(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function isAppuiClean(action: string): boolean {
  const norm = normalizeAppui(action);
  return !APPUI_BLOCKLIST.some((term) => norm.includes(normalizeAppui(term)));
}

function appuiTokens(action: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of normalizeAppui(action).split(/[^a-z0-9]+/)) {
    if (w.length > 2 && !APPUI_STOPWORDS.has(w) && !seen.has(w)) {
      seen.add(w);
      out.push(w);
    }
  }
  return out;
}

function cleanAppuiActions(items: string[]): string[] {
  const filtered = items.filter(isAppuiClean);
  const kept: { tokens: string[]; original: string }[] = [];
  for (const item of filtered) {
    const tokens = appuiTokens(item);
    if (tokens.length === 0) continue;
    let dupIndex = -1;
    for (let i = 0; i < kept.length; i++) {
      const prev = kept[i].tokens;
      const prevSet = new Set(prev);
      let inter = 0;
      for (const t of tokens) {
        if (prevSet.has(t)) inter++;
      }
      const union = new Set(prev.concat(tokens)).size;
      if (union > 0 && inter / union >= 0.7) {
        dupIndex = i;
        break;
      }
    }
    if (dupIndex === -1) {
      kept.push({ tokens, original: item });
    } else {
      const prevTokenCount = kept[dupIndex].tokens.length;
      const newTokenCount = tokens.length;
      const shouldReplace =
        newTokenCount > prevTokenCount ||
        (newTokenCount === prevTokenCount && item.length > kept[dupIndex].original.length);
      if (shouldReplace) {
        kept[dupIndex] = { tokens, original: item };
      }
    }
  }
  return kept.map((k) => k.original).slice(0, 2);
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
  const [memoryProfile, setMemoryProfile] = useState<MemoryProfile | null>(null);
  const [premiumMemory, setPremiumMemory] = useState<PremiumMemory | null>(null);
  const [recurringEmotion, setRecurringEmotion] = useState<{ emotion: string; count: number } | null>(null);
  const [recurringNeed, setRecurringNeed] = useState<{ need: string; count: number } | null>(null);

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
      getMemoryProfileClient(supabase, userId),
      getPremiumMemory(userId),
      getRecurringEmotions(supabase, userId),
      getRecurringNeeds(supabase, userId),
    ]).then(([s, traces, recentGestes, profile, pm, emo, need]) => {
      if (cancelled) return;
      setSessions(s);
      setShortTraces(traces);
      setGestes(recentGestes);
      setMemoryProfile(profile);
      setPremiumMemory(pm);
      setRecurringEmotion(emo);
      setRecurringNeed(need);
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

  // ── Agrégats mémoire (repris de /app/ce-qui-change, P2d) ──────────
  const n = sessions.length;
  const recurringPatterns = memoryProfile?.recurring_patterns?.filter(Boolean) ?? [];
  const commonTriggers = memoryProfile?.common_triggers?.filter(Boolean) ?? [];
  const effectiveActions = memoryProfile?.effective_actions?.filter(Boolean) ?? [];
  const memTotal = memoryProfile?.total_sessions ?? 0;

  const block1Items = recurringPatterns.length > 0 ? recurringPatterns.slice(0, 3) : commonTriggers.slice(0, 3);
  const fallbackAppuis = computeAppuisBlock(sessions);
  const block2Items = effectiveActions.length > 0 ? effectiveActions.slice(0, 3) : fallbackAppuis;
  const cleanedBlock2Items = cleanAppuiActions(block2Items);

  const hasMemoryContent = block1Items.length > 0 || block2Items.length > 0;
  const hasPremiumContent = !!(
    premiumMemory &&
    (premiumMemory.ceQuiRevient || premiumMemory.ceQuiTAide || premiumMemory.ceQuiSembleDemandem)
  );
  const hasRecurringSummaryContent = !!(recurringEmotion || recurringNeed);
  const hasAnyContent = hasMemoryContent || hasPremiumContent || hasRecurringSummaryContent;

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

        {/* ── Cascade de seuils du reflet — cas 1/2 (repris de /app/ce-qui-change).
            Le cas 0 (compte totalement vide) est couvert plus haut par l'état
            "Aucune traversée pour le moment.", migré d'historique (§3). ── */}
        {n === 1 && !hasAnyContent && shortTraces.length === 0 && gestes.length === 0 && (
          <div style={blockStyle}>
            <p className="font-body" style={blockTextStyle}>
              Une première trace existe.
              <br />
              <br />
              Il faut encore quelques traversées pour voir ce qui revient vraiment.
            </p>
          </div>
        )}

        {n >= 2 && !hasAnyContent && shortTraces.length === 0 && gestes.length === 0 && (
          <div style={blockStyle}>
            <p className="font-body" style={blockTextStyle}>
              Tes traversées sont bien enregistrées.
              <br />
              <br />
              Avec quelques traversées de plus, ce qui revient apparaîtra ici.
            </p>
          </div>
        )}

        {/* ── Agrégats mémoire (repris de /app/ce-qui-change, P2d) ── */}
        {hasAnyContent && (
          <>
            {/* Ce qui revient souvent + émotion récurrente (composant partagé, P1) */}
            <ReflectRecurrent mode="complet" items={block1Items} recurringEmotion={recurringEmotion} />

            {premiumMemory?.ceQuiRevient && (
              <div style={blockStyle}>
                <p className="font-sans" style={kickerStyle}>
                  Ton corps quand ça monte
                </p>
                <p className="font-body" style={blockTextStyle}>
                  {premiumMemory.ceQuiRevient}
                </p>
              </div>
            )}

            {(cleanedBlock2Items.length > 0 || premiumMemory?.ceQuiTAide) && (
              <div style={blockStyle}>
                <p className="font-sans" style={kickerStyle}>
                  Ce qui t&apos;aide déjà
                </p>
                {premiumMemory?.ceQuiTAide ? (
                  <>
                    <p className="font-body" style={blockTextStyle}>
                      {premiumMemory.ceQuiTAide}
                    </p>
                    {cleanedBlock2Items.length === 0 ? (
                      <p className="font-body" style={{ ...blockTextStyle, marginTop: 8 }}>
                        À retrouver quand ça remonte.
                      </p>
                    ) : (
                      <>
                        <p className="font-body" style={{ ...blockTextStyle, marginTop: 8 }}>
                          Tu peux aussi retrouver :
                        </p>
                        <ul style={listStyle}>
                          {cleanedBlock2Items.map((item, i) => (
                            <li key={`b2-${i}`} style={listItemStyle}>
                              <span style={bulletStyle} aria-hidden="true">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-body" style={blockTextStyle}>
                      Des appuis reviennent dans tes traversées.
                      <br />
                      Tu peux les retrouver quand ça remonte.
                    </p>
                    <ul style={listStyle}>
                      {cleanedBlock2Items.map((item, i) => (
                        <li key={`b2-${i}`} style={listItemStyle}>
                          <span style={bulletStyle} aria-hidden="true">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            <div style={blockStyle}>
              <p className="font-sans" style={kickerStyle}>
                Ce qui se construit
              </p>
              {memTotal >= 2 ? (
                <p className="font-body" style={blockTextStyle}>
                  Tu reviens ici depuis plusieurs traversées.
                  <br />
                  C&apos;est simplement ce que tu as posé ici.
                </p>
              ) : (
                <p className="font-body" style={blockTextStyle}>
                  Une trace est déjà ici.
                  <br />
                  Elle reste ici, sans avoir besoin d&apos;être interprétée.
                  <br />
                  Au fil des traversées, ce qui revient souvent commencera à apparaître ici.
                </p>
              )}

              {recurringNeed && (
                <p className="font-body" style={{ ...blockTextStyle, marginTop: 14 }}>
                  Au fil de tes traversées, un besoin revient souvent : {recurringNeed.need}.
                  <br />
                  Est-ce qu&apos;il y a eu une place pour ce besoin, ces derniers temps ? Il n&apos;y a pas de bonne réponse.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
