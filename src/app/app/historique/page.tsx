"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getCompletedSessionsDb, deleteSessionDb, updateSessionDb, getTopEmergerValues } from "@/lib/supabase-store";
import type { SessionData } from "@/lib/types";
import Link from "next/link";

export default function HistoriquePage() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [topEmerger, setTopEmerger] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getCompletedSessionsDb(user.id),
      getTopEmergerValues(user.id),
    ]).then(([data, emerger]) => {
      setSessions(data);
      setTopEmerger(emerger);
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

  // ── Texte dynamique ──────────────────────────────────────
  const ligne1 = sessions.length < 3
    ? "Tu es revenu·e ici."
    : "Tu es revenu·e ici plusieurs fois.";

  const topRessentis = (() => {
    const counts: Record<string, number> = {};
    sessions.forEach((s) => {
      if (s.emotionPrimaire) {
        const e = s.emotionPrimaire.toLowerCase().trim().slice(0, 30);
        counts[e] = (counts[e] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([e]) => e);
  })();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="section-title">Traces</h1>

      {/* Bloc d'accueil */}
      <div className="mb-10">
        {sessions.length === 0 ? (
          <p className="font-body text-base text-warm-gray leading-relaxed">
            Aucune traversée complétée pour l&apos;instant.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="font-body text-base text-espresso/80 leading-relaxed">
              {ligne1}
            </p>
            {topRessentis.length > 0 && (
              <p className="font-body text-base text-warm-gray leading-relaxed">
                {topRessentis[0] && <>Parfois, c&apos;était {topRessentis[0]}.</>}
                {topRessentis[1] && <><br />Parfois, c&apos;était {topRessentis[1]}.</>}
              </p>
            )}
            <p className="font-body text-base text-espresso/80 leading-relaxed">
              Tu as pris le temps quand même.
            </p>
          </div>
        )}
      </div>

      {/* Ce qui revient */}
      {sessions.length > 0 && (() => {
        const counts: Record<string, number> = {};
        sessions.forEach((s) => {
          if (s.emotionPrimaire) {
            const e = s.emotionPrimaire.toLowerCase().trim().slice(0, 30);
            counts[e] = (counts[e] || 0) + 1;
          }
        });
        const emotions = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 12);
        if (emotions.length === 0) return null;
        return (
          <div className="mb-8">
            <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">
              Ce qui revient
            </p>
            <div className="flex flex-wrap gap-2">
              {emotions.map((emotion) => (
                <span
                  key={emotion}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-beige text-espresso"
                >
                  {emotion}
                </span>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Ce qui t'a aidé — fil de vérités intérieures */}
      {sessions.filter(s => s.veriteInterieure).length > 0 && (
        <div className="mb-10">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-5">
            Ce qui t&apos;a aidé
          </p>
          <div className="space-y-4">
            {sessions
              .filter(s => s.veriteInterieure)
              .map((s, i) => (
                <div key={s.id} className="flex gap-4 items-start">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-terra/50 mt-1.5" />
                    {i < sessions.filter(s => s.veriteInterieure).length - 1 && (
                      <div className="w-px flex-1 bg-terra/15 mt-1 min-h-[2rem]" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="font-body text-base italic text-espresso leading-relaxed mb-1">
                      &ldquo;{s.veriteInterieure}&rdquo;
                    </p>
                    <p className="text-xs text-warm-gray">
                      {new Date(s.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Ce qui t'aide quand ça compte */}
      <div className="mb-8">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">
          Ce qui t&apos;aide quand ça compte
        </p>
        {topEmerger.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {topEmerger.map((v) => (
              <span
                key={v}
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-beige text-espresso"
              >
                {v}
              </span>
            ))}
          </div>
        ) : (
          <p className="font-body text-sm text-warm-gray/60 italic">
            Les gestes reviendront ici.
          </p>
        )}
      </div>

      {/* Liste des sessions */}
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
                          {s.veriteInterieure
                            ? `"${s.veriteInterieure}"`
                            : s.emotionPrimaire}
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
                  {s.veriteInterieure && (
                    <div className="border-l-[3px] border-terra/40 pl-4 py-2 mb-4">
                      <p className="font-body text-base italic text-espresso">
                        &ldquo;{s.veriteInterieure}&rdquo;
                      </p>
                    </div>
                  )}
                  <div className="space-y-3">
                    {["traverser","reconnaitre","ancrer","conscientiser","emerger","aligner"].map((stepId) => {
                      const content = s.steps[stepId as keyof typeof s.steps];
                      if (!content) return null;
                      const stepNames: Record<string, string> = {
                        traverser: "Traverser",
                        reconnaitre: "Reconnaître",
                        ancrer: "Ancrer",
                        conscientiser: "Écouter",
                        emerger: "Émerger",
                        aligner: "Aligner",
                      };
                      return (
                        <div key={stepId}>
                          <h4 className="text-xs font-medium tracking-widest uppercase text-terra/70 mb-1">
                            {stepNames[stepId] || stepId}
                          </h4>
                          <p className="font-body text-sm text-espresso leading-relaxed">
                            {content}
                          </p>
                        </div>
                      );
                    })}
                  </div>

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
                        if (confirm("Supprimer cette trace ?")) {
                          handleDelete(s.id);
                        }
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
  );
}
