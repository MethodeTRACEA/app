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
    <div className="max-w-2xl mx-auto px-4 py-10 md:py-16">
      {/* Hero court */}
      <section className="text-center mb-10 md:mb-14">
        <h1 className="font-serif text-2xl md:text-4xl text-espresso mb-4 leading-tight">
          Bienvenue dans TRACEA
        </h1>
        <p className="font-body text-base md:text-lg text-espresso/70 leading-relaxed mb-2">
          Un espace pour faire redescendre ce qui d&eacute;borde.
        </p>
        <p className="font-body text-sm text-warm-gray mb-8">
          En 5 &agrave; 10 minutes, &agrave; ton rythme.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/app/traversee-courte"
            className="btn-primary inline-block text-center !py-4 !text-base !rounded-2xl"
          >
            Commencer une travers&eacute;e
          </Link>
          {stats.total > 0 && (
            <Link
              href="/app/historique"
              className="btn-secondary inline-block text-center !py-3 !rounded-2xl text-sm"
            >
              Voir mon historique
            </Link>
          )}
        </div>
      </section>

      {/* Dernière session (si existe) */}
      {lastSession && lastSession.completed && (
        <section className="mb-10">
          <div className="card-accent">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-warm-gray">
                Derni&egrave;re travers&eacute;e &middot;{" "}
                {new Date(lastSession.date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                })}
              </span>
              <span className="text-xs text-sage font-medium">
                {lastSession.intensiteBefore} &rarr; {lastSession.intensiteAfter}/10
              </span>
            </div>
            {lastSession.veriteInterieure && (
              <p className="font-body text-base text-espresso italic leading-relaxed">
                &ldquo;{lastSession.veriteInterieure}&rdquo;
              </p>
            )}
          </div>
        </section>
      )}

      {/* Accès rapide — 3 cartes */}
      <section className="mb-10 md:mb-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/app/traversee-courte"
            className="card-base flex items-center gap-3 hover:border-terra/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-terra flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cream"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
            <div>
              <p className="font-serif text-sm text-espresso group-hover:text-terra transition-colors">Travers&eacute;e</p>
              <p className="text-xs text-warm-gray">Commencer maintenant</p>
            </div>
          </Link>
          <Link
            href="/app/historique"
            className="card-base flex items-center gap-3 hover:border-sage/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cream"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
            </div>
            <div>
              <p className="font-serif text-sm text-espresso group-hover:text-sage transition-colors">Historique</p>
              <p className="text-xs text-warm-gray">Mes travers&eacute;es</p>
            </div>
          </Link>
          <Link
            href="/app/ressources"
            className="card-base flex items-center gap-3 hover:border-warm-gray/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-warm-gray flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cream"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </div>
            <div>
              <p className="font-serif text-sm text-espresso group-hover:text-warm-gray transition-colors">Ressources</p>
              <p className="text-xs text-warm-gray">Outils &amp; infos</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Stats compactes (si sessions existantes) */}
      {stats.total > 0 && (
        <section className="mb-10 md:mb-14">
          <div className="grid grid-cols-3 gap-3">
            <div className="card-base text-center !py-4">
              <div className="font-serif text-2xl text-terra">{stats.total}</div>
              <div className="text-[10px] text-warm-gray mt-1 tracking-wide uppercase">Sessions</div>
            </div>
            <div className="card-base text-center !py-4">
              <div className="font-serif text-2xl text-sage">{stats.lastWeekCount}</div>
              <div className="text-[10px] text-warm-gray mt-1 tracking-wide uppercase">Cette semaine</div>
            </div>
            <div className="card-base text-center !py-4">
              {stats.avgRecovery > 0 ? (
                <>
                  <div className="font-serif text-2xl text-sage">
                    -{stats.avgRecovery.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-sage mt-1 tracking-wide uppercase">R&eacute;gulation</div>
                </>
              ) : (
                <>
                  <div className="font-serif text-2xl text-warm-gray">~</div>
                  <div className="text-[10px] text-warm-gray mt-1 tracking-wide uppercase">Stable</div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Rappel méthode court */}
      <section className="mb-6">
        <div className="card-base text-center !py-6 md:!py-8">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">
            La m&eacute;thode
          </p>
          <p className="font-body text-sm md:text-base text-espresso/80 leading-relaxed mb-4">
            6 &eacute;tapes pour revenir &agrave; un &eacute;tat plus stable :
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-5">
            {[
              { name: "Traverser", color: "bg-terra" },
              { name: "Reconna\u00eetre", color: "bg-dusty" },
              { name: "Ancrer", color: "bg-sage" },
              { name: "Conscientiser", color: "bg-warm-gray" },
              { name: "\u00c9merger", color: "bg-espresso" },
              { name: "Aligner", color: "bg-terra-dark" },
            ].map((step) => (
              <span
                key={step.name}
                className={`${step.color} text-cream text-xs font-medium px-3 py-1.5 rounded-full`}
              >
                {step.name}
              </span>
            ))}
          </div>
          <Link
            href="/app/ressources"
            className="text-sm text-warm-gray hover:text-terra transition-colors underline underline-offset-2"
          >
            Comprendre la m&eacute;thode
          </Link>
        </div>
      </section>
    </div>
  );
}
