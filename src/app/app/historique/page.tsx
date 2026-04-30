"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getCompletedSessionsDb, deleteSessionDb, updateSessionDb } from "@/lib/supabase-store";
import type { SessionData } from "@/lib/types";
import Link from "next/link";
import { getSessionSummariesByIds } from "@/lib/memory";
import { supabase } from "@/lib/supabase";

type SummaryLite = Awaited<
  ReturnType<typeof getSessionSummariesByIds>
>[string];

export default function HistoriquePage() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [summariesById, setSummariesById] = useState<Record<string, SummaryLite>>({});

  useEffect(() => {
    if (!user) return;
    getCompletedSessionsDb(user.id).then((data) => {
      setSessions(data);
      setLoading(false);

      // Charger les résumés des sessions affichées (best-effort, non bloquant).
      const sessionIds = data.map((s) => s.id);
      if (sessionIds.length > 0) {
        getSessionSummariesByIds(supabase, user.id, sessionIds)
          .then((sums) => setSummariesById(sums))
          .catch(() => {});
      }
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
          Connecte-toi pour retrouver tes traces.
        </p>
        <Link href="/app/connexion" className="btn-primary inline-block">
          Se connecter
        </Link>
      </div>
    );
  }

  async function handleDelete(id: string) {
    await deleteSessionDb(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  async function handleSaveNote(sessionId: string) {
    await updateSessionDb(sessionId, { note_entre_sessions: noteText });
    setSessions((prev) =>
      prev.map((s) => s.id === sessionId ? { ...s, noteEntreSession: noteText } : s)
    );
    setEditingNoteId(null);
    setNoteText("");
  }

  // ── Styles V3 réutilisables ───────────────────────────────
  const blockStyle: React.CSSProperties = {
    background: "rgba(111,106,100,0.15)",
    border: "1px solid rgba(240,230,214,0.085)",
    borderRadius: 24,
    padding: "28px 26px",
    boxShadow: "0 18px 42px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.035)",
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
          background: "radial-gradient(circle at 50% 35%, rgba(255,180,120,0.14) 0%, rgba(255,140,90,0.07) 30%, rgba(28,20,16,0) 60%)",
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
          Tes traces
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
          La mémoire de tes traversées, une à une.
        </p>

        {/* ── Liste des sessions ── */}
        {sessions.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p
              className="font-sans"
              style={{ ...kickerStyle, marginBottom: 20, color: "#C97B6A", letterSpacing: "0.22em", fontWeight: 500 }}
            >
              Tes traces
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sessions.map((s) => {
                const isExpanded = expandedId === s.id;
                const summary = summariesById[s.id];
                const pivotText = summary?.inner_truth || s.veriteInterieure || s.emotionPrimaire || "";
                const pivotIsQuote = !!(summary?.inner_truth || s.veriteInterieure);
                const previewEmotions = (summary?.dominant_emotions ?? [])
                  .filter((e) => e && e.trim() !== "")
                  .slice(0, 2);
                return (
                  <div
                    key={s.id}
                    style={{
                      background: "rgba(111,106,100,0.14)",
                      border: "1px solid rgba(240,230,214,0.085)",
                      borderRadius: 22,
                      overflow: "hidden",
                      boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
                    }}
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : s.id)}
                      className="w-full text-left"
                    >
                      <div style={{ padding: "22px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                              className="font-body"
                              style={{ fontSize: "1rem", fontWeight: 400, color: "#F0E6D6", lineHeight: 1 }}
                            >
                              {new Date(s.date).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </div>
                            {pivotText && (
                              <p
                                className="font-body"
                                style={{
                                  fontSize: "0.9rem",
                                  fontStyle: "italic",
                                  fontWeight: 300,
                                  color: "rgba(240,230,214,0.64)",
                                  marginTop: 6,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: 260,
                                }}
                              >
                                {pivotIsQuote ? `"${pivotText}"` : pivotText}
                              </p>
                            )}
                            {previewEmotions.length > 0 && (
                              <p
                                className="font-sans"
                                style={{
                                  fontSize: 11,
                                  fontWeight: 400,
                                  color: "rgba(240,230,214,0.48)",
                                  marginTop: 4,
                                  letterSpacing: "0.04em",
                                }}
                              >
                                {previewEmotions.join(" · ")}
                              </p>
                            )}
                          </div>
                          <span
                            style={{
                              color: "rgba(240,230,214,0.25)",
                              fontSize: 20,
                              transition: "transform 0.2s",
                              transform: isExpanded ? "rotate(90deg)" : "none",
                              lineHeight: 1,
                            }}
                          >
                            ›
                          </span>
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div
                        className="animate-fade-up"
                        style={{
                          padding: "0 24px 24px",
                          borderTop: "1px solid rgba(240,230,214,0.07)",
                          paddingTop: 20,
                        }}
                      >
                        {/* 1 — Situation */}
                        {s.steps.traverser && (
                          <div style={{ marginBottom: 16 }}>
                            <p
                              className="font-sans"
                              style={{ fontSize: 11, color: "rgba(240,230,214,0.48)", marginBottom: 6, letterSpacing: "0.10em" }}
                            >
                              Ce qui s&apos;est passé :
                            </p>
                            <p
                              className="font-body"
                              style={{ fontSize: "0.9rem", fontStyle: "italic", color: "rgba(240,230,214,0.60)", lineHeight: 1.55 }}
                            >
                              {s.steps.traverser}
                            </p>
                          </div>
                        )}

                        {/* 1bis — Résumé de session (mémoire évolutive) */}
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
                            <p
                              className="font-sans"
                              style={{ fontSize: 11, color: "rgba(240,230,214,0.48)", marginBottom: 8, letterSpacing: "0.10em" }}
                            >
                              Ce qui s&apos;est dit dans cette session
                            </p>
                            <p
                              className="font-body"
                              style={{ fontSize: "0.95rem", color: "rgba(240,230,214,0.78)", lineHeight: 1.6, whiteSpace: "pre-line" }}
                            >
                              {summary.narrative_summary}
                            </p>
                          </div>
                        )}

                        {/* 2 — Miroir IA */}
                        {s.analysis && (
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
                            <p
                              className="font-sans"
                              style={{ fontSize: 11, color: "rgba(240,230,214,0.48)", marginBottom: 12, letterSpacing: "0.10em" }}
                            >
                              Le miroir de cette session
                            </p>
                            <p
                              className="font-body"
                              style={{ fontSize: "1rem", color: "#F0E6D6", lineHeight: 1.65, whiteSpace: "pre-line" }}
                            >
                              {s.analysis}
                            </p>
                          </div>
                        )}

                        {/* 3 — Émotion */}
                        {s.emotionPrimaire && (
                          <p
                            className="font-body"
                            style={{ fontSize: "0.9rem", fontStyle: "italic", color: "rgba(240,230,214,0.55)", marginBottom: 16 }}
                          >
                            {s.emotionPrimaire}
                          </p>
                        )}

                        {/* 5 — Note entre sessions */}
                        <div
                          style={{
                            marginTop: 16,
                            paddingTop: 16,
                            borderTop: "1px solid rgba(240,230,214,0.07)",
                          }}
                        >
                          <p
                            className="font-sans"
                            style={{ ...kickerStyle, marginBottom: 10 }}
                          >
                            Une note pour plus tard
                          </p>
                          {editingNoteId === s.id ? (
                            <div>
                              <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
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
                                <button
                                  onClick={() => handleSaveNote(s.id)}
                                  style={{ fontSize: 12, color: "#C97B6A", fontWeight: 500, cursor: "pointer" }}
                                >
                                  Enregistrer
                                </button>
                                <button
                                  onClick={() => { setEditingNoteId(null); setNoteText(""); }}
                                  style={{ fontSize: 12, color: "rgba(240,230,214,0.40)", cursor: "pointer" }}
                                >
                                  Annuler
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => { setEditingNoteId(s.id); setNoteText(s.noteEntreSession || ""); }}
                              style={{ cursor: "pointer" }}
                            >
                              {s.noteEntreSession ? (
                                <p
                                  className="font-body"
                                  style={{ fontSize: "0.9rem", fontStyle: "italic", color: "rgba(240,230,214,0.70)", lineHeight: 1.55 }}
                                >
                                  {s.noteEntreSession}
                                </p>
                              ) : (
                                <p
                                  style={{ fontSize: "0.9rem", fontStyle: "italic", color: "rgba(240,230,214,0.45)" }}
                                >
                                  Ajouter une note...
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div
                          style={{
                            marginTop: 16,
                            paddingTop: 16,
                            borderTop: "1px solid rgba(240,230,214,0.07)",
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Supprimer cette trace ?")) handleDelete(s.id);
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
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
