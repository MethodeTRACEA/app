"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CRENEAUX } from "@/lib/cercle/config";
import { FONT_SANS, cardStyle, colors, pStyle } from "../_ui";
import {
  boxStyle,
  choiceStyle,
  helpStyle,
  inputStyle,
  labelStyle,
  legendStyle,
} from "../CercleForm";

// Formulaire « Renoncer au contrat ». Aucun stockage dans le navigateur.
export function RenoncerForm() {
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [creneau, setCreneau] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [termine, setTermine] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setEnvoi(true);
    try {
      const res = await fetch("/api/cercle/retractation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom, email, creneau }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setTermine(true);
        return;
      }
      setMessage(data.error ?? "Ta demande n'a pas pu partir. Écris-moi à cercledeparole@methodetracea.fr.");
    } catch {
      setMessage("Ta demande n'a pas pu partir. Écris-moi à cercledeparole@methodetracea.fr.");
    }
    setEnvoi(false);
  }

  if (termine) {
    return (
      <div role="status" style={{ ...cardStyle, padding: "32px 24px" }}>
        <p style={{ ...pStyle, fontSize: "1.25rem", color: colors.title, margin: 0 }}>
          {"C'est noté. Tu vas recevoir un accusé de réception par email."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ ...cardStyle, padding: "30px 22px" }}>
      <div style={{ marginBottom: 22 }}>
        <label htmlFor="renoncer-prenom" style={labelStyle}>
          {"Prénom ou pseudonyme"}
        </label>
        <input
          id="renoncer-prenom"
          name="prenom"
          type="text"
          required
          maxLength={60}
          autoComplete="given-name"
          value={prenom}
          onChange={(ev) => setPrenom(ev.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 22 }}>
        <label htmlFor="renoncer-email" style={labelStyle}>
          {"Email utilisé pour l'inscription"}
        </label>
        <p id="renoncer-email-aide" style={helpStyle}>
          {"C'est l'adresse qui a servi pour le paiement."}
        </p>
        <input
          id="renoncer-email"
          name="email"
          type="email"
          inputMode="email"
          required
          maxLength={254}
          autoComplete="email"
          aria-describedby="renoncer-email-aide"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          style={inputStyle}
        />
      </div>

      <fieldset style={{ border: "none", padding: 0, margin: "0 0 24px" }}>
        <legend style={legendStyle}>{"Créneau"}</legend>
        {CRENEAUX.map((c) => (
          <label key={c.id} style={choiceStyle}>
            <input
              type="radio"
              name="creneau"
              value={c.id}
              required
              checked={creneau === c.id}
              onChange={() => setCreneau(c.id)}
              style={boxStyle}
            />
            <span>{c.label}</span>
          </label>
        ))}
      </fieldset>

      {message && (
        <p role="alert" style={{ ...pStyle, color: colors.error, fontWeight: 600 }}>
          {message}
        </p>
      )}

      <div style={{ textAlign: "center", marginTop: 8 }}>
        <button
          type="submit"
          disabled={envoi}
          aria-busy={envoi}
          className="cl-cta"
          style={{ border: "none", cursor: envoi ? "wait" : "pointer", opacity: envoi ? 0.7 : 1, fontFamily: FONT_SANS, fontSize: "1.0625rem", padding: "16px 24px", maxWidth: "100%" }}
        >
          {"Confirmer la rétractation"}
        </button>
      </div>
    </form>
  );
}
