"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  getProfileDb,
  updateProfileDb,
  getUserStatsDb,
  exportUserData,
  deleteAccount,
} from "@/lib/supabase-store";
import { getConsent } from "@/lib/consent";
import { logConsent } from "@/lib/supabase-store";
import { RevokeConsentButton } from "@/components/ConsentGate";
import {
  getMemoryProfileClient,
  getRecentInnerTruths,
  deleteMemoryData,
  type MemoryProfile,
  type ScoreHistoryEntry,
} from "@/lib/memory";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ProfilPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    avgRecovery: 0,
    topEmotions: [] as string[],
    lastWeekCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([getProfileDb(user.id), getUserStatsDb(user.id)]).then(
      ([profile, s]) => {
        setDisplayName(profile?.display_name ?? "");
        setNameInput(profile?.display_name ?? "");
        setStats(s);
        setLoading(false);
      }
    );
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
        <Link href="/app/connexion" className="btn-primary inline-block">
          Se connecter
        </Link>
      </div>
    );
  }

  async function handleSaveName() {
    if (!user) return;
    await updateProfileDb(user.id, { display_name: nameInput.trim() });
    setDisplayName(nameInput.trim());
    setEditingName(false);
  }

  async function handleExport() {
    if (!user) return;
    const data = await exportUserData(user.id);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tracea-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDeleteAccount() {
    if (!user) return;
    if (
      !confirm(
        "Supprimer définitivement ton compte et toutes tes données ? Cette action est irréversible."
      )
    )
      return;
    if (!confirm("Es-tu vraiment sûr(e) ? Toutes tes sessions seront perdues."))
      return;

    await deleteAccount(user.id);
    await signOut();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-14">
      {/* En-tête chaleureuse */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-terra rounded-full mb-4 shadow-md">
          <span className="font-serif text-3xl text-cream">
            {displayName ? displayName[0].toUpperCase() : "T"}
          </span>
        </div>
        <h1 className="font-serif text-3xl text-espresso mb-1">
          {displayName || "Ton espace"}
        </h1>
        <p className="text-sm text-warm-gray">{user.email}</p>
        {!editingName ? (
          <button
            onClick={() => setEditingName(true)}
            className="text-xs text-terra hover:text-terra-dark transition-colors mt-2 underline underline-offset-2"
          >
            Modifier le prénom
          </button>
        ) : (
          <div className="flex gap-2 justify-center mt-3 max-w-xs mx-auto">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Ton prénom"
              className="flex-1 px-3 py-2 bg-beige rounded-lg text-espresso font-sans text-sm border border-beige-dark focus:border-terra focus:outline-none"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            />
            <button onClick={handleSaveName} className="btn-primary !px-4 !py-2 text-xs">
              OK
            </button>
            <button
              onClick={() => { setEditingName(false); setNameInput(displayName); }}
              className="text-xs text-warm-gray hover:text-espresso px-2"
            >
              Annuler
            </button>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="mb-8">
        <p className="section-label text-center mb-5">Ton parcours</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="card-base text-center py-6">
            <div className="font-serif text-4xl text-terra mb-1">{stats.total}</div>
            <div className="text-xs text-warm-gray tracking-wide uppercase">
              Sessions complétées
            </div>
          </div>
          <div className="card-base text-center py-6">
            <div className="font-serif text-4xl text-sage mb-1">{stats.lastWeekCount}</div>
            <div className="text-xs text-warm-gray tracking-wide uppercase">
              Cette semaine
            </div>
          </div>
          <div className="card-base text-center py-6">
            {stats.total === 0 ? (
              <>
                <div className="font-serif text-3xl text-warm-gray mb-1">...</div>
                <div className="text-xs text-warm-gray">Régulation émotionnelle</div>
              </>
            ) : stats.avgRecovery > 0 ? (
              <>
                <div className="font-serif text-3xl text-sage mb-1">
                  {stats.avgRecovery.toFixed(1)} <span className="text-lg">pts</span>
                </div>
                <div className="text-xs text-sage font-medium">
                  de régulation gagnés
                </div>
              </>
            ) : stats.avgRecovery === 0 ? (
              <>
                <div className="font-serif text-3xl text-warm-gray mb-1">~</div>
                <div className="text-xs text-warm-gray">Stabilité maintenue</div>
              </>
            ) : (
              <>
                <div className="font-serif text-3xl text-terra mb-1">↻</div>
                <div className="text-xs text-terra">Traversée en cours</div>
              </>
            )}
          </div>
          <div className="card-base text-center py-6">
            <div className="font-serif text-2xl text-espresso mb-1">
              {stats.topEmotions[0] || "..."}
            </div>
            <div className="text-xs text-warm-gray tracking-wide uppercase">
              {stats.topEmotions.length > 1 ? "Émotions dominantes" : "Émotion dominante"}
            </div>
          </div>
        </div>
      </div>

      {/* Émotions les plus traversées */}
      {stats.topEmotions.length > 0 && (
        <div className="card-base mb-8 p-6">
          <h3 className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4 text-center">
            Tes émotions récurrentes
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {stats.topEmotions.map((e, i) => (
              <span
                key={e}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  i === 0
                    ? "bg-terra-light text-terra-dark"
                    : "bg-beige text-warm-gray"
                }`}
              >
                {e}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Profil mémoire TRACÉA (Phase 2) */}
      <MemoryProfileSection userId={user.id} />

      {/* Consentement RGPD */}
      <ConsentSection userId={user.id} />

      {/* Droits RGPD */}
      <div className="card-base mb-6 p-6">
        <h3 className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-5 text-center">
          Tes droits RGPD
        </h3>
        <div className="space-y-3">
          <button onClick={handleExport} className="btn-secondary w-full text-center !text-sm">
            Exporter mes données (portabilité)
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full text-center text-sm text-warm-gray hover:text-terra-dark py-2 transition-colors underline underline-offset-2"
          >
            Supprimer mon compte et toutes mes données
          </button>
        </div>
      </div>

      {/* Rappel important */}
      <div className="rounded-[18px] border border-terra/15 bg-terra-light/20 px-6 py-5 mb-8">
        <div className="flex items-start gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-terra flex-shrink-0 mt-1.5" />
          <p className="text-sm text-espresso/80 leading-relaxed font-body">
            TRACÉA est un outil d&apos;exploration émotionnelle structurée. Il ne
            remplace pas un suivi psychologique ou thérapeutique.
          </p>
        </div>
      </div>

      {/* Déconnexion */}
      <button onClick={signOut} className="btn-ghost w-full text-center">
        Se déconnecter
      </button>
    </div>
  );
}

// ===================================================================
// SECTION MÉMOIRE TRACÉA (Phase 2)
// ===================================================================

function MemoryProfileSection({ userId }: { userId: string }) {
  const [memoryProfile, setMemoryProfile] = useState<MemoryProfile | null>(null);
  const [innerTruths, setInnerTruths] = useState<{ inner_truth: string; created_at: string }[]>([]);
  const [memoryLoading, setMemoryLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      getMemoryProfileClient(supabase, userId),
      getRecentInnerTruths(supabase, userId, 5),
    ]).then(([profile, truths]) => {
      setMemoryProfile(profile);
      setInnerTruths(truths);
      setMemoryLoading(false);
    });
  }, [userId]);

  async function handleDeleteMemory() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    await deleteMemoryData(supabase, userId);
    setMemoryProfile(null);
    setInnerTruths([]);
    setDeleteConfirm(false);
    setDeleteSuccess(true);
    setTimeout(() => setDeleteSuccess(false), 4000);
  }

  if (memoryLoading) {
    return (
      <div className="card-base mb-8 p-6 text-center">
        <p className="text-sm text-warm-gray animate-pulse-gentle">Chargement de la mémoire...</p>
      </div>
    );
  }

  const hasMemory = memoryProfile && memoryProfile.total_sessions > 0;

  const trendDisplay: Record<string, { text: string; icon: string; color: string }> = {
    improving: {
      text: "Tes sessions montrent une tendance vers plus de clarté et moins de tension.",
      icon: "↗",
      color: "text-sage",
    },
    stable: {
      text: "Ton niveau de tension et de clarté reste stable.",
      icon: "→",
      color: "text-warm-gray",
    },
    fluctuating: {
      text: "Tes sessions montrent des variations — c'est normal dans un processus d'exploration.",
      icon: "↝",
      color: "text-terra",
    },
  };

  // Couleurs des barres latérales pour les vérités intérieures
  const truthColors = ["#C4704A", "#8A9E7A", "#C4998A", "#9E8E80", "#C4704A"];

  return (
    <div className="mb-8">
      <p className="section-label text-center mb-5">Mon profil TRACÉA</p>

      {/* Bloc 1 — Vue d'ensemble */}
      {hasMemory && (
        <div className="card-base mb-4 p-6 text-center">
          <p className="font-serif text-xl text-espresso mb-1">Ton parcours TRACÉA</p>
          <p className="font-serif text-4xl text-terra mb-1">{memoryProfile.total_sessions}</p>
          <p className="text-xs text-warm-gray tracking-wide uppercase mb-2">
            sessions complétées
          </p>
          {memoryProfile.last_session_date && (
            <p className="text-xs text-warm-gray">
              Dernière session :{" "}
              {new Date(memoryProfile.last_session_date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      )}

      {/* Bloc 2 — Thèmes récurrents */}
      <div className="card-base mb-4 p-6">
        <h3 className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4 text-center">
          Ce que TRACÉA remarque
        </h3>
        {hasMemory && memoryProfile.recurring_patterns.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-center">
            {memoryProfile.recurring_patterns.map((pattern, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full text-sm font-medium bg-sage/15 text-sage-dark border border-sage/20"
              >
                {pattern}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-warm-gray text-center italic">
            Pas encore assez de sessions pour détecter des récurrences. Continue ton parcours.
          </p>
        )}
      </div>

      {/* Bloc 3 — Tendance */}
      {hasMemory && memoryProfile.progress_trend && (
        <div className="card-base mb-4 p-6">
          <h3 className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3 text-center">
            Ta tendance
          </h3>
          <div className="flex items-center justify-center gap-3">
            <span className={`font-serif text-2xl ${trendDisplay[memoryProfile.progress_trend]?.color || "text-warm-gray"}`}>
              {trendDisplay[memoryProfile.progress_trend]?.icon || "→"}
            </span>
            <p className="text-sm text-espresso leading-relaxed">
              {trendDisplay[memoryProfile.progress_trend]?.text || ""}
            </p>
          </div>
        </div>
      )}

      {/* Bloc 4 — Vérités intérieures */}
      {innerTruths.length > 0 && (
        <div className="card-base mb-4 p-6">
          <h3 className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4 text-center">
            Tes vérités intérieures
          </h3>
          <div className="space-y-3">
            {innerTruths.map((t, i) => (
              <div
                key={i}
                className="border-l-[3px] pl-4 py-2"
                style={{ borderLeftColor: truthColors[i % truthColors.length] }}
              >
                <p className="text-xs text-warm-gray mb-1">
                  {new Date(t.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <p className="font-body text-sm text-espresso italic leading-relaxed">
                  &ldquo;{t.inner_truth}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bloc 5 — Actions efficaces */}
      {hasMemory && memoryProfile.effective_actions.length > 0 && (
        <div className="card-base mb-4 p-6">
          <h3 className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4 text-center">
            Ce qui t&apos;a aidé
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {memoryProfile.effective_actions.map((action, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full text-sm font-medium bg-terra-light/30 text-terra-dark"
              >
                {action}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bloc 6 — Score de progression (Phase 3) */}
      <ProgressionScoreSection memoryProfile={memoryProfile} />

      {/* Bouton de suppression RGPD */}
      <div className="text-center mt-4">
        {deleteSuccess ? (
          <p className="text-sm text-sage italic">
            Ta mémoire TRACÉA a été effacée. Tes sessions restent dans ton historique.
          </p>
        ) : deleteConfirm ? (
          <div className="space-y-2">
            <p className="text-sm text-espresso">
              Es-tu sûr(e) ? Cette action supprime tout l&apos;historique de tes patterns.
              Tes sessions restent dans ton historique.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleDeleteMemory}
                className="text-sm text-terra-dark hover:text-terra underline underline-offset-2 transition-colors"
              >
                Confirmer la suppression
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="text-sm text-warm-gray hover:text-espresso transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : hasMemory ? (
          <button
            onClick={handleDeleteMemory}
            className="text-xs text-warm-gray/60 hover:text-terra-dark transition-colors underline underline-offset-2"
          >
            Effacer ma mémoire TRACÉA
          </button>
        ) : null}
      </div>

      {/* Disclaimer mémoire */}
      {hasMemory && (
        <p className="text-[10px] text-warm-gray/50 text-center mt-4 leading-relaxed px-4">
          Ces observations sont générées automatiquement à partir de tes sessions.
          Elles ne constituent ni un diagnostic, ni une évaluation psychologique.
          Tu peux les supprimer à tout moment.
        </p>
      )}
    </div>
  );
}

// ===================================================================
// SECTION SCORE DE PROGRESSION (Phase 3)
// ===================================================================

function ProgressionScoreSection({ memoryProfile }: { memoryProfile: MemoryProfile | null }) {
  if (!memoryProfile || (memoryProfile.total_sessions || 0) < 3) {
    return (
      <div className="card-base mb-4 p-6 text-center">
        <h3 className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">
          Ta progression
        </h3>
        <p className="text-sm text-warm-gray italic">
          Le score de progression apparaîtra après ta 3ᵉ session.
        </p>
      </div>
    );
  }

  const overall = memoryProfile.overall_score || 0;
  const scores = [
    { label: "Conscience émotionnelle", value: memoryProfile.emotional_awareness_score || 0 },
    { label: "Régulation", value: memoryProfile.regulation_score || 0 },
    { label: "Alignement action", value: memoryProfile.action_alignment_score || 0 },
  ];

  function getBarColor(score: number): string {
    if (score <= 30) return "#D4C5B9"; // beige
    if (score <= 60) return "#8A9E7A"; // sage
    return "#C4704A"; // terra
  }

  function getScoreMessage(score: number): string {
    if (score <= 20) return "Tu es au début de ton parcours. Chaque session compte.";
    if (score <= 40) return "Des premiers repères commencent à se dessiner.";
    if (score <= 60) return "Tu développes une vraie capacité d'observation intérieure.";
    if (score <= 80) return "Ta conscience émotionnelle et ta régulation gagnent en finesse.";
    return "Tu as construit une pratique solide de clarification intérieure.";
  }

  const history = (memoryProfile.score_history || []) as ScoreHistoryEntry[];

  return (
    <div className="card-base mb-4 p-6">
      <h3 className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-5 text-center">
        Ta progression
      </h3>

      {/* Score global */}
      <div className="text-center mb-6">
        <div className="inline-flex items-baseline gap-1">
          <span className="font-serif text-5xl text-terra">{overall}</span>
          <span className="font-serif text-xl text-warm-gray">/100</span>
        </div>
        <p className="text-sm text-espresso/70 mt-2 leading-relaxed">
          {getScoreMessage(overall)}
        </p>
      </div>

      {/* Sous-scores avec jauges */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {scores.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-[10px] font-medium tracking-wider uppercase text-warm-gray mb-2 leading-tight">
              {s.label}
            </p>
            <p className="font-serif text-2xl text-espresso mb-2">
              {s.value}<span className="text-xs text-warm-gray">/100</span>
            </p>
            {/* Jauge */}
            <div className="w-full h-2 bg-beige rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${s.value}%`,
                  backgroundColor: getBarColor(s.value),
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Courbe d'évolution (si 3+ entrées) */}
      {history.length >= 3 && <ScoreEvolutionChart history={history} />}

      {/* Disclaimer */}
      <p className="text-[10px] text-warm-gray/50 text-center mt-4 leading-relaxed">
        Ce score reflète l&apos;évolution de ta pratique TRACÉA. Il n&apos;est pas une évaluation
        de ta santé mentale ni un indicateur clinique. Il peut varier naturellement — une baisse
        ne signifie pas un recul.
      </p>
    </div>
  );
}

// ===================================================================
// COURBE D'ÉVOLUTION SVG (Phase 3)
// ===================================================================

function ScoreEvolutionChart({ history }: { history: ScoreHistoryEntry[] }) {
  // Inverser pour avoir chronologique (ancien → récent)
  const data = [...history].reverse();

  const width = 300;
  const height = 120;
  const paddingX = 30;
  const paddingY = 15;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const points = data.map((entry, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartW;
    const y = paddingY + chartH - (entry.overall / 100) * chartH;
    return { x, y, score: entry.overall, date: entry.date };
  });

  // Construire le path
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <div className="mb-4">
      <p className="text-[10px] font-medium tracking-wider uppercase text-warm-gray mb-2 text-center">
        Évolution
      </p>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Lignes de grille horizontales */}
        {[0, 25, 50, 75, 100].map((v) => {
          const y = paddingY + chartH - (v / 100) * chartH;
          return (
            <g key={v}>
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#D4C5B9" strokeWidth="0.5" strokeDasharray="3,3" />
              <text x={paddingX - 5} y={y + 3} textAnchor="end" className="fill-warm-gray" fontSize="7">{v}</text>
            </g>
          );
        })}

        {/* Ligne du score */}
        <path d={pathD} fill="none" stroke="#C4704A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#C4704A" stroke="white" strokeWidth="1.5" />
        ))}

        {/* Dates sur l'axe X (premier et dernier) */}
        <text x={points[0].x} y={height - 2} textAnchor="start" className="fill-warm-gray" fontSize="6.5">
          {new Date(data[0].date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
        </text>
        <text x={points[points.length - 1].x} y={height - 2} textAnchor="end" className="fill-warm-gray" fontSize="6.5">
          {new Date(data[data.length - 1].date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
        </text>
      </svg>
    </div>
  );
}

function ConsentSection({ userId }: { userId: string }) {
  const [consent, setConsent] = useState<ReturnType<typeof getConsent>>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsent(getConsent());
  }, []);

  if (!mounted) return null;

  return (
    <div className="card-base mb-6 p-6">
      <h3 className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4 text-center">
        Consentement RGPD
      </h3>
      {consent ? (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-sage" />
            <span className="text-espresso">Consentement donné</span>
          </div>
          <p className="text-xs text-warm-gray text-center">
            Le{" "}
            {new Date(consent.date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" · "}Version {consent.version}
          </p>
          <div className="text-xs text-warm-gray space-y-1 bg-beige/50 rounded-xl p-4">
            <p>✓ Traitement des données personnelles</p>
            <p>✓ Traitement des données émotionnelles sensibles (art. 9 RGPD)</p>
            <p>✓ Stockage des données</p>
          </div>
          <div className="pt-3 border-t border-beige-dark">
            <RevokeConsentButton />
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-warm-gray" />
            <span className="text-warm-gray">Aucun consentement enregistré</span>
          </div>
          <p className="text-xs text-warm-gray">
            Ton consentement sera demandé lors de ta première session.
          </p>
        </div>
      )}
    </div>
  );
}
