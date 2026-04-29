"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { updateProfileDb } from "@/lib/supabase-store";

export default function BienvenuePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [prenom, setPrenom] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/app/connexion");
      return;
    }
    setReady(true);
  }, [user, authLoading, router]);

  // Masquer le footer du layout sur cette page uniquement
  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-bienvenue-hide-footer", "");
    style.textContent = "footer { display: none !important; }";
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  async function handleStart() {
    if (!user) return;
    setSaving(true);

    try {
      if (prenom.trim()) {
        await updateProfileDb(user.id, { display_name: prenom.trim() });
      }
    } catch {
      // Ne pas bloquer l'onboarding si la sauvegarde échoue
    }

    localStorage.setItem("tracea_onboarding_done", "true");
    router.push("/app/traversee-courte");
  }

  if (authLoading || !ready) {
    return (
      <div
        className="relative overflow-hidden flex items-center justify-center"
        style={{ minHeight: "100dvh", background: "#1A120D" }}
      >
        <div
          className="font-serif text-2xl animate-pulse-gentle"
          style={{ color: "rgba(240,230,214,0.60)" }}
        >
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden"
      style={{ minHeight: "100dvh", background: "#1A120D" }}
    >
      {/* Couche 1 — gradients fond identiques à la landing / start */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(184,99,79,0.13) 0%, rgba(184,99,79,0.05) 34%, transparent 66%), " +
            "radial-gradient(ellipse at 15% 0%, rgba(111,106,100,0.16) 0%, transparent 58%)",
        }}
      />

      {/* Couche 2 — halo accent en haut */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(201,123,106,0.28) 0%, rgba(201,123,106,0) 75%)",
          zIndex: 0,
        }}
      />

      <div
        className="relative min-h-[100dvh] flex flex-col items-center justify-center px-5 py-10 md:py-16"
        style={{ zIndex: 1 }}
      >
        <div className="w-full max-w-md flex flex-col items-center text-center">
          {/* Logo */}
          <img
            src="/images/tracea-logo-terra-transparent.png"
            alt="TRACÉA"
            className="w-16 h-16 md:w-[72px] md:h-[72px] object-contain mb-8 animate-fade-in"
            style={{
              opacity: 0.92,
              filter: "drop-shadow(0 0 14px rgba(201,123,106,0.28))",
            }}
          />

          {/* Titre */}
          <h1
            className="font-light text-[32px] leading-[36px] tracking-[-0.01em] mb-3 animate-fade-up"
            style={{
              fontFamily: "'Cormorant Garamond', 'EB Garamond', serif",
              color: "#F0E6D6",
            }}
          >
            Bienvenue dans TRACÉA
          </h1>

          {/* Phrase contenante */}
          <p
            className="font-sans text-[14px] leading-[20px] mb-8 animate-fade-up"
            style={{ color: "rgba(240,230,214,0.62)" }}
          >
            Tu peux commencer simplement.
            <br />
            Ici, il n&apos;y a rien à réussir.
          </p>

          {/* Carte enveloppe premium — input + CTA + disclaimer */}
          <div
            className="w-full flex flex-col items-center animate-fade-up"
            style={{
              background: "rgba(111,106,100,0.18)",
              border: "1px solid rgba(240,230,214,0.10)",
              borderRadius: 24,
              padding: "26px 22px",
              boxShadow: "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            {/* Prénom — facultatif, discret */}
            <input
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Un prénom (facultatif)"
              disabled={saving}
              className="t-input mb-3 text-center"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleStart();
              }}
            />

            {/* CTA principal — unique action */}
            <button
              onClick={handleStart}
              disabled={saving}
              className="w-full h-[58px] flex items-center justify-center font-inter text-base font-semibold cursor-pointer transition-all duration-[250ms] mb-5 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background:
                  "linear-gradient(135deg, #D89986 0%, #C97B6A 50%, #A5503E 100%)",
                borderRadius: "26px",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow:
                  "0 4px 20px rgba(184,99,79,0.28), 0 1px 4px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.10) inset",
                color: "#1A120D",
              }}
            >
              {saving ? "Un instant..." : "Entrer dans mon espace"}
            </button>

            {/* Disclaimer 3114 — discret */}
            <p
              className="font-sans text-[11px] leading-[16px] max-w-xs"
              style={{ color: "rgba(240,230,214,0.38)" }}
            >
              TRACÉA ne remplace pas un suivi thérapeutique. En cas de crise, appelle le{" "}
              <span style={{ color: "rgba(240,230,214,0.62)" }}>3114</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
