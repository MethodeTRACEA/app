"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { hasValidConsent, saveConsent, revokeConsent, hasAnonConsent, saveAnonConsent } from "@/lib/consent";
import { useAuth } from "@/lib/auth-context";
import { SafetyResources } from "@/components/SafetyResources";
import {
  getCurrentRgpdWordings,
  RGPD_WORDING_CURRENT_VERSION,
} from "@/lib/legal/rgpd-wordings";

interface ConsentGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  // Option C — parcours anonyme : variante allégée (1 case, traitement
  // éphémère art. 9, sans stockage). Le gate connecté reste inchangé.
  isAnonymous?: boolean;
}

export function ConsentGate({ children, fallback, isAnonymous }: ConsentGateProps) {
  const [consented, setConsented] = useState<boolean | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    // Anonyme (Option C) : gate sur le marqueur dédié, jamais de DB.
    if (isAnonymous) {
      setConsented(hasAnonConsent());
      return;
    }

    // 1. Lecture instantanée du cache localStorage
    const cachedValid = hasValidConsent();
    if (cachedValid) {
      setConsented(true);
      // Healing en arrière-plan (silencieux) si on a un token
      if (session?.access_token) void syncFromDb(session.access_token);
      return;
    }
    // 2. Pas de cache valide → consulter la DB si connectée
    if (!session?.access_token) {
      setConsented(false);
      return;
    }
    fetch("/api/consent", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.hasValidConsent === true) {
          // Cache local pour les prochains renders
          saveConsent({
            dataProcessing: true,
            sensitiveData: true,
            localStorageUsage: true,
            date: data.acceptedAt ?? new Date().toISOString(),
            version: data.version ?? RGPD_WORDING_CURRENT_VERSION,
          });
          setConsented(true);
        } else {
          setConsented(false);
        }
      })
      .catch(() => setConsented(false));
  }, [session?.access_token, isAnonymous]);

  if (consented === null) return null; // Loading
  if (consented) return <>{children}</>;

  // Anonyme : formulaire allégé (1 case, éphémère, sans stockage).
  if (isAnonymous) {
    return <AnonConsentForm onConsent={() => setConsented(true)} />;
  }

  if (fallback) return <>{fallback}</>;

  return (
    <ConsentForm
      accessToken={session?.access_token ?? null}
      onConsent={() => setConsented(true)}
    />
  );
}

async function syncFromDb(token: string) {
  try {
    const r = await fetch("/api/consent", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await r.json();
    if (d?.hasValidConsent === true) {
      saveConsent({
        dataProcessing: true,
        sensitiveData: true,
        localStorageUsage: true,
        date: d.acceptedAt ?? new Date().toISOString(),
        version: d.version ?? RGPD_WORDING_CURRENT_VERSION,
      });
    }
    // Si DB dit "non" alors que cache dit "oui" → on ne touche pas
    // au cache (les utilisatrices pré-existantes en localStorage v"1.0"
    // ne sont pas perturbées — décision "version héritée" chantier 33).
  } catch {
    // silencieux : le cache reste valable
  }
}

// ── Formulaire de consentement ANONYME (Option C) ──────────────────
// 1 seule case : traitement éphémère des données sensibles (art. 9) pour
// générer le reflet, SANS stockage. Mémorisé en localStorage uniquement.
function AnonConsentForm({ onConsent }: { onConsent: () => void }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  function handleSubmit() {
    if (!checked) return;
    saveAnonConsent({
      sensitiveEphemeral: true,
      date: new Date().toISOString(),
      version: RGPD_WORDING_CURRENT_VERSION,
    });
    onConsent();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <p className="section-label">Consentement</p>
      <h1 className="section-title">Avant de commencer</h1>
      <p className="text-warm-gray mb-6 leading-relaxed">
        Pour te proposer une traversée, TRACÉA a besoin de traiter ce que tu
        écris (tes émotions, tes ressentis). Ce sont des données sensibles,
        alors on te demande ton accord.
      </p>

      <div className="safety-card mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-terra flex-shrink-0" />
          <span className="font-medium text-sm text-terra-dark font-sans">
            Sans compte, rien n&apos;est conservé
          </span>
        </div>
        <p className="font-body text-sm text-espresso leading-relaxed">
          Ce que tu écris sert seulement à te proposer ton reflet, le temps de
          ta traversée, puis n&apos;est pas enregistré. Si tu veux garder tes
          traversées, tu pourras créer un compte à la fin.
        </p>
      </div>

      <div className="card-base mb-6">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-beige-dark text-terra focus:ring-terra accent-terra"
          />
          <span className="text-sm text-espresso">
            J&apos;accepte que mes données émotionnelles soient traitées
            uniquement pour générer mon reflet, le temps de ma traversée, sans
            être conservées.
          </span>
        </label>
      </div>

      <div className="card-base mb-6">
        <p className="text-xs text-warm-gray leading-relaxed">
          Pour plus d&apos;informations :{" "}
          <Link
            href="/politique-confidentialite"
            className="text-terra hover:text-terra-dark underline"
          >
            Politique de confidentialité
          </Link>{" "}
          ·{" "}
          <Link
            href="/conditions-utilisation"
            className="text-terra hover:text-terra-dark underline"
          >
            CGU
          </Link>
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!checked}
        className="btn-primary w-full text-center disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Commencer ma traversée
      </button>

      <button
        onClick={() => router.push("/app")}
        className="w-full text-center mt-4 text-sm text-warm-gray hover:text-terra-dark transition-colors"
      >
        Revenir à l&apos;accueil
      </button>

      <div className="mt-8">
        <SafetyResources />
      </div>
    </div>
  );
}

