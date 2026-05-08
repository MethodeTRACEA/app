"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStats, getLastSession } from "@/lib/store";
import { shouldShowNudge, markNudgeShownToday } from "@/lib/reminder";
import { SafetyResources } from "@/components/SafetyResources";
import { InstallPrompt } from "@/components/InstallPrompt";
import { ReminderPrompt } from "@/components/ReminderPrompt";
import { ReportProblem } from "@/components/ReportProblem";
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
  const [showNudge, setShowNudge] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStats(getStats());
    setLastSession(getLastSession());
    if (shouldShowNudge()) {
      setShowNudge(true);
      markNudgeShownToday();
    }
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div
          className="font-body text-4xl animate-pulse-gentle"
          style={{ color: "var(--step-traverser)" }}
        >
          TRACEA
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "#1A120D" }}
    >
      {/* Background gradients V3 — calqués sur la landing */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(184,99,79,0.13) 0%, rgba(184,99,79,0.05) 34%, transparent 66%), " +
            "radial-gradient(ellipse at 15% 0%, rgba(111,106,100,0.16) 0%, transparent 58%)",
        }}
      />

      {/* Halo V3 — calqué sur la landing (terra ellipse top, persistant au scroll) */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(201,123,106,0.28) 0%, rgba(201,123,106,0) 75%)",
          zIndex: 0,
        }}
      />

      {/* Hero — titre + sous-titre dans le tiers supérieur, CTAs en bas, spacer fluide */}
      <div className="min-h-[calc(100svh-56px)] flex flex-col items-center pt-[8vh] pb-[6vh] px-6 relative z-[1]">

        {/* Titre + sous-titre */}
        <div className="text-center flex flex-col items-center gap-8">
          <h1
            className="font-body leading-tight"
            style={{
              fontSize: "clamp(30px, 8vw, 44px)",
              fontWeight: 300,
              color: "#F0E6D6",
              letterSpacing: "-0.01em",
            }}
          >
            Quand &ccedil;a d&eacute;borde
          </h1>
          <p
            className="font-sans leading-loose"
            style={{
              fontSize: "clamp(16px, 4.5vw, 19px)",
              fontWeight: 300,
              color: "rgba(240,230,214,0.60)",
            }}
          >
            Quand &ccedil;a serre,<br />
            que &ccedil;a tourne en boucle,<br />
            ou avant de r&eacute;pondre trop vite,
            <span className="block mt-4" style={{ fontWeight: 600 }}>
              choisis le chemin le plus simple.
            </span>
          </p>
        </div>

        {/* Spacer fluide */}
        <div className="flex-1" />

        {/* CTAs */}
        <div className="w-full max-w-md flex flex-col gap-5">
          <Link
            href="/start"
            className="w-full block text-center"
            style={{
              borderRadius: "999px",
              padding: "17px 26px",
              fontSize: "18px",
              fontWeight: 400,
              letterSpacing: "0.03em",
              color: "#1A120D",
              background:
                "linear-gradient(135deg, #D4A96A 0%, #C97B6A 42%, #B8634F 72%, #A5503E 100%)",
              boxShadow:
                "0 8px 28px rgba(184,99,79,0.30), 0 2px 8px rgba(0,0,0,0.35)",
            }}
          >
            Choisir ma travers&eacute;e
          </Link>
          <Link
            href="/app/urgence"
            className="w-full flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98]"
            style={{
              borderRadius: "999px",
              padding: "17px 26px",
              fontSize: "18px",
              fontWeight: 500,
              letterSpacing: "0.03em",
              color: "rgba(240,230,214,0.97)",
              background: "linear-gradient(180deg, rgba(212,169,106,0.22), rgba(139,63,45,0.35))",
              border: "1.5px solid rgba(212,169,106,0.50)",
              boxShadow: "0 0 22px rgba(212,169,106,0.40), 0 8px 24px rgba(0,0,0,0.60)",
              transition: "all 0.2s ease",
            }}
          >
            <span>M&apos;aider maintenant</span>
          </Link>
        </div>

      </div>

      {/* Zone 3 — sections secondaires */}
      <div className="w-full max-w-md mx-auto px-6 pb-10 space-y-4 relative z-[1]">

        {/* Dernière session (si existe) */}
        {lastSession && lastSession.completed && (
          <div
            style={{
              background: "rgba(111,106,100,0.14)",
              border: "1px solid rgba(240,230,214,0.085)",
              borderRadius: "22px",
              padding: "22px 24px",
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <span
                className="font-sans uppercase tracking-widest"
                style={{ fontSize: "10px", color: "var(--step-traverser)" }}
              >
                Derni&egrave;re travers&eacute;e &middot;{" "}
                {new Date(lastSession.date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                })}
              </span>
              <span
                className="font-sans"
                style={{ fontSize: "12px", color: "#8A9E7A" }}
              >
                {lastSession.intensiteBefore} &rarr; {lastSession.intensiteAfter}/10
              </span>
            </div>
            {lastSession.veriteInterieure && (
              <p
                className="font-body italic leading-relaxed mt-2"
                style={{ fontSize: "16px", color: "#F0E6D6" }}
              >
                &ldquo;{lastSession.veriteInterieure}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Stats compactes (si sessions existantes) */}
        {stats.total > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div
              className="text-center py-4"
              style={{
                background: "rgba(111,106,100,0.12)",
                border: "1px solid rgba(240,230,214,0.08)",
                borderRadius: "16px",
              }}
            >
              <div
                className="font-body text-2xl"
                style={{ color: "var(--step-traverser)" }}
              >
                {stats.total}
              </div>
              <div
                className="font-sans uppercase tracking-wide mt-1"
                style={{ fontSize: "10px", color: "rgba(240,230,214,0.38)" }}
              >
                Sessions
              </div>
            </div>
            <div
              className="text-center py-4"
              style={{
                background: "rgba(111,106,100,0.12)",
                border: "1px solid rgba(240,230,214,0.08)",
                borderRadius: "16px",
              }}
            >
              <div className="font-body text-2xl" style={{ color: "#8A9E7A" }}>
                {stats.lastWeekCount}
              </div>
              <div
                className="font-sans uppercase tracking-wide mt-1"
                style={{ fontSize: "10px", color: "rgba(240,230,214,0.38)" }}
              >
                Cette semaine
              </div>
            </div>
            <div
              className="text-center py-4"
              style={{
                background: "rgba(111,106,100,0.12)",
                border: "1px solid rgba(240,230,214,0.08)",
                borderRadius: "16px",
              }}
            >
              {stats.avgRecovery > 0 ? (
                <>
                  <div
                    className="font-body text-2xl"
                    style={{ color: "#8A9E7A" }}
                  >
                    -{stats.avgRecovery.toFixed(1)}
                  </div>
                  <div
                    className="font-sans uppercase tracking-wide mt-1"
                    style={{ fontSize: "10px", color: "rgba(240,230,214,0.38)" }}
                  >
                    R&eacute;gulation
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="font-body text-2xl"
                    style={{ color: "rgba(240,230,214,0.35)" }}
                  >
                    ~
                  </div>
                  <div
                    className="font-sans uppercase tracking-wide mt-1"
                    style={{ fontSize: "10px", color: "rgba(240,230,214,0.38)" }}
                  >
                    Stable
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {showNudge && (
          <div className="w-full rounded-2xl border border-[rgba(232,216,199,0.15)] bg-white/5 px-5 py-4 space-y-3">
            <p className="font-body text-sm t-text-secondary leading-relaxed text-center">
              Tu as quelques minutes&nbsp;?
              <br />
              <span className="t-text-ghost text-xs">
                Tu avais pr&eacute;vu un moment ici. L&apos;app est l&agrave; si tu en as envie.
              </span>
            </p>
            <div className="space-y-2">
              <Link
                href="/app/traversee-courte"
                className="w-full block text-center rounded-xl bg-t-beige/10 border border-t-beige/20 py-2.5 font-inter text-sm t-text-secondary hover:bg-t-beige/15 transition-colors"
              >
                Lancer une travers&eacute;e courte
              </Link>
              <button
                type="button"
                onClick={() => setShowNudge(false)}
                className="w-full text-center font-inter text-xs t-text-ghost py-1.5 opacity-60 hover:opacity-100 transition-opacity"
              >
                Pas maintenant
              </button>
            </div>
          </div>
        )}

        {stats.total >= 1 && <InstallPrompt />}
        {stats.total >= 1 && <ReminderPrompt />}

        <div className="pt-0">
          <SafetyResources />
        </div>
        <ReportProblem />

      </div>
    </div>
  );
}
