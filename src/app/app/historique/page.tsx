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

  // Vérité intérieure récurrente (premium)
  function topVeriteFn(): string | null {
    const counts: Record<string, number> = {};
    for (const s of sessions) {
      if (!s.veriteInterieure) continue;
      const key = s.veriteInterieure.toLowerCase().trim();
      counts[key] = (counts[key] ?? 0) + 1;
    }
    const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
    return top && top[1] >= 2 ? top[0] : null;
  }
  const topVerite = topVeriteFn();

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <h1 className="section-title">Traces</h1>

      {/* ── INSIGHT LONGITUDINAL — miroir déterministe (>= 5 traversées approfondies) ── */}
      {historyInsight && (
        <div className="card-base p-6">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">Ce qui revient souvent</p>
          <p className="font-body text-base text-espresso leading-relaxed whitespace-pre-line">{historyInsight}</p>
        </div>
      )}

      {/* ── CE QUI SE TRANSFORME ── */}
      {transformeText && (
        <div className="card-base p-6">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">Ce qui se transforme</p>
          <p className="font-body text-base text-espresso leading-relaxed whitespace-pre-line">{transformeText}</p>
        </div>
      )}

      {hasPremiumAccess ? (
        <>
          {/* ── Ce que tu utilises le plus — patterns ── */}
          {patternInsight && (
            <div className="card-base p-6">
              <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Ce que tu utilises le plus</p>
              <p className="font-body text-base text-espresso">{patternInsight}</p>
            </div>
          )}

          {/* ── Tes appuis les plus utilisés ── */}
          {topActions.length > 0 && (
            <div className="card-base p-6">
              <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Tes appuis les plus utilisés</p>
              <p className="font-body text-sm text-warm-gray mb-2">Tu reviens souvent à :</p>
              <div className="space-y-1">
                {topActions.map((a) => (
                  <p key={a} className="font-body text-base text-espresso">« {a} »</p>
                ))}
              </div>
            </div>
          )}

          {/* ── Ce qui revient ── */}
          {topVerite && (
            <div className="card-base p-6">
              <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">Ce qui revient</p>
              <p className="font-body text-sm text-warm-gray mb-2">Tu es revenu(e) à :</p>
              <p className="font-body text-base text-espresso">« {topVerite} »</p>
            </div>
          )}

          {/* ── Repères IA (premium memory) ── */}
          {premiumMemory !== undefined && premiumMemory !== null && (
            <div className="card-base p-6 space-y-5">
              <p className="text-xs font-medium tracking-widest uppercase text-warm-gray">Repères</p>
              {([
                { label: "Ce qui revient",        text: premiumMemory.ceQuiRevient },
                { label: "Ce qui semble demandé", text: premiumMemory.ceQuiSembleDemandem },
                { label: "Ce qui t'aide",         text: premiumMemory.ceQuiTAide },
                { label: "Ce que tu peux tester", text: premiumMemory.ceQuePeutTester },
              ] as { label: string; text: string | null }[])
                .filter((b) => b.text)
                .map((block) => (
                  <div key={block.label}>
                    <p className="text-[11px] font-medium tracking-wider uppercase text-terra/60 mb-1">{block.label}</p>
                    <p className="font-body text-base text-espresso leading-relaxed">{block.text}</p>
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
            className="w-full card-base p-6 text-left hover:bg-beige/60 transition-colors cursor-pointer"
          >
            <p className="font-body text-sm text-warm-gray">
              Voir ta progression dans le temps →
            </p>
          </button>
        )
      )}

      {/* ── Liste des sessions ── */}
      {sessions.length > 0 && (
        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">Tes traces</p>
          <div className="space-y-3">
            {sessions.map((s) => {
              const isExpanded = expandedId === s.id;
              return (
                <div key={s.id} className="card-base !p-0 overflow-hidden">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : s.id)}
                    className="w-full text-left"
                  >
                    <div className="px-5 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-serif text-base text-espresso">
                            {new Date(s.date).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                          {(s.veriteInterieure || s.emotionPrimaire) && (
                            <p className="font-body text-sm text-warm-gray italic mt-0.5 truncate max-w-[260px]">
                              {s.veriteInterieure ? `"${s.veriteInterieure}"` : s.emotionPrimaire}
                            </p>
                          )}
                        </div>
                        <span className={`transition-transform duration-200 text-warm-gray/50 ${isExpanded ? "rotate-90" : ""}`}>
                          ▸
                        </span>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-4 pt-2 border-t border-beige-dark animate-fade-up">
                      {/* 1 — Situation */}
                      {s.steps.traverser && (
                        <div className="mb-3">
                          <p className="text-xs text-warm-gray/60 mb-1">Ce qui s'est passé :</p>
                          <p className="font-body text-sm text-warm-gray italic leading-relaxed">
                            {s.steps.traverser}
                          </p>
                        </div>
                      )}

                      {/* 2 — Miroir IA */}
                      {s.analysis && (
                        <div className="mb-5 rounded-xl bg-beige/60 border border-beige-dark px-4 py-4">
                          <p className="text-xs text-warm-gray/60 mb-3 tracking-wide">Ce que tu viens de traverser</p>
                          <p className="font-body text-base text-espresso leading-loose whitespace-pre-line">
                            {s.analysis}
                          </p>
                        </div>
                      )}

                      {/* 3 — Émotion */}
                      {s.emotionPrimaire && (
                        <p className="font-body text-sm text-warm-gray italic mb-3">{s.emotionPrimaire}</p>
                      )}

                      {/* 5 — Note entre sessions */}
                      <div className="mt-4 pt-3 border-t border-beige-dark">
                        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-2">
                          Ce qui a continué à travailler après
                        </p>
                        {editingNoteId === s.id ? (
                          <div>
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Ce qui est remonté dans les jours suivants..."
                              className="w-full px-4 py-3 bg-beige/50 rounded-xl text-espresso font-sans text-sm border border-beige-dark focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra/20 transition-all placeholder:text-warm-gray/40 resize-none mb-2"
                              rows={2}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveNote(s.id)}
                                className="text-xs text-terra font-medium hover:text-terra-dark transition-colors"
                              >
                                Enregistrer
                              </button>
                              <button
                                onClick={() => { setEditingNoteId(null); setNoteText(""); }}
                                className="text-xs text-warm-gray hover:text-espresso transition-colors"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => { setEditingNoteId(s.id); setNoteText(s.noteEntreSession || ""); }}
                            className="cursor-pointer group"
                          >
                            {s.noteEntreSession ? (
                              <p className="font-body text-sm text-espresso italic leading-relaxed group-hover:text-terra transition-colors">
                                {s.noteEntreSession}
                              </p>
                            ) : (
                              <p className="text-sm text-warm-gray/60 italic group-hover:text-warm-gray transition-colors">
                                Ajouter une note...
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-beige-dark flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Supprimer cette trace ?")) handleDelete(s.id);
                          }}
                          className="text-xs text-warm-gray hover:text-terra-dark transition-colors"
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
  );
}
