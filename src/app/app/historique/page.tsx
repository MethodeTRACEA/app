"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getCompletedSessionsDb, deleteSessionDb, updateSessionDb, getTopEmergerValues, getSessionEndCount, getTopRessentiValues, getPremiumMemory } from "@/lib/supabase-store";
import type { PremiumMemory } from "@/lib/supabase-store";
import type { SessionData } from "@/lib/types";
import Link from "next/link";

export default function HistoriquePage() {
  const { user, loading: authLoading, hasPremiumAccess } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [topEmerger, setTopEmerger] = useState<string[]>([]);
  const [sessionEndCount, setSessionEndCount] = useState(0);
  const [topRessentis, setTopRessentis] = useState<string[]>([]);
  const [premiumMemory, setPremiumMemory] = useState<PremiumMemory | null | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    const queries: Promise<unknown>[] = [
      getCompletedSessionsDb(user.id),
      getTopEmergerValues(user.id),
      getSessionEndCount(user.id),
      getTopRessentiValues(user.id, 12),
    ];
    if (hasPremiumAccess) queries.push(getPremiumMemory(user.id));

    Promise.all(queries).then((results) => {
      const [data, emerger, endCount, ressentis, pm] = results as [
        Awaited<ReturnType<typeof getCompletedSessionsDb>>,
        Awaited<ReturnType<typeof getTopEmergerValues>>,
        Awaited<ReturnType<typeof getSessionEndCount>>,
        Awaited<ReturnType<typeof getTopRessentiValues>>,
        PremiumMemory | null | undefined,
      ];
      setSessions(data);
      setTopEmerger(emerger);
      setSessionEndCount(endCount);
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

  // ── Texte dynamique depuis tracking ──────────────────────
  const ligne1 =
    sessionEndCount <= 1 ? "Tu es revenu·e ici." :
    sessionEndCount === 2 ? "Tu es revenu·e ici deux fois." :
    "Tu es revenu·e ici plusieurs fois.";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="section-title">Traces</h1>

      {/* ── Repères premium ── */}
      {hasPremiumAccess && (
        <div className="mb-10">
          {premiumMemory === undefined ? null /* chargement silencieux */ : premiumMemory === null ? (
            <div className="card-base p-6">
              <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-2">Repères</p>
              <p className="font-body text-sm text-warm-gray italic">
                Les repères se dessineront ici avec le temps.
              </p>
            </div>
          ) : (
            <div className="card-base p-6 space-y-5">
              <p className="text-xs font-medium tracking-widest uppercase text-warm-gray">Repères</p>
              {(
                [
                  { label: "Ce qui revient",         text: premiumMemory.ceQuiRevient },
                  { label: "Ce qui semble demandé",  text: premiumMemory.ceQuiSembleDemandem },
                  { label: "Ce qui t'aide",           text: premiumMemory.ceQuiTAide },
                  { label: "Ce que tu peux tester",  text: premiumMemory.ceQuePeutTester },
                ] as { label: string; text: string | null }[]
              )
                .filter((b) => b.text)
                .map((block) => (
                  <div key={block.label}>
                    <p className="text-[11px] font-medium tracking-wider uppercase text-terra/60 mb-1">
                      {block.label}
                    </p>
                    <p className="font-body text-base text-espresso leading-relaxed">
                      {block.text}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* CTA premium pour les utilisateurs gratuits */}
      {!hasPremiumAccess && sessions.length >= 1 && (
        <div className="mb-10 rounded-2xl border border-beige-dark bg-beige/40 p-6 text-center">
          <p className="font-body text-sm text-warm-gray leading-relaxed mb-4">
            Tes repères — ce qui revient, ce qui t&apos;aide — se dessinent ici avec l&apos;accès complet.
          </p>
          <Link href="/app/subscribe" className="btn-primary !px-6 !py-2.5 !text-xs inline-block">
            Accès complet
          </Link>
        </div>
      )}

      {/* Bloc d'accueil */}
      <div className="mb-10">
        {sessionEndCount === 0 ? (
          <div className="space-y-2">
            <p className="font-body text-base text-espresso/80 leading-relaxed">
              Tu es revenu·e ici.
            </p>
            <p className="font-body text-base text-espresso/80 leading-relaxed">
              Tu as pris le temps quand même.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="font-body text-base text-espresso/80 leading-relaxed">
              {ligne1}
            </p>
            {topRessentis.length > 0 ? (
              <p className="font-body text-base text-warm-gray leading-relaxed">
                {topRessentis[0] && <>Parfois, c&apos;était {topRessentis[0]}.</>}
                {topRessentis[1] && <><br />Parfois, c&apos;était {topRessentis[1]}.</>}
              </p>
            ) : null}
            <p className="font-body text-base text-espresso/80 leading-relaxed">
              Tu as pris le temps quand même.
            </p>
          </div>
        )}
      </div>

      {/* Ce qui revient */}
      {(sessions.length > 0 || topRessentis.length > 0) && (() => {
        const counts: Record<string, number> = {};
        sessions.forEach((s) => {
          if (s.emotionPrimaire) {
            const e = s.emotionPrimaire.toLowerCase().trim().slice(0, 30);
            counts[e] = (counts[e] || 0) + 1;
          }
        });
        topRessentis.forEach((r) => {
          const e = r.toLowerCase().trim().slice(0, 30);
          counts[e] = (counts[e] || 0) + 1;
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

      {/* Quand ça monte */}
      <div className="mb-8">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">
          Quand ça monte
        </p>
        {topEmerger.length > 0 ? (
          <div className="space-y-2">
            <p className="font-body text-sm text-espresso/70">
              ce qui t&apos;aide le plus : <span className="text-espresso font-medium">{topEmerger[0]}</span>
            </p>
            <p className="font-body text-sm text-warm-gray/60 italic">
              Tu peux commencer par ça.
            </p>
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
