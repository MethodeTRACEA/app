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
        <div className="rounded-card overflow-hidden border border-beige-dark flex flex-col md:flex-row min-h-[320px]">

          {/* Gauche — espresso */}
          <div className="bg-espresso px-10 py-16 flex flex-col justify-center md:w-1/2 relative overflow-hidden">
            <div className="absolute top-[-60px] right-[-60px] w-[220px] h-[220px] rounded-full bg-terra/10 pointer-events-none" />
            <div className="absolute bottom-[-40px] left-[-40px] w-[160px] h-[160px] rounded-full bg-sage/5 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-xs font-medium tracking-widest uppercase text-terra mb-5">
                Entraînement émotionnel · Protocole structuré
              </p>
              <h1 className="font-serif text-2xl md:text-3xl text-terra-light leading-tight mb-8">
                Traverser. Reconnaître. Ancrer.
                Conscientiser. Émerger. Aligner.
              </h1>
              <div className="flex gap-2 flex-wrap">
                {[
                  { letter: "T", bg: "#C4704A" },
                  { letter: "R", bg: "rgba(196,112,74,0.8)" },
                  { letter: "A", bg: "#8A9E7A" },
                  { letter: "C", bg: "#C4998A" },
                  { letter: "É", bg: "#9E8E80" },
                  { letter: "A", bg: "#8A4A2F" },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{ backgroundColor: s.bg }}
                    className="w-9 h-9 rounded-full flex items-center justify-center font-serif text-sm text-cream flex-shrink-0"
                  >
                    {s.letter}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Droite — crème */}
          <div className="bg-cream px-10 py-16 flex flex-col justify-center md:w-1/2 border-t md:border-t-0 md:border-l border-beige-dark">
            <p className="font-body text-base text-espresso/80 leading-relaxed mb-3">
              Un entraînement structuré, fondé sur la neurophysiologie
              du système nerveux — pour traverser ce que tu portes,
              pas juste l&apos;observer.
            </p>
            <p className="font-body text-sm text-warm-gray leading-relaxed italic mb-8">
              Pas de jugement. Pas de diagnostic.
              Un miroir bienveillant, disponible quand tu en as besoin.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/session" className="btn-primary inline-block">
                Commencer ma traversée
              </Link>
              {stats.total > 0 && (
                <Link
                  href="/historique"
                  className="btn-secondary inline-block"
                >
                  Mon journal
                </Link>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Stats */}
      {stats.total > 0 && (
        <section className="mb-16">
          <p className="section-label">Ton parcours</p>
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
          Chaque traversée te guide du ressenti brut vers une vérité — et d&apos;une vérité vers un geste concret dans ta vie.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { n: "1", name: "Traverser", desc: "Accueillir ce qui est là, sans le fuir", color: "bg-terra" },
            { n: "2", name: "Reconnaître", desc: "Descendre vers l'émotion vraie", color: "bg-terra/80" },
            { n: "3", name: "Ancrer", desc: "Revenir dans le corps par la respiration", color: "bg-sage" },
            { n: "4", name: "Conscientiser", desc: "Comprendre ce que l'émotion porte", color: "bg-dusty" },
            { n: "5", name: "Émerger", desc: "Laisser venir une vérité intérieure", color: "bg-warm-gray" },
            { n: "6", name: "Aligner", desc: "Choisir un geste aligné avec toi", color: "bg-terra-dark" },
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
          TRACÉA n&apos;est pas ce que tu connais déjà.
        </h2>

        <div className="space-y-5 mb-10">
          <p className="font-body text-base text-espresso/85 leading-relaxed">
            Les applications de méditation t&apos;apprennent à observer tes émotions sans t&apos;y attacher.
            C&apos;est précieux. Mais quand une émotion intense surgit, observer ne suffit pas.
          </p>
          <p className="font-body text-base text-espresso/85 leading-relaxed">
            Les trackers d&apos;humeur enregistrent ce que tu ressens.
            Ils ne t&apos;aident pas à le traverser.
          </p>
          <p className="font-body text-base text-espresso/85 leading-relaxed">
            Les programmes de développement personnel visent tes objectifs, tes habitudes, ta performance.
            Ils passent souvent à côté de ce qui bloque vraiment.
          </p>
          <p className="font-serif text-lg text-terra font-medium mt-6">
            TRACÉA fait autre chose.
          </p>
          <p className="font-body text-base text-espresso/85 leading-relaxed">
            TRACÉA est un protocole neurophysiologique structuré en six étapes précises,
            chacune avec une fonction spécifique dans ton système nerveux.
            On ne te demande pas d&apos;observer. On t&apos;accompagne pour traverser, stabiliser, comprendre et agir.
          </p>
          <p className="font-body text-base text-espresso/85 leading-relaxed">
            Ce n&apos;est pas de la méditation. Ce n&apos;est pas du coaching.
            C&apos;est un entraînement, comme on entraîne un muscle.
            Et comme tout entraînement, ça se pratique, ça s&apos;approfondit, et ça transforme.
          </p>
        </div>

        {/* Comparaison fluide */}
        <div className="grid grid-cols-[1fr_auto_1fr] mb-2 px-1">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray">
            Les autres
          </p>
          <div className="w-13" />
          <p className="text-xs font-medium tracking-widest uppercase text-terra px-5">
            TRACÉA
          </p>
        </div>
        <div className="space-y-3">
          {[
            { other: "Observer l'émotion à distance", tracea: "Traverser l'émotion de l'intérieur", change: "Tu n'évites plus, tu intègres" },
            { other: "Enregistrer ton humeur du jour", tracea: "Nommer l'émotion primaire cachée", change: "Tu comprends ce qui se passe vraiment" },
            { other: "Respirer pour se calmer", tracea: "Ancrer le corps dans la sécurité", change: "Ton corps retrouve son calme" },
            { other: "Analyser ses pensées", tracea: "Conscientiser les schémas profonds", change: "Tu vois tes réflexes sans les juger" },
            { other: "Fixer des objectifs", tracea: "Laisser émerger une vérité intérieure", change: "Tu agis depuis qui tu es" },
            { other: "Suivre des habitudes", tracea: "Poser un geste aligné, maintenant", change: "Chaque traversée transforme concrètement" },
          ].map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto_1fr] rounded-[14px] overflow-hidden border border-beige-dark">
              <div className="px-5 py-5 bg-beige/40">
                <p className="font-body text-sm text-warm-gray leading-relaxed">
                  {row.other}
                </p>
              </div>
              <div className="flex items-center justify-center px-3 bg-cream">
                <div className="w-7 h-7 rounded-full bg-terra flex items-center justify-center text-cream text-xs flex-shrink-0">
                  →
                </div>
              </div>
              <div className="px-5 py-5 bg-white border-l border-beige-dark">
                <p className="font-body text-sm text-espresso font-medium leading-relaxed mb-1">
                  {row.tracea}
                </p>
                <p className="font-body text-xs text-sage italic mt-1">
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
          &ldquo;Ce n&apos;est pas ta sensibilité qui te fragilise. C&apos;est
          de ne jamais avoir appris à la traverser.&rdquo;
        </p>
      </div>
    </div>
  );
}
