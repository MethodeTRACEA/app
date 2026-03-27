"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStats, getLastSession } from "@/lib/store";
import type { SessionData } from "@/lib/types";

export default function Accueil() {
  const [stats, setStats] = useState({
    total: 0,
    avgRecovery: 0,
    topEmotions: [] as string[],
    lastWeekCount: 0,
  });
  const [lastSession, setLastSession] = useState<SessionData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStats(getStats());
    setLastSession(getLastSession());
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="font-serif text-4xl text-terra animate-pulse-gentle">
          TRACEA
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="mb-16">
        <div className="bg-espresso rounded-card p-10 md:p-16 relative overflow-hidden">
          <div className="absolute top-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full bg-terra/10 pointer-events-none" />
          <div className="absolute bottom-[-40px] left-[-40px] w-[200px] h-[200px] rounded-full bg-sage/5 pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <p className="section-label !text-terra mb-5">
              Régulation émotionnelle structurée
            </p>
            <h1 className="font-serif text-3xl md:text-5xl text-terra-light leading-tight mb-6">
              Traverser. Reconnaître. Ancrer. Conscientiser. Émerger. Aligner.
            </h1>
            <p className="font-body text-lg text-beige-dark leading-relaxed mb-10 italic max-w-2xl mx-auto">
              TRACÉA n&apos;est pas une méditation. C&apos;est un entraînement
              structuré, fondé sur la neurophysiologie, avec des résultats
              mesurables.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Link href="/session" className="btn-primary inline-block">
                Commencer une session
              </Link>
              {stats.total > 0 && (
                <Link href="/historique" className="btn-secondary inline-block !border-terra-light/30 !text-beige-dark hover:!bg-terra/10">
                  Voir mon historique
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats.total > 0 && (
        <section className="mb-16">
          <p className="section-label">Votre parcours</p>
          <h2 className="section-title">Tableau de bord</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="card-base text-center">
              <div className="font-serif text-3xl text-terra">
                {stats.total}
              </div>
              <div className="text-xs text-warm-gray mt-1 tracking-wide uppercase">
                Sessions
              </div>
            </div>
            <div className="card-base text-center">
              <div className="font-serif text-3xl text-sage">
                {stats.lastWeekCount}
              </div>
              <div className="text-xs text-warm-gray mt-1 tracking-wide uppercase">
                Cette semaine
              </div>
            </div>
            <div className="card-base text-center">
              {stats.avgRecovery > 0 ? (
                <>
                  <div className="font-serif text-3xl text-sage">
                    {stats.avgRecovery.toFixed(1)} <span className="text-lg">pts</span>
                  </div>
                  <div className="text-xs text-sage mt-1 tracking-wide uppercase">
                    Régulation gagnée ✦
                  </div>
                </>
              ) : stats.avgRecovery === 0 ? (
                <>
                  <div className="font-serif text-3xl text-warm-gray">~</div>
                  <div className="text-xs text-warm-gray mt-1 tracking-wide uppercase">
                    Stabilité maintenue
                  </div>
                </>
              ) : (
                <>
                  <div className="font-serif text-3xl text-terra">↻</div>
                  <div className="text-xs text-terra mt-1 tracking-wide uppercase">
                    Traversée en cours
                  </div>
                </>
              )}
            </div>
            <div className="card-base text-center">
              <div className="font-serif text-3xl text-espresso">
                {stats.topEmotions[0] || "—"}
              </div>
              <div className="text-xs text-warm-gray mt-1 tracking-wide uppercase">
                Émotion récurrente
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Last session */}
      {lastSession && lastSession.completed && (
        <section className="mb-16">
          <p className="section-label">Dernière traversée</p>
          <div className="card-accent">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-warm-gray">
                {new Date(lastSession.date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="text-xs text-sage font-medium">
                {lastSession.intensiteBefore} → {lastSession.intensiteAfter}/10
              </span>
            </div>
            {lastSession.veriteInterieure && (
              <p className="font-body text-lg text-espresso italic leading-relaxed">
                &ldquo;{lastSession.veriteInterieure}&rdquo;
              </p>
            )}
            {lastSession.actionAlignee && (
              <p className="text-sm text-warm-gray mt-2">
                Action : {lastSession.actionAlignee}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Protocol overview */}
      <section>
        <p className="section-label">Le protocole</p>
        <h2 className="section-title">6 étapes, une traversée complète</h2>
        <p className="text-warm-gray max-w-xl mb-10 leading-relaxed">
          Chaque session TRACÉA vous guide à travers un processus structuré,
          du ressenti brut vers l&apos;action alignée.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { n: "1", name: "Traverser", desc: "Accueillir l'émotion brute", color: "bg-terra" },
            { n: "2", name: "Reconnaître", desc: "Nommer l'émotion primaire", color: "bg-terra" },
            { n: "3", name: "Ancrer", desc: "Stabiliser le système nerveux", color: "bg-sage" },
            { n: "4", name: "Conscientiser", desc: "Éclairer le message profond", color: "bg-dusty" },
            { n: "5", name: "Émerger", desc: "Laisser apparaître la vérité", color: "bg-warm-gray" },
            { n: "6", name: "Aligner", desc: "Poser une action concrète", color: "bg-espresso" },
          ].map((step) => (
            <div key={step.n} className="flex items-stretch card-base !p-0 overflow-hidden">
              <div
                className={`${step.color} w-14 flex items-center justify-center font-serif text-xl text-cream flex-shrink-0`}
              >
                {step.n}
              </div>
              <div className="p-4">
                <div className="font-serif text-base text-espresso">
                  {step.name}
                </div>
                <div className="text-xs text-warm-gray italic mt-0.5">
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Différenciation */}
      <section className="mt-20 mb-16">
        <p className="section-label">Ce qui nous distingue</p>
        <h2 className="font-serif text-2xl md:text-3xl text-espresso mb-6 leading-tight">
          TRACÉA n&apos;est pas ce que vous connaissez déjà.
        </h2>

        <div className="space-y-5 mb-10">
          <p className="font-body text-base text-espresso/85 leading-relaxed">
            Les applications de méditation vous apprennent à observer vos émotions sans vous y attacher.
            C&apos;est précieux. Mais quand une émotion intense surgit, observer ne suffit pas.
          </p>
          <p className="font-body text-base text-espresso/85 leading-relaxed">
            Les trackers d&apos;humeur enregistrent ce que vous ressentez.
            Ils ne vous aident pas à le traverser.
          </p>
          <p className="font-body text-base text-espresso/85 leading-relaxed">
            Les programmes de développement personnel visent vos objectifs, vos habitudes, votre performance.
            Ils passent souvent à côté de ce qui bloque vraiment.
          </p>
          <p className="font-serif text-lg text-terra font-medium mt-6">
            TRACÉA fait autre chose.
          </p>
          <p className="font-body text-base text-espresso/85 leading-relaxed">
            TRACÉA est un protocole neurophysiologique structuré en six étapes précises,
            chacune avec une fonction spécifique dans votre système nerveux.
            On ne vous demande pas d&apos;observer. On vous guide pour traverser, réguler, comprendre et agir.
          </p>
          <p className="font-body text-base text-espresso/85 leading-relaxed">
            Ce n&apos;est pas de la méditation. Ce n&apos;est pas du coaching.
            C&apos;est un entraînement, comme on entraîne un muscle.
            Et comme tout entraînement, ça se mesure, ça se pratique, et ça transforme.
          </p>
        </div>

        {/* Tableau comparatif */}
        <div className="rounded-[18px] border border-beige-dark overflow-hidden">
          {/* En-tête */}
          <div className="grid grid-cols-3 text-center">
            <div className="bg-beige px-4 py-4 border-r border-beige-dark">
              <span className="text-xs font-medium tracking-widest uppercase text-warm-gray">
                Les autres
              </span>
            </div>
            <div className="bg-terra px-4 py-4 border-r border-terra-dark/20">
              <span className="text-xs font-medium tracking-widest uppercase text-cream">
                TRACÉA
              </span>
            </div>
            <div className="bg-sage/15 px-4 py-4">
              <span className="text-xs font-medium tracking-widest uppercase text-sage-dark">
                Ce que ça change
              </span>
            </div>
          </div>

          {/* Lignes */}
          {[
            {
              other: "Observer l'émotion à distance",
              tracea: "Traverser l'émotion de l'intérieur",
              change: "Vous n'évitez plus, vous intégrez",
            },
            {
              other: "Enregistrer votre humeur du jour",
              tracea: "Nommer l'émotion primaire cachée",
              change: "Vous comprenez ce qui se passe vraiment",
            },
            {
              other: "Respirer pour se calmer",
              tracea: "Réguler le système nerveux (4/6s)",
              change: "Votre corps retrouve sa sécurité",
            },
            {
              other: "Analyser ses pensées",
              tracea: "Conscientiser les schémas profonds",
              change: "Vous voyez vos réflexes sans les juger",
            },
            {
              other: "Fixer des objectifs de performance",
              tracea: "Laisser émerger une vérité intérieure",
              change: "Vous agissez depuis qui vous êtes",
            },
            {
              other: "Suivre des habitudes",
              tracea: "Poser une action alignée, maintenant",
              change: "Chaque session transforme concrètement",
            },
          ].map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-3 ${
                i % 2 === 0 ? "bg-cream" : "bg-beige/30"
              } ${i < 5 ? "border-b border-beige-dark/50" : ""}`}
            >
              <div className="px-4 py-4 border-r border-beige-dark/50 flex items-center">
                <p className="font-body text-sm text-warm-gray leading-snug">
                  {row.other}
                </p>
              </div>
              <div className="px-4 py-4 border-r border-beige-dark/50 flex items-center">
                <p className="font-body text-sm text-espresso font-medium leading-snug">
                  {row.tracea}
                </p>
              </div>
              <div className="px-4 py-4 flex items-center">
                <p className="font-body text-sm text-sage-dark italic leading-snug">
                  {row.change}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <div className="mt-16 border-l-[3px] border-terra pl-8 py-4">
        <p className="font-body text-xl md:text-2xl italic text-espresso leading-relaxed">
          &ldquo;Ce n&apos;est pas votre sensibilité qui vous épuise. C&apos;est
          la lenteur de votre récupération.&rdquo;
        </p>
      </div>
    </div>
  );
}
