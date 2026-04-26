"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getCompletedSessionsDb } from "@/lib/supabase-store";
import type { SessionData } from "@/lib/types";
import Link from "next/link";

// ── NORMALISATION AFFICHAGE — je → tu ────────────────────────────

function normalizeActionDisplay(action: string): string {
  return action
    .replace(/\bje\b/gi, "tu")
    .replace(/\bj['']/gi, "tu ")
    .replace(/\bme\b/gi, "te")
    .replace(/\bmon\b/gi, "ton")
    .replace(/\bma\b/gi, "ta")
    .replace(/\bmes\b/gi, "tes")
    .trim();
}

// ── APPUIS GLOBAUX ────────────────────────────────────────────────

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

  const recentRepeatedActionDisplay = recentRepeatedAction
    ? normalizeActionDisplay(recentRepeatedAction)
    : null;
  const appuisDisplay = appuis.map(normalizeActionDisplay);

  let transformationLines: string[] = [];
  if (n === 1) {
    transformationLines = ["Tu as commencé à t'arrêter."];
  } else if (n >= 2 && recentCount === 0) {
    transformationLines = ["Tu es déjà revenu(e) plusieurs fois."];
  } else if (n >= 2 && recentCount >= 1 && recentCount < 2) {
    transformationLines = ["Tu reviens quand ça s'active."];
  } else if (n >= 3 && recentCount >= 2) {
    transformationLines = [
      "Tu ne laisses plus tout passer comme avant.",
      "Tu ne fais plus comme avant.",
    ];
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <h1 className="section-title">Ce qui change</h1>
      <p className="font-body text-sm text-warm-gray">
        Ce qui se construit en toi, traversée après traversée.
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

      {/* ── TON CHEMIN DE RETOUR ── */}
      <div className="card-base p-6 space-y-4">
        <p className="text-xs uppercase tracking-wider opacity-60">
          Ton chemin de retour
        </p>

        {recentRepeatedActionDisplay ? (
          <p className="font-body text-base text-espresso leading-relaxed">
            Quand ça s'active,{" "}
            <br />
            tu reviens à :
            <br />
            <br />
            <em>« {recentRepeatedActionDisplay} »</em>.
          </p>
        ) : recentActionSessions.length >= 2 ? (
          <>
            <p className="font-body text-base text-espresso leading-relaxed">Tu explores encore plusieurs façons de revenir.</p>
            <p className="font-body text-base text-espresso leading-relaxed">Rien n'est figé, mais tu reviens.</p>
          </>
        ) : appuisDisplay.length === 0 ? (
          <p className="font-body text-base text-espresso leading-relaxed">
            Ton chemin de retour se dessine traversée après traversée.
          </p>
        ) : appuisDisplay.length === 1 ? (
          <p className="font-body text-base text-espresso leading-relaxed">
            Tu reviens souvent à :{" "}
            <em>« {appuisDisplay[0]} »</em>.
          </p>
        ) : (
          <p className="font-body text-base text-espresso leading-relaxed">
            Tu reviens souvent à :{" "}
            <em>« {appuisDisplay[0]} »</em> et{" "}
            <em>« {appuisDisplay[1]} »</em>.
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
