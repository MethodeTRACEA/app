"use client";

import { useEffect, useState } from "react";
import { getOrCreateAnonymousId } from "@/lib/anonymous-id";

const CONSENT_KEY = "tracea_consent";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(CONSENT_KEY) !== "true") {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "true");
    // Génère l'ID anonyme dès le consentement
    getOrCreateAnonymousId();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        background: "rgba(26,18,13,0.96)",
        borderTop: "1px solid rgba(240,230,214,0.10)",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        backdropFilter: "blur(8px)",
      }}
    >
      <p
        style={{
          fontSize: 13,
          color: "rgba(240,230,214,0.65)",
          textAlign: "center",
          lineHeight: 1.55,
          margin: 0,
          maxWidth: 480,
        }}
      >
        TRAC&Eacute;A utilise des donn&eacute;es anonymes pour am&eacute;liorer l&apos;exp&eacute;rience.
      </p>
      <button
        onClick={accept}
        style={{
          background: "linear-gradient(135deg, #D4A96A 0%, #C97B6A 42%, #B8634F 72%, #A5503E 100%)",
          color: "#1A120D",
          border: "none",
          borderRadius: 40,
          padding: "10px 28px",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
        }}
      >
        Continuer
      </button>
    </div>
  );
}
