"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import {
  BROUILLON_KEY,
  CASES_OBLIGATOIRES,
  CRENEAUX,
  PARTICIPATIONS,
  type CaseId,
  type PlacesState,
} from "@/lib/cercle/config";
import { FONT_SANS, colors, h2Style, linkStyle, pStyle } from "./_ui";

// ===================================================================
// Formulaire d'inscription du Cercle (étape 2, paiement Stripe en test).
//
// Brouillon : les réponses sont gardées dans le navigateur (sessionStorage,
// effacé à la fermeture de l'onglet) pour que la personne retrouve tout si
// elle annule le paiement. Effacé sur /cercle/merci. Aucun cookie, aucun
// envoi ailleurs que vers /api/cercle/inscription.
// ===================================================================

type Etat = {
  prenom: string;
  email: string;
  telephone: string;
  commune: string;
  creneau: string;
  participation: string;
  prochainCycle: boolean;
  cases: Record<CaseId, boolean>;
};

const ETAT_VIDE: Etat = {
  prenom: "",
  email: "",
  telephone: "",
  commune: "",
  creneau: "",
  participation: "",
  prochainCycle: false,
  cases: {
    majeur: false,
    conditions: false,
    engagement: false,
    securite: false,
    debut_anticipe: false,
  },
};

// Liens dans le texte de deux cases (s'ouvrent dans un nouvel onglet pour
// ne pas perdre le formulaire).
const LIENS_CASES: Partial<Record<CaseId, { mot: string; href: string }>> = {
  conditions: { mot: "conditions d'inscription", href: "/cercle/conditions" },
  securite: { mot: "seulement pour ma sécurité", href: "/cercle/confidentialite" },
};

const font = FONT_SANS;

export const labelStyle: CSSProperties = {
  display: "block",
  fontFamily: font,
  fontSize: "1.0625rem",
  fontWeight: 600,
  color: colors.heading,
  marginBottom: 4,
};

export const helpStyle: CSSProperties = {
  fontFamily: font,
  fontSize: "0.9375rem",
  color: colors.muted,
  margin: "0 0 8px",
  lineHeight: 1.5,
};

export const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  fontFamily: font,
  fontSize: "1.0625rem",
  color: colors.inputText,
  background: colors.inputBg,
  border: `1px solid ${colors.inputBorder}`,
  borderRadius: 10,
  padding: "12px 14px",
  minHeight: 48,
};

export const choiceStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  fontFamily: font,
  fontSize: "1.0625rem",
  lineHeight: 1.55,
  color: colors.body,
  padding: "8px 0",
  cursor: "pointer",
};

export const boxStyle: CSSProperties = {
  width: 20,
  height: 20,
  marginTop: 3,
  flexShrink: 0,
  accentColor: colors.terra,
  cursor: "pointer",
};

export const legendStyle: CSSProperties = { ...labelStyle, padding: 0, marginBottom: 6 };

function TexteCase({ id, texte }: { id: CaseId; texte: string }) {
  const lien = LIENS_CASES[id];
  if (!lien || !texte.includes(lien.mot)) return <>{texte}</>;
  const [avant, apres] = texte.split(lien.mot);
  return (
    <>
      {avant}
      <a href={lien.href} target="_blank" rel="noopener" style={linkStyle}>
        {lien.mot}
        <span className="sr-only"> (s&apos;ouvre dans un nouvel onglet)</span>
      </a>
      {apres}
    </>
  );
}

