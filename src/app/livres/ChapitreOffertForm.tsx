"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";

// ===================================================================
// FORMULAIRE NATIF « CHAPITRE 1 OFFERT » — chantier 63
//
// Remplace l'intégration MailerLite embarquée : aucun script tiers.
// La soumission part vers /api/chapitre-offert (serveur), qui inscrit
// l'adresse au groupe MailerLite « Livres - chapitre offert » via
// l'API REST. L'automatisation MailerLite envoie ensuite l'e-mail
// « Ton chapitre est là » avec le lien du PDF.
//
// Textes audités doctrine (brief du 16/07 soir) : ne pas reformuler.
// ===================================================================

type Status = "repos" | "envoi" | "succes" | "erreur";

const inputStyle: CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 15,
  color: "#F0E6D6",
  background: "rgba(26,18,13,0.55)",
  border: "1.5px solid rgba(240,230,214,0.28)",
  borderRadius: 40,
  padding: "12px 18px",
  outline: "none",
  minWidth: 0,
};

const btnStyle: CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 15,
  fontWeight: 600,
  color: "#1A120D",
  background:
    "linear-gradient(135deg, #D4A96A 0%, #C97B6A 42%, #B8634F 72%, #A5503E 100%)",
  border: "none",
  borderRadius: 40,
  padding: "13px 24px",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const petitStyle: CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "0.8125rem",
  lineHeight: 1.6,
  color: "rgba(240,230,214,0.5)",
  margin: "16px auto 0",
  maxWidth: 460,
};

const succesStyle: CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "1rem",
  lineHeight: 1.75,
  color: "rgba(240,230,214,0.85)",
  margin: "0 auto",
  maxWidth: 460,
  outline: "none",
};

const erreurStyle: CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "0.9375rem",
  lineHeight: 1.6,
  color: "#E5A190",
  margin: "14px auto 0",
  maxWidth: 460,
};

export function ChapitreOffertForm() {
  const [status, setStatus] = useState<Status>("repos");
  const succesRef = useRef<HTMLParagraphElement>(null);

  // Accessibilité : au succès, le focus rejoint le message pour que
  // le changement d'état soit perçu au clavier comme au lecteur d'écran.
  useEffect(() => {
    if (status === "succes") succesRef.current?.focus();
  }, [status]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = (new FormData(e.currentTarget).get("email") ?? "")
      .toString()
      .trim();
    if (!email) return;
    setStatus("envoi");
    try {
      const res = await fetch("/api/chapitre-offert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => null);
      setStatus(res.ok && data?.ok === true ? "succes" : "erreur");
    } catch {
      setStatus("erreur");
    }
  }

  const envoi = status === "envoi";

  return (
    <div>
      {status !== "succes" && (
        <>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row sm:justify-center"
            style={{ gap: 12, maxWidth: 460, margin: "0 auto" }}
          >
            <label htmlFor="chapitre-email" className="sr-only">
              Adresse e-mail
            </label>
            <input
              id="chapitre-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Ton adresse e-mail"
              disabled={envoi}
              className="w-full sm:flex-1"
              style={{ ...inputStyle, ...(envoi ? { opacity: 0.6 } : {}) }}
            />
            <button
              type="submit"
              disabled={envoi}
              className="w-full sm:w-auto"
              style={{
                ...btnStyle,
                ...(envoi ? { opacity: 0.7, cursor: "wait" } : {}),
              }}
            >
              {envoi ? "Envoi…" : "Recevoir le chapitre 1"}
            </button>
          </form>
          <p style={petitStyle}>
            Tu recevras le chapitre par e-mail, puis les nouvelles des livres
            et de TRACÉA. Désinscription en un clic, à tout moment.
          </p>
        </>
      )}

      {/* Région persistante : les changements d'état y sont annoncés. */}
      <div aria-live="polite" role="status">
        {status === "succes" && (
          <p ref={succesRef} tabIndex={-1} style={succesStyle}>
            {`C'est parti. Le chapitre arrive dans ta boîte mail, d'ici une minute. Pense à regarder dans les spams si tu ne le vois pas.`}
          </p>
        )}
        {status === "erreur" && (
          <p style={erreurStyle}>
            {`Ça n'a pas fonctionné. Tu peux réessayer, ou écrire à `}
            <a
              href="mailto:contact@methodetracea.fr"
              style={{ color: "#E5A190", textDecoration: "underline" }}
            >
              contact@methodetracea.fr
            </a>
            {` et je t'envoie le chapitre à la main.`}
          </p>
        )}
      </div>
    </div>
  );
}
