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
  const hasActionsData = sessions.filter((s) => s.actionAlignee).length >= 2;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <h1 className="section-title">Quand ça monte</h1>
      <p className="font-body text-sm text-warm-gray">
        Si ça revient maintenant, tu sais déjà où revenir.
      </p>

      {/* ── QUAND ÇA MONTE ── */}
      <div className="card-base p-6">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">
          Ce moment-là
        </p>
        <p className="font-body text-base text-espresso leading-relaxed">
          Quand ça devient trop chargé, tu reviens ici pour ne pas rester seul avec.
        </p>
      </div>

      {/* ── CE QUI AIDE CHEZ TOI ── */}
      <div className="card-base p-6">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">
          Ce qui aide chez toi
        </p>
        <p className="font-body text-base text-espresso leading-relaxed">
          Aller jusqu'au bout de la traversée t'aide à redescendre.
        </p>
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
            Tu t'appuies souvent sur :{" "}
            <span className="italic">« {appuis[0]} »</span>.
          </p>
        ) : (
          <p className="font-body text-base text-espresso leading-relaxed">
            Tu t'appuies souvent sur :{" "}
            <span className="italic">« {appuis[0]} »</span> et{" "}
            <span className="italic">« {appuis[1]} »</span>.
          </p>
        )}
      </div>

      {/* ── À GARDER EN TÊTE ── */}
      <div className="card-base p-6">
        <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">
          À garder en tête
        </p>
        <p className="font-body text-base text-espresso leading-relaxed">
          Revenir au corps t'aide à ne pas réagir trop vite.
        </p>
      </div>

      <p className="font-body text-sm text-warm-gray text-center pb-4">
        C'est suffisant pour maintenant.
      </p>

      <div className="flex flex-col items-center gap-3 pb-6">
        <p className="font-body text-sm text-warm-gray">
          Si ça revient, tu peux revenir ici.
        </p>
        <Link href="/app/traversee-courte" className="btn-secondary !px-8 !py-2.5 !text-sm">
          Revenir maintenant
        </Link>
      </div>
    </div>
  );
}
