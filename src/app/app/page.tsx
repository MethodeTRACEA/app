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
        <p className="font-body text-base md:text-lg text-espresso/70 leading-relaxed mb-8">
          Un espace pour revenir &agrave; quelque chose de plus supportable.
        </p>
        <Link
          href="/app/traversee-courte"
          className="btn-primary inline-block text-center !py-4 !text-base !rounded-2xl"
        >
          Commencer une travers&eacute;e
        </Link>
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

    </div>
  );
}
