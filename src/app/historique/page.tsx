"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getCompletedSessionsDb, deleteSessionDb } from "@/lib/supabase-store";
import type { SessionData } from "@/lib/types";
import Link from "next/link";

export default function HistoriquePage() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
          Connectez-vous pour retrouver votre historique de sessions.
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <p className="section-label">Journal</p>
      <h1 className="section-title">Historique des traversées</h1>
      <p className="text-warm-gray mb-8 leading-relaxed">
        {sessions.length === 0
          ? "Aucune session complétée. Commencez votre première traversée."
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

      <div className="space-y-3">
        {sessions.map((s) => {
          const isExpanded = expandedId === s.id;
          const recovery =
            s.intensiteAfter !== null
              ? s.intensiteBefore - s.intensiteAfter
              : null;

          return (
            <div key={s.id} className="card-base">
              <button
                onClick={() => setExpandedId(isExpanded ? null : s.id)}
                className="w-full text-left"
              >
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
                    {recovery !== null && (
                      <span
                        className={`text-sm font-medium ${
                          recovery > 0 ? "text-sage" : "text-warm-gray"
                        }`}
                      >
                        {recovery > 0
                          ? `↓ -${recovery}`
                          : recovery === 0
                          ? "="
                          : `↑ +${Math.abs(recovery)}`}
                      </span>
                    )}
                    <span className="text-xs text-warm-gray">
                      {s.intensiteBefore}/10 → {s.intensiteAfter}/10
                    </span>
                    <span
                      className={`transition-transform duration-200 text-warm-gray ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    >
                      ▸
                    </span>
                  </div>
                </div>
                {s.veriteInterieure && !isExpanded && (
                  <p className="font-body italic text-sm text-warm-gray mt-2 truncate">
                    &ldquo;{s.veriteInterieure}&rdquo;
                  </p>
                )}
              </button>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-beige-dark animate-fade-up">
                  {s.veriteInterieure && (
                    <div className="border-l-[3px] border-terra pl-4 py-2 mb-4">
                      <p className="font-body text-base italic text-espresso">
                        &ldquo;{s.veriteInterieure}&rdquo;
                      </p>
                    </div>
                  )}
                  <div className="space-y-3">
                    {Object.entries(s.steps).map(([stepId, content]) => {
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