function ConsentForm({
  accessToken,
  onConsent,
}: {
  accessToken: string | null;
  onConsent: () => void;
}) {
  // Wordings versionnés — affichage branché sur la constante
  // (anti-drift entre l'écran et le snapshot DB). Les descriptions
  // restent dans des <p> distincts pour conserver le formatage.
  // Si une future version ajoutait du HTML (<strong>, liens…), il
  // FAUDRA garder le JSX et synchroniser manuellement le texte de
  // la constante (commentaire du chantier 33).
  const { wordings } = getCurrentRgpdWordings();

  const [dataProcessing, setDataProcessing] = useState(false);
  const [sensitiveData, setSensitiveData] = useState(false);
  const [localStorageUsage, setLocalStorageUsage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const allChecked = dataProcessing && sensitiveData && localStorageUsage;

  async function handleSubmit() {
    if (!allChecked || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    const now = new Date().toISOString();

    // 1. Si connectée, persister en DB d'abord. Si échec → on
    //    bloque (la preuve DB est désormais la source de vérité).
    if (accessToken) {
      try {
        const res = await fetch("/api/consent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            wordingVersion: RGPD_WORDING_CURRENT_VERSION,
          }),
        });
        if (!res.ok) {
          setSubmitError("Erreur lors de l'enregistrement. Réessaie.");
          setSubmitting(false);
          return;
        }
      } catch {
        setSubmitError("Erreur réseau. Vérifie ta connexion.");
        setSubmitting(false);
        return;
      }
    }

    // 2. Cache localStorage (pour les renders suivants et le profil)
    saveConsent({
      dataProcessing,
      sensitiveData,
      localStorageUsage,
      date: now,
      version: RGPD_WORDING_CURRENT_VERSION,
    });
    onConsent();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <p className="section-label">Consentement requis</p>
      <h1 className="section-title">
        Avant de commencer ta première session
      </h1>
      <p className="text-warm-gray mb-6 leading-relaxed">
        TRACÉA traite des données personnelles et émotionnelles sensibles. Avant
        d&apos;utiliser le protocole, nous avons besoin de ton consentement
        explicite, conformément à l&apos;article 9 du RGPD.
      </p>

      <div className="safety-card mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-terra flex-shrink-0" />
          <span className="font-medium text-sm text-terra-dark font-sans">
            Pourquoi ce consentement ?
          </span>
        </div>
        <p className="font-body text-sm text-espresso leading-relaxed">
          Lors d&apos;une session TRACÉA, tu seras invité(e) à décrire tes
          émotions, identifier des ressentis corporels et formuler des prises de
          conscience. Ces informations constituent des{" "}
          <strong>données relatives à ta santé psychologique</strong> au sens
          du RGPD. Elles méritent une protection particulière et un consentement
          éclairé de ta part.
        </p>
      </div>

      <div className="card-base mb-6 space-y-4">
        <h3 className="font-sans text-xs font-medium tracking-widest uppercase text-warm-gray">
          Ton consentement
        </h3>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={dataProcessing}
            onChange={(e) => setDataProcessing(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-beige-dark text-terra focus:ring-terra accent-terra"
          />
          <div>
            <span className="text-sm text-espresso font-medium">
              {wordings.data_processing.label}
            </span>
            <p className="text-xs text-warm-gray mt-0.5">
              {wordings.data_processing.description}
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={sensitiveData}
            onChange={(e) => setSensitiveData(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-beige-dark text-terra focus:ring-terra accent-terra"
          />
          <div>
            <span className="text-sm text-espresso font-medium">
              {wordings.sensitive_data.label}
            </span>
            <p className="text-xs text-warm-gray mt-0.5">
              {wordings.sensitive_data.description}
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={localStorageUsage}
            onChange={(e) => setLocalStorageUsage(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-beige-dark text-terra focus:ring-terra accent-terra"
          />
          <div>
            <span className="text-sm text-espresso font-medium">
              {wordings.local_storage_usage.label}
            </span>
            <p className="text-xs text-warm-gray mt-0.5">
              {wordings.local_storage_usage.description}
            </p>
          </div>
        </label>
      </div>

      <div className="card-base mb-6">
        <p className="text-xs text-warm-gray leading-relaxed">
          En cochant ces cases, tu donnes ton consentement libre, spécifique,
          éclairé et univoque au traitement de tes données. Tu peux retirer
          ce consentement à tout moment depuis la page{" "}
          <Link href="/app/profil" className="text-terra hover:text-terra-dark underline">
            Profil
          </Link>
          . Le retrait du consentement n&apos;affecte pas la licéité du
          traitement effectué avant ce retrait.
        </p>
        <p className="text-xs text-warm-gray leading-relaxed mt-2">
          Pour plus d&apos;informations :{" "}
          <Link
            href="/politique-confidentialite"
            className="text-terra hover:text-terra-dark underline"
          >
            Politique de confidentialité
          </Link>{" "}
          ·{" "}
          <Link
            href="/conditions-utilisation"
            className="text-terra hover:text-terra-dark underline"
          >
            CGU
          </Link>
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!allChecked || submitting}
        className="btn-primary w-full text-center disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Je donne mon consentement et j&apos;accepte les CGU
      </button>

      {submitError && (
        <p className="text-xs text-center mt-2" style={{ color: "#B8634F" }}>
          {submitError}
        </p>
      )}

      <p className="text-xs text-warm-gray text-center mt-4">
        Tu dois cocher les trois cases pour continuer.
      </p>
    </div>
  );
}

export function RevokeConsentButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const { session } = useAuth();

  async function handleRevoke() {
    if (revoking) return;
    setRevoking(true);
    setRevokeError(null);

    // 1. Si connectée : suppression complète côté serveur via
    //    /api/account/delete. Les preuves de consentement
    //    (consent_logs + withdrawal_consents) SURVIVENT à cette
    //    suppression (chantier 34, art. 17.3 RGPD).
    //    Garde Stripe : si abonnement actif → 409 → message + stop,
    //    on ne touche pas au local pour ne rien désynchroniser.
    if (session?.access_token) {
      try {
        const res = await fetch("/api/account/delete", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) {
          let body: { code?: string } | null = null;
          try {
            body = await res.json();
          } catch {
            // pas de JSON parseable → message générique
          }
          if (res.status === 409 && body?.code === "active_subscription") {
            setRevokeError(
              "Un abonnement est encore actif sur ton compte. Tu peux le résilier depuis ton profil, puis revenir ici."
            );
          } else {
            setRevokeError("Erreur lors de la suppression. Réessaie.");
          }
          setRevoking(false);
          return;
        }
      } catch {
        setRevokeError("Erreur réseau. Vérifie ta connexion.");
        setRevoking(false);
        return;
      }
    }

    // 2. Clear local (cache + données client). La session Supabase
    //    devient invalide après /api/account/delete, mais on nettoie
    //    explicitement les clés localStorage qui pourraient subsister.
    revokeConsent();
    localStorage.removeItem("tracea_sessions");
    localStorage.removeItem("tracea_profile");
    localStorage.removeItem("tracea_cookie_consent");
    localStorage.removeItem("tracea_anonymous_id");
    window.location.href = "/";
  }

  return (
    <div>
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="text-sm text-warm-gray hover:text-terra-dark transition-colors underline"
        >
          Retirer mon consentement et supprimer mes données
        </button>
      ) : (
        <div className="safety-card mt-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-terra flex-shrink-0" />
            <span className="font-medium text-sm text-terra-dark font-sans">
              Es-tu sûr(e) ?
            </span>
          </div>
          <p className="font-body text-sm text-espresso leading-relaxed mb-4">
            Cette action supprimera définitivement toutes tes sessions et
            ton profil. Cette action est irréversible.
          </p>
          <p className="font-body text-sm text-espresso leading-relaxed mb-4">
            Après suppression, TRACÉA conserve uniquement, pour ses
            obligations légales, la preuve de ton consentement et tes
            données de facturation.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleRevoke}
              disabled={revoking}
              className="btn-primary !bg-terra-dark !text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmer la suppression
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={revoking}
              className="btn-ghost !text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
          </div>
          {revokeError && (
            <p className="text-xs mt-2" style={{ color: "#B8634F" }}>
              {revokeError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
