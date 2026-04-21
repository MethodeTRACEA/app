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
  deleteMemoryData,
  type MemoryProfile,
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
      {/* Identité */}
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

      {/* Ton parcours */}
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
        </div>
      </div>

      {/* Ce qui revient souvent + Ce que tu utilises le plus */}
      <MemoryProfileSection userId={user.id} topEmotions={stats.topEmotions} />

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
// SECTION MÉMOIRE
// ===================================================================

function MemoryProfileSection({
  userId,
  topEmotions,
}: {
  userId: string;
  topEmotions: string[];
}) {
  const [memoryProfile, setMemoryProfile] = useState<MemoryProfile | null>(null);
  const [memoryLoading, setMemoryLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    getMemoryProfileClient(supabase, userId).then((profile) => {
      setMemoryProfile(profile);
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
    setDeleteConfirm(false);
    setDeleteSuccess(true);
    setTimeout(() => setDeleteSuccess(false), 4000);
  }

  if (memoryLoading) return null;

  const hasMemory = memoryProfile && memoryProfile.total_sessions > 0;
  const effectiveActions = (memoryProfile?.effective_actions ?? []).slice(0, 3);

  return (
    <div className="mb-8 space-y-4">
      {/* Ce qui revient souvent */}
      {topEmotions.length > 0 && (
        <div className="card-base p-6">
          <h3 className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4 text-center">
            Ce qui revient souvent
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {topEmotions.map((e, i) => (
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

      {/* Ce que tu utilises le plus */}
      {hasMemory && effectiveActions.length > 0 && (
        <div className="card-base p-6">
          <h3 className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4 text-center">
            Ce que tu utilises le plus
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {effectiveActions.map((action, i) => (
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

      {/* Suppression mémoire RGPD */}
      {hasMemory && (
        <div className="text-center">
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
          ) : (
            <button
              onClick={handleDeleteMemory}
              className="text-xs text-warm-gray/60 hover:text-terra-dark transition-colors underline underline-offset-2"
            >
              Effacer ma mémoire TRACÉA
            </button>
          )}
        </div>
      )}
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
