"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getCompletedSessionsDb } from "@/lib/supabase-store";
import type { SessionData } from "@/lib/types";
import Link from "next/link";

// ── CE QUI BOUGE ─────────────────────────────────────────────────

function bougePhraseFor(avgDelta: number): string {
  if (avgDelta >= 3)
    return "La traversée t'aide à redescendre. C'est souvent comme ça que ça se passe pour toi.";
  if (avgDelta >= 1.5)
    return "Ton intensité baisse souvent entre le début et la fin.";
  return "Tu traverses, et quelque chose se repose — même légèrement.";
}

function computeBougeBlock(sessions: SessionData[]): {
  main: string | null;
  secondary: string | null;
} {
  const withBoth = sessions.filter(
    (s) => s.intensiteBefore != null && s.intensiteAfter != null
  );

  let main: string | null = null;
  if (withBoth.length >= 3) {
    const avgDelta =
      withBoth.reduce(
        (sum, s) => sum + (s.intensiteBefore - (s.intensiteAfter as number)),
        0
      ) / withBoth.length;
    if (avgDelta >= 0) {
      main = bougePhraseFor(avgDelta);
    }
  }

  // Comparer intensiteBefore des 3 premières (oldest) vs 3 dernières (recent)
  // sessions est trié desc (plus récent en premier)
  let secondary: string | null = null;
  if (sessions.length >= 6) {
    const recent3 = sessions.slice(0, 3).map((s) => s.intensiteBefore);
    const early3 = sessions.slice(-3).map((s) => s.intensiteBefore);
    const avgRecent = recent3.reduce((a, b) => a + b, 0) / 3;
    const avgEarly = early3.reduce((a, b) => a + b, 0) / 3;
    if (avgEarly - avgRecent >= 1.5) {
      secondary = "Les dernières traversées montrent une intensité d'entrée plus basse qu'avant.";
    }
  }

  return { main, secondary };
}

// ── TON RYTHME ───────────────────────────────────────────────────

function computeRythmeBlock(sessions: SessionData[]): {
  main: string;
  span: string | null;
  active: string | null;
} {
  const n = sessions.length;

  let main: string;
  if (n === 0) main = "Rien encore. Ta première traversée sera le début.";
  else if (n <= 2) main = "Tu commences. Quelque chose t'a amené ici.";
  else if (n <= 5) main = "Tu reviens. C'est déjà quelque chose.";
  else if (n <= 9) main = "Tu as trouvé un rythme — même irrégulier, tu continues.";
  else if (n <= 19) main = "Tu reviens depuis un moment. Ce chemin t'appartient.";
  else main = "Tu reviens à TRACÉA depuis plusieurs traversées.";

  let span: string | null = null;
  if (sessions.length >= 2) {
    const latest = new Date(sessions[0].date);
    const earliest = new Date(sessions[sessions.length - 1].date);
    const days =
      (latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24);
    if (days >= 60) {
      const months = Math.round(days / 30);
      span = `Depuis ${months} mois.`;
    }
  }

  let active: string | null = null;
  const cutoff14 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const recentCount = sessions.filter(
    (s) => new Date(s.date) >= cutoff14
  ).length;
  if (recentCount >= 3) {
    active = "Tu as utilisé TRACÉA plusieurs fois récemment.";
  }

  return { main, span, active };
}

// ── TES APPUIS ───────────────────────────────────────────────────

function computeAppuisBlock(sessions: SessionData[]): string[] {
  const counts: Record<string, number> = {};
  for (const s of sessions) {
    if (!s.actionAlignee) continue;
    const key = s.actionAlignee.toLowerCase().trim();
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.entries(counts)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([action]) => action);
}

// ── Page ─────────────────────────────────────────────────────────

export default function CeQuiChangePage() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
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
          Connecte-toi pour voir ce qui change.
        </p>
        <Link href="/app/connexion" className="btn-primary inline-block">
          Se connecter
        </Link>
      </div>
    );
  }

  const bouge = computeBougeBlock(sessions);
  const rythme = computeRythmeBlock(sessions);
  const appuis = computeAppuisBlock(sessions);
  const hasActionsData = sessions.filter((s) => s.actionAlignee).length >= 2;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <h1 className="section-title">Ce qui change</h1>

      {/* ── CE QUI BOUGE ── */}
      <div className="card-base p-6">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">
          Ce qui bouge
        </p>
        {bouge.main || bouge.secondary ? (
          <>
            {bouge.main && (
              <p className="font-body text-base text-espresso leading-relaxed">
                {bouge.main}
              </p>
            )}
            {bouge.secondary && (
              <p
                className={`font-body text-base text-espresso leading-relaxed${
                  bouge.main ? " mt-3" : ""
                }`}
              >
                {bouge.secondary}
              </p>
            )}
          </>
        ) : (
          <p className="font-body text-sm text-warm-gray italic">
            Pas encore assez de traversées pour voir ce qui bouge.
          </p>
        )}
      </div>

      {/* ── TON RYTHME ── */}
      <div className="card-base p-6">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">
          Ton rythme
        </p>
        <p className="font-body text-base text-espresso leading-relaxed">
          {rythme.main}
        </p>
        {(rythme.span || rythme.active) && (
          <p className="font-body text-sm text-warm-gray mt-3">
            {[rythme.span, rythme.active].filter(Boolean).join(" ")}
          </p>
        )}
      </div>

      {/* ── TES APPUIS ── */}
      <div className="card-base p-6">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">
          Tes appuis
        </p>
        {appuis.length === 0 ? (
          <p className="font-body text-base text-espresso leading-relaxed">
            {hasActionsData
              ? "Tu explores différentes façons d'avancer. Rien de fixé encore — c'est déjà quelque chose."
              : "Les appuis se dessinent traversée après traversée."}
          </p>
        ) : appuis.length === 1 ? (
          <p className="font-body text-base text-espresso leading-relaxed">
            Tu reviens souvent à :{" "}
            <span className="italic">« {appuis[0]} »</span>.
          </p>
        ) : (
          <p className="font-body text-base text-espresso leading-relaxed">
            Dans tes dernières traversées, tu as choisi :{" "}
            <span className="italic">« {appuis[0]} »</span> et{" "}
            <span className="italic">« {appuis[1]} »</span>.
          </p>
        )}
      </div>
    </div>
  );
}
