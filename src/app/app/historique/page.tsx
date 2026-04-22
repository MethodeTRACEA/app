"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getCompletedSessionsDb, deleteSessionDb, updateSessionDb, getTopEmergerValues, getTopRessentiValues, getPremiumMemory } from "@/lib/supabase-store";
import type { PremiumMemory } from "@/lib/supabase-store";
import type { SessionData } from "@/lib/types";
import Link from "next/link";
import { Paywall } from "@/components/Paywall";

export default function HistoriquePage() {
  const { user, loading: authLoading, hasPremiumAccess } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [topEmerger, setTopEmerger] = useState<string[]>([]);
  const [topRessentis, setTopRessentis] = useState<string[]>([]);
  const [premiumMemory, setPremiumMemory] = useState<PremiumMemory | null | undefined>(undefined);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (!user) return;
    const queries: Promise<unknown>[] = [
      getCompletedSessionsDb(user.id),
      getTopEmergerValues(user.id),
      getTopRessentiValues(user.id, 12),
    ];
    if (hasPremiumAccess) queries.push(getPremiumMemory(user.id));

    Promise.all(queries).then((results) => {
      const [data, emerger, ressentis, pm] = results as [
        Awaited<ReturnType<typeof getCompletedSessionsDb>>,
        Awaited<ReturnType<typeof getTopEmergerValues>>,
        Awaited<ReturnType<typeof getTopRessentiValues>>,
        PremiumMemory | null | undefined,
      ];
      setSessions(data);
      setTopEmerger(emerger);
      setTopRessentis(ressentis);
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

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const sessionsThisWeek = sessions.filter(s => new Date(s.date) >= oneWeekAgo).length;

  // BLOC 2 — émotions (agrégation sessions + ressentis tracking)
  const emotionCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    if (s.emotionPrimaire) {
      const e = s.emotionPrimaire.toLowerCase().trim().slice(0, 30);
      emotionCounts[e] = (emotionCounts[e] || 0) + 1;
    }
  });
  topRessentis.forEach((r) => {
    const e = r.toLowerCase().trim().slice(0, 30);
    emotionCounts[e] = (emotionCounts[e] || 0) + 1;
  });
  const topEmotions = Object.keys(emotionCounts)
    .sort((a, b) => emotionCounts[b] - emotionCounts[a])
    .slice(0, 8);

  // Progression rythme (tous les utilisateurs, 1 phrase max)
  const rythmePhrase =
    sessions.length >= 10 ? "Tu as pris l'habitude de revenir." :
    sessions.length >= 5  ? "Tu reviens ici régulièrement." :
    sessions.length >= 3  ? "Tu es déjà revenu(e) plusieurs fois." :
    null;

  // Observations exercices (tous les utilisateurs, max 2)
  function exerciseLabel(raw: string): string {
    const v = raw.toLowerCase();
    if (v.includes("respir")) return "Respirer lentement";
    if (v.includes("corps") || v.includes("appui") || v.includes("ancr")) return "Revenir au corps";
    if (v.includes("regard") || v.includes("pose")) return "Se poser un moment";
    return raw;
  }
  const observations: string[] = [];
  if (topEmerger.length > 0 && sessions.length >= 3)
    observations.push(`Tu utilises souvent ${exerciseLabel(topEmerger[0])}`);
  if (topEmerger.length > 1 && observations.length < 2)
    observations.push("Tu explores différentes façons de revenir au calme");

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

      {/* ── BLOC 1 — TON PARCOURS (tous les utilisateurs) ── */}
      <div className="card-base p-6">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">Ton parcours</p>
        <p className="font-body text-2xl text-espresso">
          {sessions.length} session{sessions.length > 1 ? "s" : ""} complétée{sessions.length > 1 ? "s" : ""}
        </p>
        {sessionsThisWeek > 0 && (
          <p className="font-body text-sm text-warm-gray mt-1">
            {sessionsThisWeek} cette semaine
          </p>
        )}
        {rythmePhrase && (
          <p className="font-body text-sm text-warm-gray mt-2">
            {rythmePhrase}
          </p>
        )}
      </div>

      {/* ── OBSERVATIONS COMPORTEMENTALES (tous les utilisateurs) ── */}
      {observations.length > 0 && (
        <div className="card-base p-6 space-y-2">
          {observations.map((obs, i) => (
            <p key={i} className="font-body text-sm text-espresso">
              {obs}
            </p>
          ))}
        </div>
      )}

      {hasPremiumAccess ? (
        <>
          {/* ── BLOC 2 — TES RÉCURRENCES ── */}
          {topEmotions.length > 0 && (
            <div className="card-base p-6">
              <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">Ce qui revient souvent</p>
              <div className="flex flex-wrap gap-2">
                {topEmotions.map((emotion) => (
                  <span key={emotion} className="px-3 py-1.5 rounded-full text-sm font-medium bg-beige text-espresso">
                    {emotion}
                  </span>
                ))}
              </div>
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
                      {/* Émotion dominante */}
                      {s.emotionPrimaire && (
                        <p className="font-body text-sm text-warm-gray italic mb-3">{s.emotionPrimaire}</p>
                      )}

                      {/* Lien émotion → action */}
                      {(s.steps.aligner || s.veriteInterieure) && (
                        <div className="mb-4">
                          <p className="text-xs text-warm-gray/60 mb-1">Tu as choisi :</p>
                          <p className="font-body text-base text-espresso leading-relaxed">
                            {s.steps.aligner || s.veriteInterieure}
                          </p>
                        </div>
                      )}

                      {/* Note entre sessions */}
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
                            onClick={() => { setEditingNoteId(s.id); setNoteText((s as any).noteEntreSession || ""); }}
                            className="cursor-pointer group"
                          >
                            {(s as any).noteEntreSession ? (
                              <p className="font-body text-sm text-espresso italic leading-relaxed group-hover:text-terra transition-colors">
                                {(s as any).noteEntreSession}
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
