"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getCompletedSessionsDb, deleteSessionDb, updateSessionDb, getTopEmergerValues, getPremiumMemory } from "@/lib/supabase-store";
import type { PremiumMemory } from "@/lib/supabase-store";
import type { SessionData } from "@/lib/types";
import Link from "next/link";
import { Paywall } from "@/components/Paywall";
import { buildHistoryInsight } from "@/lib/history-insight";

export default function HistoriquePage() {
  const { user, loading: authLoading, hasPremiumAccess } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [topEmerger, setTopEmerger] = useState<string[]>([]);
  const [premiumMemory, setPremiumMemory] = useState<PremiumMemory | null | undefined>(undefined);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (!user) return;
    const queries: Promise<unknown>[] = [
      getCompletedSessionsDb(user.id),
      getTopEmergerValues(user.id),
    ];
    if (hasPremiumAccess) queries.push(getPremiumMemory(user.id));

    Promise.all(queries).then((results) => {
      const [data, emerger, pm] = results as [
        Awaited<ReturnType<typeof getCompletedSessionsDb>>,
        Awaited<ReturnType<typeof getTopEmergerValues>>,
        PremiumMemory | null | undefined,
      ];
      setSessions(data);
      setTopEmerger(emerger);
      if (hasPremiumAccess) setPremiumMemory(pm ?? null);
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

  // ── Données calculées ─────────────────────────────────────

  // Insight longitudinal déterministe (traversées approfondies uniquement)
  const historyInsight = buildHistoryInsight(sessions);

  // Bloc "Ce qui se transforme"
  const transformeText =
    sessions.length >= 10
      ? "Tu reviens souvent quand quelque chose t'active.\n\nTu ne laisses plus passer sans t'arrêter."
      : sessions.length >= 3
      ? "Tu commences à revenir vers toi quand quelque chose bouge.\n\nC'est déjà une trace."
      : null;

  // Appuis les plus utilisés (premium)
  function topActionsFn(): string[] {
    const counts: Record<string, number> = {};
    for (const s of sessions) {
      if (!s.actionAlignee) continue;
      const key = s.actionAlignee.toLowerCase().trim();
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.entries(counts)
      .filter(([, n]) => n >= 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([v]) => v);
  }
  const topActions = topActionsFn();

  // Patterns exercices — 1 phrase (premium)
  function patternPhrase(): string | null {
    if (topEmerger.length === 0 || sessions.length < 3) return null;
    const v = topEmerger[0].toLowerCase();
    if (v.includes("respir")) return "Tu utilises souvent Respirer lentement";
    if (v.includes("corps") || v.includes("appui") || v.includes("ancr")) return "Tu reviens souvent au corps";
    if (v.includes("regard") || v.includes("pose")) return "Tu choisis souvent de te poser un moment";
    if (topEmerger.length > 1) return "Tu explores différentes façons de revenir au calme";
    return null;
  }
  const patternInsight = patternPhrase();

  // ── Paywall inline ────────────────────────────────────────
  if (showPaywall) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Paywall onContinue={() => setShowPaywall(false)} />
      </div>
    );
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
          Ce qui est revenu dans tes traversées.
        </p>

        {/* ── INSIGHT LONGITUDINAL ── */}
        {historyInsight && (
          <div style={blockStyle}>
            <p className="font-sans" style={kickerStyle}>Ce qui revient souvent</p>
            <p className="font-body" style={{ ...blockTextStyle, whiteSpace: "pre-line" }}>{historyInsight}</p>
          </div>
        )}

        {/* ── CE QUI SE TRANSFORME ── */}
        {transformeText && (
          <div style={blockStyle}>
            <p className="font-sans" style={kickerStyle}>Ce qui se transforme</p>
            <p className="font-body" style={{ ...blockTextStyle, whiteSpace: "pre-line" }}>{transformeText}</p>
          </div>
        )}

        {hasPremiumAccess ? (
          <>
            {/* ── Ce que tu utilises le plus ── */}
            {patternInsight && (
              <div style={blockStyle}>
                <p className="font-sans" style={kickerStyle}>Ce que tu utilises le plus</p>
                <p className="font-body" style={blockTextStyle}>{patternInsight}</p>
              </div>
            )}

            {/* ── Tes appuis les plus utilisés ── */}
            {topActions.length > 0 && (
              <div style={blockStyle}>
                <p className="font-sans" style={kickerStyle}>Tes appuis les plus utilisés</p>
                <p className="font-body" style={{ ...blockTextStyle, marginBottom: 8 }}>Tu reviens souvent à :</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {topActions.map((a) => (
                    <p key={a} className="font-body" style={{ ...blockTextStyle, fontStyle: "italic" }}>« {a} »</p>
                  ))}
                </div>
              </div>
            )}

            {/* ── Repères IA (premium memory) ── */}
            {premiumMemory !== undefined && premiumMemory !== null && (
              <div style={{ ...blockStyle, display: "flex", flexDirection: "column", gap: 20 }}>
                <p className="font-sans" style={{ ...kickerStyle, marginBottom: 0 }}>Repères</p>
                {([
                  { label: "Ce qui revient",        text: premiumMemory.ceQuiRevient },
                  { label: "Ce qui semble demandé", text: premiumMemory.ceQuiSembleDemandem },
                  { label: "Ce qui t'aide",         text: premiumMemory.ceQuiTAide },
                  { label: "Ce que tu peux tester", text: premiumMemory.ceQuePeutTester },
                ] as { label: string; text: string | null }[])
                  .filter((b) => b.text)
                  .map((block) => (
                    <div key={block.label}>
                      <p
                        className="font-sans"
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: "rgba(201,123,106,0.65)",
                          marginBottom: 6,
                        }}
                      >
                        {block.label}
                      </p>
                      <p className="font-body" style={blockTextStyle}>{block.text}</p>
                    </div>
                  ))}
              </div>
            )}
          </>
        ) : (
          /* ── CTA gratuit ── */
          sessions.length >= 1 && (
            <button
              type="button"
              onClick={() => setShowPaywall(true)}
              style={{
                ...blockStyle,
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                background: "rgba(111,106,100,0.10)",
                transition: "background 0.2s",
              }}
            >
              <p className="font-body" style={{ ...blockTextStyle, color: "rgba(240,230,214,0.55)" }}>
                Voir ta progression dans le temps →
              </p>
            </button>
          )
        )}

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
                          <div>
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
                            {(s.veriteInterieure || s.emotionPrimaire) && (
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
                                {s.veriteInterieure ? `"${s.veriteInterieure}"` : s.emotionPrimaire}
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
                              Ce que tu viens de traverser
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
                            Ce qui a continué à travailler après
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
