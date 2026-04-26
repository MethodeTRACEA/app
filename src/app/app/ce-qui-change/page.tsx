"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getCompletedSessionsDb } from "@/lib/supabase-store";
import type { SessionData } from "@/lib/types";
import Link from "next/link";

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

  const appuis = computeAppuisBlock(sessions);

  const n = sessions.length;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentCount = sessions.filter((s) => new Date(s.date) >= thirtyDaysAgo).length;

  const rythmeText =
    recentCount >= 2 ? "Tu as traversé plusieurs fois ce mois-ci."
    : n === 0 ? "Ta première traversée ouvrira le chemin."
    : n <= 2 ? "Tu commences à laisser une trace."
    : n <= 5 ? "Tu reviens. C'est déjà un mouvement."
    : "Un rythme commence à se dessiner.";

  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const recentActionSessions = sessions
    .filter((s) => s.actionAlignee?.trim())
    .filter((s) => new Date(s.date) >= sixtyDaysAgo)
    .slice(0, 3);
  const recentActionCounts: Record<string, number> = {};
  for (const s of recentActionSessions) {
    const key = s.actionAlignee!.trim().toLowerCase();
    recentActionCounts[key] = (recentActionCounts[key] ?? 0) + 1;
  }
  const recentRepeatedAction =
    Object.entries(recentActionCounts).find(([, count]) => count >= 2)?.[0] ?? null;

  let transformationLines: string[] = [];
  if (n === 1) {
    transformationLines = ["Tu as commencé à t'arrêter."];
  } else if (n >= 2 && recentCount === 0) {
    transformationLines = ["Tu es déjà revenu(e) plusieurs fois."];
  } else if (n >= 2 && recentCount >= 1 && recentCount < 2) {
    transformationLines = ["Tu reviens quand ça s'active."];
  } else if (n >= 3 && recentCount >= 2) {
    transformationLines = [
      "Tu ne laisses plus tout passer.",
      "Tu reviens, même quand ça s'active.",
    ];
  }

  let evolutionText: string | null = null;
  if (n >= 3 && recentCount >= 2 && (n - recentCount) >= 1) {
    evolutionText = "Tu t'arrêtes plus souvent qu'avant.";
  } else if (n >= 3 && recentCount >= 2) {
    evolutionText = "Tu reviens régulièrement.";
  } else if (n >= 2 && recentCount >= 1) {
    evolutionText = "Tu reviens quand ça s'active.";
  } else if (n === 1) {
    evolutionText = "Tu as commencé à t'arrêter.";
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <h1 className="section-title">Ce qui change</h1>
      <p className="font-body text-sm text-warm-gray">
        Un regard simple sur ce qui se stabilise dans ta manière de traverser.
      </p>

      {/* ── TON RYTHME ── */}
      <div className="card-base p-6">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">
          Ton rythme
        </p>
        <p className="font-body text-base text-espresso leading-relaxed">
          {rythmeText}
        </p>
      </div>

      {/* ── CE QUI BOUGE EN TOI ── */}
      {transformationLines.length > 0 && (
        <div className="card-base p-6">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">
            Ce qui bouge en toi
          </p>
          <div className="font-body text-base text-espresso leading-loose space-y-3">
            {transformationLines.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* ── CE QUE ÇA CHANGE CONCRÈTEMENT ── */}
      {evolutionText && (
        <div className="card-base p-6">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">
            Ce que ça change concrètement
          </p>
          <p className="font-body text-base text-espresso leading-relaxed">
            {evolutionText}
          </p>
        </div>
      )}

      {/* ── TES APPUIS ── */}
      <div className="card-base p-6">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">
          Tes appuis
        </p>
        {recentRepeatedAction ? (
          <p className="font-body text-base text-espresso leading-relaxed">
            Ces derniers temps, tu reviens souvent à :{" "}
            <span className="italic">« {recentRepeatedAction} »</span>.
          </p>
        ) : appuis.length === 0 ? (
          <p className="font-body text-base text-espresso leading-relaxed">
            Tes appuis se dessinent traversée après traversée.
          </p>
        ) : appuis.length === 1 ? (
          <p className="font-body text-base text-espresso leading-relaxed">
            Certains appuis reviennent dans tes traversées :{" "}
            <span className="italic">« {appuis[0]} »</span>.
          </p>
        ) : (
          <p className="font-body text-base text-espresso leading-relaxed">
            Certains appuis reviennent dans tes traversées :{" "}
            <span className="italic">« {appuis[0]} »</span> et{" "}
            <span className="italic">« {appuis[1]} »</span>.
          </p>
        )}
      </div>

      {/* ── CE QUI SE STABILISE ── */}
      {sessions.length >= 2 && (
        <div className="card-base p-6">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">
            Ce qui se stabilise
          </p>
          <p className="font-body text-base text-espresso leading-relaxed">
            Tu reviens.
          </p>
          <p className="font-body text-base text-espresso leading-relaxed mt-2">
            Tu traverses.
          </p>
          <p className="font-body text-base text-espresso leading-relaxed mt-2">
            Tu fais un pas.
          </p>
        </div>
      )}
    </div>
  );
}