export function CercleForm({ places }: { places: PlacesState }) {
  const [etat, setEtat] = useState<Etat>(ETAT_VIDE);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [annule, setAnnule] = useState(false);

  // Restaurer le brouillon (retour depuis Stripe après annulation).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(BROUILLON_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Etat;
        setEtat({ ...ETAT_VIDE, ...saved, cases: { ...ETAT_VIDE.cases, ...saved.cases } });
      }
    } catch {
      // brouillon illisible : on repart d'un formulaire vide
    }
    if (new URLSearchParams(window.location.search).get("paiement") === "annule") {
      setAnnule(true);
    }
  }, []);

  // Garder le brouillon à chaque modification.
  useEffect(() => {
    if (etat === ETAT_VIDE) return;
    try {
      sessionStorage.setItem(BROUILLON_KEY, JSON.stringify(etat));
    } catch {
      // stockage indisponible : pas grave, le formulaire marche quand même
    }
  }, [etat]);

  const maj = <K extends keyof Etat>(k: K, v: Etat[K]) =>
    setEtat((e) => ({ ...e, [k]: v }));

  // Un créneau devenu complet ne reste pas sélectionné.
  const creneauDispo = (id: string) =>
    places[id as keyof PlacesState] !== false;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    if (!creneauDispo(etat.creneau)) {
      setMessage("Ce créneau est complet. Tu peux en choisir un autre.");
      return;
    }
    setEnvoi(true);
    try {
      const res = await fetch("/api/cercle/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(etat),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (res.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      setMessage(data.error ?? "Le paiement n'a pas pu démarrer. Réessaie dans un instant.");
    } catch {
      setMessage("Le paiement n'a pas pu démarrer. Réessaie dans un instant.");
    }
    setEnvoi(false);
  }

  const champ = (
    id: "prenom" | "email" | "telephone" | "commune",
    label: string,
    aide: string,
    props: { type: string; autoComplete: string; maxLength: number; inputMode?: "tel" | "email" }
  ) => (
    <div style={{ marginBottom: 22 }}>
      <label htmlFor={`cercle-${id}`} style={labelStyle}>
        {label}
      </label>
      <p id={`cercle-${id}-aide`} style={helpStyle}>
        {aide}
      </p>
      <input
        id={`cercle-${id}`}
        name={id}
        required
        aria-describedby={`cercle-${id}-aide`}
        value={etat[id]}
        onChange={(ev) => maj(id, ev.target.value)}
        className="cercle-input"
        style={inputStyle}
        {...props}
      />
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate={false}>
      <h2 id="inscription-titre" style={{ ...h2Style, marginTop: 0 }}>
        {"Je m'inscris au Cercle"}
      </h2>

      {annule && (
        <p role="status" style={{ ...pStyle, color: colors.heading }}>
          {"Le paiement n'a pas abouti. Tes réponses sont toujours là."}
        </p>
      )}

      {champ("prenom", "Prénom ou pseudonyme", "C'est le nom que tu afficheras sur Zoom.", {
        type: "text",
        autoComplete: "given-name",
        maxLength: 60,
      })}
      {champ("email", "Email", "Pour t'envoyer le lien.", {
        type: "email",
        autoComplete: "email",
        maxLength: 254,
        inputMode: "email",
      })}
      {champ(
        "telephone",
        "Téléphone",
        "Uniquement pour te joindre si tu sembles en danger pendant une rencontre.",
        { type: "tel", autoComplete: "tel", maxLength: 25, inputMode: "tel" }
      )}
      {champ(
        "commune",
        "Commune où tu seras pendant les rencontres",
        "Pour la même raison, et seulement celle-là.",
        { type: "text", autoComplete: "address-level2", maxLength: 80 }
      )}

      <fieldset style={{ border: "none", padding: 0, margin: "0 0 22px" }}>
        <legend style={legendStyle}>{"Ton créneau"}</legend>
        {CRENEAUX.map((c) => {
          const dispo = creneauDispo(c.id);
          return (
            <label
              key={c.id}
              style={{ ...choiceStyle, opacity: dispo ? 1 : 0.55, cursor: dispo ? "pointer" : "not-allowed" }}
            >
              <input
                type="radio"
                name="creneau"
                value={c.id}
                required
                disabled={!dispo}
                checked={etat.creneau === c.id}
                onChange={() => maj("creneau", c.id)}
                style={boxStyle}
              />
              <span>
                {c.label}
                {!dispo && <strong style={{ color: colors.heading }}>{" · complet"}</strong>}
              </span>
            </label>
          );
        })}
      </fieldset>

      <fieldset style={{ border: "none", padding: 0, margin: "0 0 22px" }}>
        <legend style={legendStyle}>{"Comment souhaites-tu participer ?"}</legend>
        {PARTICIPATIONS.map((p) => (
          <label key={p.id} style={choiceStyle}>
            <input
              type="radio"
              name="participation"
              value={p.id}
              required
              checked={etat.participation === p.id}
              onChange={() => maj("participation", p.id)}
              style={boxStyle}
            />
            <span>{p.label}</span>
          </label>
        ))}
      </fieldset>

      <div style={{ borderTop: `1px solid ${colors.line}`, paddingTop: 14, marginBottom: 14 }}>
        {CASES_OBLIGATOIRES.map((c) => (
          <label key={c.id} style={choiceStyle}>
            <input
              type="checkbox"
              name={c.id}
              required
              checked={etat.cases[c.id]}
              onChange={(ev) =>
                setEtat((e) => ({ ...e, cases: { ...e.cases, [c.id]: ev.target.checked } }))
              }
              style={boxStyle}
            />
            <span>
              <TexteCase id={c.id} texte={c.texte} />
            </span>
          </label>
        ))}
        <label style={choiceStyle}>
          <input
            type="checkbox"
            name="prochainCycle"
            checked={etat.prochainCycle}
            onChange={(ev) => maj("prochainCycle", ev.target.checked)}
            style={boxStyle}
          />
          <span>{"Préviens-moi du prochain cycle."}</span>
        </label>
      </div>

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
          className="cercle-submit"
          style={{
            fontFamily: font,
            fontSize: "1.0625rem",
            fontWeight: 600,
            color: "#1A120D",
            background:
              "linear-gradient(135deg, #D4A96A 0%, #C97B6A 42%, #B8634F 72%, #A5503E 100%)",
            border: "none",
            borderRadius: 40,
            padding: "15px 34px",
            minHeight: 52,
            cursor: envoi ? "wait" : "pointer",
            opacity: envoi ? 0.7 : 1,
          }}
        >
          {"Valider et payer"}
        </button>
      </div>
    </form>
  );
}
