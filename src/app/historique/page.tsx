"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getCompletedSessionsDb, deleteSessionDb } from "@/lib/supabase-store";
import type { SessionData } from "@/lib/types";
import Link from "next/link";
import { updateSessionDb } from "@/lib/supabase-store";

export default function HistoriquePage() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

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
          Connecte-toi pour retrouver ton historique de sessions.
        </p>
        <Link href="/connexion" className="btn-primary inline-block">
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <p className="section-label">Journal</p>
      <h1 className="section-title">Historique des traversées</h1>
      <p className="text-warm-gray mb-8 leading-relaxed">
        {sessions.length === 0
          ? "Aucune session complétée. Commence ta première traversée."
          : `${sessions.length} session${sessions.length > 1 ? "s" : ""} complétée${sessions.length > 1 ? "s" : ""}.`}
      </p>

      {sessions.length > 0 && (
        <div className="card-base mb-8">
          <h3 className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">
            Émotions traversées
          </h3>
          <div className="flex flex-wrap gap-2">
            {(() => {
              const counts: Record<string, number> = {};
              sessions.forEach((s) => {
                if (s.emotionPrimaire) {
                  const e = s.emotionPrimaire.toLowerCase().trim().slice(0, 30);
                  counts[e] = (counts[e] || 0) + 1;
                }
              });
              return Object.entries(counts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 12)
                .map(([emotion, count]) => (
                  <span
                    key={emotion}
                    className="px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor:
                        count > 2 ? "#F0D5C4" : count > 1 ? "#D6E2CE" : "#F5EDE2",
                      color: count > 2 ? "#8A4A2F" : "#2C1F14",
                    }}
                  >
                    {emotion}
                    {count > 1 && (
                      <span className="ml-1 text-xs opacity-60">x{count}</span>
                    )}
                  </span>
                ));
            })()}
          </div>
        </div>
      )}

      {sessions.filter(s => s.veriteInterieure).length > 0 && (
        <div className="mb-10">
          <p className="text-xs font-medium tracking-widest uppercase text-terra mb-5">
            Ton fil de vérités intérieures
          </p>
          <div className="space-y-4">
            {sessions
              .filter(s => s.veriteInterieure)
              .map((s, i) => (
                <div key={s.id} className="flex gap-4 items-start">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-terra mt-1.5" />
                    {i < sessions.filter(s => s.veriteInterieure).length - 1 && (
                      <div className="w-px flex-1 bg-terra/20 mt-1 min-h-[2rem]" />
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

      <div className="space-y-3">
        {sessions.map((s) => {
          const isExpanded = expandedId === s.id;
          const recovery =
            s.intensiteAfter !== null
              ? s.intensiteBefore - s.intensiteAfter
              : null;

          return (
            <div key={s.id} className="card-base !p-0 overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : s.id)}
                className="w-full text-left"
              >
                <div className="flex items-stretch">
                  <div
                    className="w-1.5 flex-shrink-0 rounded-l-card"
                    style={{
                      backgroundColor:
                        s.context === "relationnel" ? "#C4704A" :
                        s.context === "existentiel" ? "#8A9E7A" :
                        s.context === "professionnel" ? "#C4998A" : "#9E8E80"
                    }}
                  />
                  <div className="flex-1 px-5 py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-serif text-lg text-espresso">
                          {new Date(s.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-warm-gray mt-0.5">
                          {s.context} ·{" "}
                          {new Date(s.date).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {recovery !== null && recovery > 0 && (
                          <span className="font-serif text-base text-sage">
                            ↓ {recovery} pts
                          </span>
                        )}
                        <span className="text-xs text-warm-gray">
                          {s.intensiteBefore}/10 → {s.intensiteAfter}/10
                        </span>
                        <span className={`transition-transform duration-200 text-warm-gray ${isExpanded ? "rotate-90" : ""}`}>
                          ▸
                        </span>
                      </div>
                    </div>
                    {s.veriteInterieure && !isExpanded && (
                      <p className="font-body italic text-sm text-warm-gray mt-2 truncate">
                        &ldquo;{s.veriteInterieure}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-4 pt-2 ml-1.5 border-t border-beige-dark animate-fade-up">
                  {s.veriteInterieure && (
                    <div className="border-l-[3px] border-terra pl-4 py-2 mb-4">
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
                        conscientiser: "Conscientiser",
                        emerger: "Émerger",
                        aligner: "Aligner",
                      };
                      return (
                        <div key={stepId}>
                          <h4 className="text-xs font-medium tracking-widest uppercase text-terra mb-1">
                            {stepNames[stepId] || stepId}
                          </h4>
                          <p className="font-body text-sm text-espresso leading-relaxed">
                            {content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  {s.analysis && (
                    <div className="mt-4 pt-4 border-t border-beige-dark">
                      <h4 className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-2">
                        Analyse
                      </h4>
                      <pre className="font-body text-sm text-espresso leading-relaxed whitespace-pre-wrap">
                        {s.analysis}
                      </pre>
                    </div>
                  )}
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
                        if (confirm("Supprimer cette session ?")) {
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
