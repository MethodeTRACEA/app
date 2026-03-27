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
        <Link href="/connexion" className="btn-primary inline-block">
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
        "Supprimer définitivement votre compte et toutes vos données ? Cette action est irréversible."
      )
    )
      return;
    if (!confirm("Êtes-vous vraiment sûr(e) ? Toutes vos sessions seront perdues."))
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
          {displayName || "Votre espace"}
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
              placeholder="Votre prénom"
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
        <p className="section-label text-center mb-5">Votre parcours</p>
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
              Émotion principale
            </div>
          </div>
        </div>
      </div>

      {/* Émotions les plus traversées */}
      {stats.topEmotions.length > 0 && (
        <div className="card-base mb-8 p-6">
          <h3 className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-4 text-center">
            Émotions les plus traversées
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

      {/* Consentement RGPD */}
      <ConsentSection userId={user.id} />

      {/* Droits RGPD */}
      <div className="card-base mb-6 p-6">
        <h3 className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-5 text-center">
          Vos droits RGPD
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
            Votre consentement sera demandé lors de votre première session.
          </p>
        </div>
      )}
    </div>
  );
}
