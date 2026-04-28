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
      className="relative min-h-screen pb-32"
      style={{
        background:
          "radial-gradient(ellipse at 50% 100%, rgba(184,99,79,0.13) 0%, rgba(184,99,79,0.05) 34%, transparent 66%), " +
          "radial-gradient(ellipse at 15% 0%, rgba(111,106,100,0.16) 0%, transparent 58%), " +
          "#1A120D",
      }}
    >
      {/* Titre + texte intro */}
      <section className="flex flex-col items-center px-6 text-center gap-6 pt-16">
        <h1
          className="font-body"
          style={{
            fontSize: "clamp(24px, 6vw, 30px)",
            fontWeight: 300,
            lineHeight: 1.5,
            color: "#F0E6D6",
            letterSpacing: "0em",
          }}
        >
          Bienvenue dans TRACEA
        </h1>
        <p
          className="font-sans leading-relaxed"
          style={{
            fontSize: "18px",
            fontWeight: 300,
            color: "rgba(240,230,214,0.76)",
          }}
        >
          Un espace pour revenir &agrave; quelque chose de plus supportable.
        </p>
      </section>

      {/* Boutons — position absolue à 62% de la hauteur écran */}
      <div
        className="absolute left-0 right-0 flex justify-center"
        style={{ top: "62%" }}
      >
        <div className="w-full max-w-sm flex flex-col gap-4 px-6">
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
                "linear-gradient(135deg, #DDB870 0%, #D08870 38%, #C07060 68%, #A5503E 100%)",
              boxShadow:
                "0 0 24px rgba(184,99,79,0.22), 0 8px 32px rgba(184,99,79,0.32), 0 2px 8px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06) inset",
            }}
          >
            Faire une travers&eacute;e
          </Link>
          <Link
            href="/app/urgence"
            className="w-full flex items-center justify-center gap-3"
            style={{
              borderRadius: "999px",
              padding: "17px 26px",
              fontSize: "13.5px",
              fontWeight: 300,
              letterSpacing: "0.01em",
              color: "rgba(240,230,214,0.88)",
              background: "rgba(111,106,100,0.28)",
              border: "1px solid rgba(240,230,214,0.26)",
            }}
          >
            <span style={{ color: "#F6C94A", filter: "drop-shadow(0 0 6px rgba(246,201,74,0.40))" }}>⚡</span>
            <span>Redescendre, maintenant</span>
          </Link>
        </div>
      </div>

      {/* Sections secondaires */}
      <div className="px-6 max-w-md mx-auto w-full flex flex-col gap-6 mt-[75vh]">

        {/* Dernière session (si existe) */}
        {lastSession && lastSession.completed && (
          <section>
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
          </section>
        )}

        {/* Stats compactes (si sessions existantes) */}
        {stats.total > 0 && (
          <section>
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
          </section>
        )}

      </div>
    </div>
  );
}
