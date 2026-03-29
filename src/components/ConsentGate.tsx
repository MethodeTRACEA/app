"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { hasValidConsent, saveConsent, revokeConsent, getConsent } from "@/lib/consent";

interface ConsentGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ConsentGate({ children, fallback }: ConsentGateProps) {
  const [consented, setConsented] = useState<boolean | null>(null);

  useEffect(() => {
    setConsented(hasValidConsent());
  }, []);

  if (consented === null) return null; // Loading
  if (consented) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return <ConsentForm onConsent={() => setConsented(true)} />;
}

function ConsentForm({ onConsent }: { onConsent: () => void }) {
  const [dataProcessing, setDataProcessing] = useState(false);
  const [sensitiveData, setSensitiveData] = useState(false);
  const [localStorageUsage, setLocalStorageUsage] = useState(false);
  const allChecked = dataProcessing && sensitiveData && localStorageUsage;

  function handleSubmit() {
    if (!allChecked) return;
    saveConsent({
      dataProcessing,
      sensitiveData,
      localStorageUsage,
      date: new Date().toISOString(),
      version: "1.0",
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
        TRACEA traite des données personnelles et émotionnelles sensibles. Avant
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
          Lors d&apos;une session TRACEA, tu seras invité(e) à décrire tes
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
              J&apos;accepte le traitement de mes données personnelles
            </span>
            <p className="text-xs text-warm-gray mt-0.5">
              Prénom/pseudonyme, données de session et de progression, dans le
              cadre de l&apos;utilisation de l&apos;application TRACEA.
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
              J&apos;accepte le traitement de mes données émotionnelles sensibles
            </span>
            <p className="text-xs text-warm-gray mt-0.5">
              Descriptions d&apos;émotions, ressentis corporels, vérités
              intérieures, données relevant de l&apos;article 9 du RGPD
              (données de santé psychologique).
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
              J&apos;accepte le stockage sécurisé de mes données
            </span>
            <p className="text-xs text-warm-gray mt-0.5">
              Mes données de session seront conservées dans une base de données
              sécurisée hébergée en Union européenne (Francfort, Allemagne) via Supabase.
            </p>
          </div>
        </label>
      </div>

      <div className="card-base mb-6">
        <p className="text-xs text-warm-gray leading-relaxed">
          En cochant ces cases, tu donnes ton consentement libre, spécifique,
          éclairé et univoque au traitement de tes données. Tu peux retirer
          ce consentement à tout moment depuis la page{" "}
          <Link href="/profil" className="text-terra hover:text-terra-dark underline">
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
        disabled={!allChecked}
        className="btn-primary w-full text-center disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Je donne mon consentement et j&apos;accepte les CGU
      </button>

      <p className="text-xs text-warm-gray text-center mt-4">
        Tu dois cocher les trois cases pour continuer.
      </p>
    </div>
  );
}

export function RevokeConsentButton() {
  const [showConfirm, setShowConfirm] = useState(false);

  function handleRevoke() {
    revokeConsent();
    localStorage.removeItem("tracea_sessions");
    localStorage.removeItem("tracea_profile");
    localStorage.removeItem("tracea_cookie_consent");
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
            Cette action supprimera définitivement toutes tes sessions, ton
            profil et ton consentement. Cette action est irréversible.
          </p>
          <div className="flex gap-3">
            <button onClick={handleRevoke} className="btn-primary !bg-terra-dark !text-sm">
              Confirmer la suppression
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="btn-ghost !text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
