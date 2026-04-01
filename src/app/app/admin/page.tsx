"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getAdminStats, getAdminWeeklyStats } from "@/lib/supabase-store";
import { useRouter } from "next/navigation";

interface AdminStatsData {
  total_users: number;
  total_sessions: number;
  completed_sessions: number;
  avg_intensity_before: number;
  avg_intensity_after: number;
  avg_recovery: number;
  ctx_relationnel: number;
  ctx_professionnel: number;
  ctx_existentiel: number;
  ctx_autre: number;
  sessions_last_7d: number;
  sessions_last_30d: number;
  active_users_7d: number;
}

interface WeeklyStats {
  week: string;
  sessions_count: number;
  unique_users: number;
  avg_recovery: number;
  completed: number;
}

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [weekly, setWeekly] = useState<WeeklyStats[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) {
      router.push("/app");
      return;
    }
    Promise.all([getAdminStats(), getAdminWeeklyStats()]).then(
      ([s, w]) => {
        setStats(s as AdminStatsData);
        setWeekly(w as WeeklyStats[]);
        setLoadingData(false);
      }
    );
  }, [user, isAdmin, loading, router]);

  if (loading || loadingData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="font-serif text-2xl text-terra animate-pulse-gentle">
          Chargement...
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const completionRate =
    stats && stats.total_sessions > 0
      ? ((stats.completed_sessions / stats.total_sessions) * 100).toFixed(0)
      : "0";

  const totalCtx =
    (stats?.ctx_relationnel ?? 0) +
    (stats?.ctx_professionnel ?? 0) +
    (stats?.ctx_existentiel ?? 0) +
    (stats?.ctx_autre ?? 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="section-label">Administration</p>
          <h1 className="section-title">Dashboard TRACEA</h1>
        </div>
        <div className="card-sage !py-2 !px-4 text-xs font-medium text-[#4A6B3A]">
          Données anonymisées
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card-base text-center">
          <div className="font-serif text-3xl text-terra">
            {stats?.total_users ?? 0}
          </div>
          <div className="text-xs text-warm-gray mt-1 tracking-wide uppercase">
            Utilisateurs
          </div>
        </div>
        <div className="card-base text-center">
          <div className="font-serif text-3xl text-espresso">
            {stats?.total_sessions ?? 0}
          </div>
          <div className="text-xs text-warm-gray mt-1 tracking-wide uppercase">
            Sessions totales
          </div>
        </div>
        <div className="card-base text-center">
          <div className="font-serif text-3xl text-sage">
            {completionRate}%
          </div>
          <div className="text-xs text-warm-gray mt-1 tracking-wide uppercase">
            Taux complétion
          </div>
        </div>
        <div className="card-base text-center">
          <div className="font-serif text-3xl text-terra">
            {stats?.avg_recovery ?? 0}
          </div>
          <div className="text-xs text-warm-gray mt-1 tracking-wide uppercase">
            Récupération moy.
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card-base">
          <h3 className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">
            Activité récente
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-beige">
              <span className="text-sm text-espresso">Sessions (7 jours)</span>
              <span className="font-serif text-xl text-terra">
                {stats?.sessions_last_7d ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-beige">
              <span className="text-sm text-espresso">Sessions (30 jours)</span>
              <span className="font-serif text-xl text-espresso">
                {stats?.sessions_last_30d ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-espresso">
                Utilisateurs actifs (7j)
              </span>
              <span className="font-serif text-xl text-sage">
                {stats?.active_users_7d ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="card-base">
          <h3 className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">
            Répartition des contextes
          </h3>
          <div className="space-y-3">
            {[
              { label: "Relationnel", count: stats?.ctx_relationnel ?? 0, color: "bg-terra" },
              { label: "Professionnel", count: stats?.ctx_professionnel ?? 0, color: "bg-dusty" },
              { label: "Existentiel", count: stats?.ctx_existentiel ?? 0, color: "bg-sage" },
              { label: "Autre", count: stats?.ctx_autre ?? 0, color: "bg-warm-gray" },
            ].map((ctx) => {
              const pct = totalCtx > 0 ? (ctx.count / totalCtx) * 100 : 0;
              return (
                <div key={ctx.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-espresso">{ctx.label}</span>
                    <span className="text-warm-gray">
                      {ctx.count} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-beige-dark rounded-full overflow-hidden">
                    <div
                      className={`h-full ${ctx.color} rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Intensity metrics */}
      <div className="card-base mb-8">
        <h3 className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">
          Indicateurs d&apos;intensité (moyennes anonymisées)
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xs text-warm-gray tracking-widest uppercase mb-2">
              Avant
            </div>
            <div className="font-serif text-2xl text-espresso">
              {stats?.avg_intensity_before ?? "—"}/10
            </div>
            <div className="ira-bar mt-2">
              <div
                className="ira-fill"
                style={{
                  width: `${((stats?.avg_intensity_before ?? 0) / 10) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-warm-gray tracking-widest uppercase mb-2">
              Après
            </div>
            <div className="font-serif text-2xl text-sage">
              {stats?.avg_intensity_after ?? "—"}/10
            </div>
            <div className="ira-bar mt-2">
              <div
                className="ira-fill"
                style={{
                  width: `${((stats?.avg_intensity_after ?? 0) / 10) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-warm-gray tracking-widest uppercase mb-2">
              Récupération
            </div>
            <div className="font-serif text-2xl text-terra">
              -{stats?.avg_recovery ?? 0}
            </div>
            <p className="text-xs text-warm-gray mt-1">points en moyenne</p>
          </div>
        </div>
      </div>

      {/* Weekly trends */}
      {weekly.length > 0 && (
        <div className="card-base">
          <h3 className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4">
            Évolution hebdomadaire (12 dernières semaines)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-beige-dark">
                  <th className="text-left py-2 font-sans font-medium text-warm-gray text-xs tracking-wider uppercase">
                    Semaine
                  </th>
                  <th className="text-right py-2 font-sans font-medium text-warm-gray text-xs tracking-wider uppercase">
                    Sessions
                  </th>
                  <th className="text-right py-2 font-sans font-medium text-warm-gray text-xs tracking-wider uppercase">
                    Utilisateurs
                  </th>
                  <th className="text-right py-2 font-sans font-medium text-warm-gray text-xs tracking-wider uppercase">
                    Complétées
                  </th>
                  <th className="text-right py-2 font-sans font-medium text-warm-gray text-xs tracking-wider uppercase">
                    Récup. moy.
                  </th>
                </tr>
              </thead>
              <tbody>
                {weekly.map((w) => (
                  <tr key={w.week} className="border-b border-beige">
                    <td className="py-2 text-espresso">
                      {new Date(w.week).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="py-2 text-right font-medium text-espresso">
                      {w.sessions_count}
                    </td>
                    <td className="py-2 text-right text-warm-gray">
                      {w.unique_users}
                    </td>
                    <td className="py-2 text-right text-sage">{w.completed}</td>
                    <td className="py-2 text-right text-terra">
                      {w.avg_recovery !== null ? `-${w.avg_recovery}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Privacy notice */}
      <div className="mt-8 text-center">
        <p className="text-xs text-warm-gray">
          Ce dashboard affiche exclusivement des statistiques anonymisées et
          agrégées. Aucun contenu de session, aucune émotion, aucune donnée
          personnelle identifiable n&apos;est accessible ici. Conformité RGPD
          art. 5 (minimisation des données).
        </p>
      </div>
    </div>
  );
}
