"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { PARTICIPATIONS } from "@/lib/cercle/config";
import { colors, h2Style, pStyle } from "../_ui";
import { inputStyle, labelStyle } from "../CercleForm";

// ===================================================================
// Page privée de gestion du Cercle. Le code est gardé dans l'onglet
// (sessionStorage) et envoyé dans l'en-tête « x-cercle-code » : aucun
// cookie. Rien n'est conservé dans le navigateur au-delà de l'onglet.
// ===================================================================

const CLE_CODE = "cercle_gestion_code";

type Creneau = "vendredi" | "mardi";
type Reste = number | "a_decider" | null;

type Personne = {
  reference: string;
  prenom: string;
  email: string;
  creneau: "vendredi" | "mardi" | "deux";
  participation: string | null;
  prochainCycle: boolean;
  payeLe: string;
  paiementUrl: string;
  montantCentimes: number;
  rembourseCentimes: number;
  creneauConfirme: Creneau | null;
  groupeConfirmeLe: string | null;
  autreProposeLe: string | null;
  cycleAnnuleLe: string | null;
  retractationLe: string | null;
  retractationHorsDelai: boolean;
  du: Reste;
  reste: Reste;
  effaceLe: string | null;
  active: boolean;
};

type Rencontre = {
  creneau: Creneau;
  numero: number;
  libelle: string;
  passee: boolean;
  destinataires: number;
  dejaEnvoyes: number;
};

type Vue = {
  mode: "test" | "reel";
  zoom: { vendredi: boolean; mardi: boolean };
  personnes: Personne[];
  rencontres: Rencontre[];
  effacement: { premiereEcheance: string; aEffacer: number; effaces: number };
};

const NOM_CRENEAU: Record<Creneau, string> = { vendredi: "vendredi", mardi: "mardi" };

function jour(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", timeZone: "Europe/Paris" });
}

function euros(c: number): string {
  return `${(c / 100).toFixed(2).replace(".", ",")} €`;
}

function libelleParticipation(id: string | null): string {
  if (!id) return "(effacée)";
  return PARTICIPATIONS.find((p) => p.id === id)?.label ?? id;
}

export function GestionClient() {
  const [code, setCode] = useState("");
  const [saisie, setSaisie] = useState("");
  const [vue, setVue] = useState<Vue | null>(null);
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState<{ texte: string; erreur: boolean } | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [choix, setChoix] = useState<Record<string, string>>({});

  const appeler = useCallback(
    async (codeUtilise: string, methode: "GET" | "POST", corps?: Record<string, unknown>) => {
      const res = await fetch("/api/cercle/gestion", {
        method: methode,
        headers: { "x-cercle-code": codeUtilise, ...(corps ? { "Content-Type": "application/json" } : {}) },
        body: corps ? JSON.stringify(corps) : undefined,
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      return { res, data };
    },
    []
  );

  const charger = useCallback(
    async (codeUtilise: string) => {
      setChargement(true);
      try {
        const { res, data } = await appeler(codeUtilise, "GET");
        if (res.ok && data.ok) {
          setVue(data as Vue);
          setCode(codeUtilise);
          try {
            sessionStorage.setItem(CLE_CODE, codeUtilise);
          } catch {
            // stockage indisponible : le code sera redemandé au rechargement
          }
          return true;
        }
        setVue(null);
        setCode("");
        try {
          sessionStorage.removeItem(CLE_CODE);
        } catch {
          // rien à faire
        }
        setMessage({ texte: data.message ?? "Impossible de charger la page.", erreur: true });
        return false;
      } catch {
        setMessage({ texte: "Impossible de joindre le serveur.", erreur: true });
        return false;
      } finally {
        setChargement(false);
      }
    },
    [appeler]
  );

  useEffect(() => {
    try {
      const memorise = sessionStorage.getItem(CLE_CODE);
      if (memorise) void charger(memorise);
    } catch {
      // pas de stockage : on attend la saisie du code
    }
  }, [charger]);

  async function onConnexion(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    await charger(saisie.trim());
    setSaisie("");
  }

  function deconnexion() {
    try {
      sessionStorage.removeItem(CLE_CODE);
    } catch {
      // rien à faire
    }
    setCode("");
    setVue(null);
    setMessage(null);
  }

  async function agir(corps: Record<string, unknown>, confirmation: string) {
    if (!window.confirm(confirmation)) return;
    setEnCours(true);
    setMessage(null);
    try {
      const { data } = await appeler(code, "POST", corps);
      setMessage({ texte: data.message ?? "Fait.", erreur: !data.ok });
      await charger(code);
    } catch {
      setMessage({ texte: "L'action n'a pas abouti. Réessaie dans un instant.", erreur: true });
    } finally {
      setEnCours(false);
    }
  }

  // ── Écran du code ─────────────────────────────────────────────────
  if (!vue) {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "64px 20px 96px" }}>
        <h1 className="cl-h2" style={{ marginBottom: 12 }}>
          {"Gestion du Cercle"}
        </h1>
        <p style={pStyle}>{"Page privée. Saisis ton code d'accès."}</p>
        {message && (
          <p role="alert" className="cg-message cg-message--erreur">
            {message.texte}
          </p>
        )}
        <form onSubmit={onConnexion} style={{ marginTop: 20 }}>
          <label htmlFor="gestion-code" style={labelStyle}>
            {"Code d'accès"}
          </label>
          <input
            id="gestion-code"
            type="password"
            autoComplete="off"
            required
            value={saisie}
            onChange={(ev) => setSaisie(ev.target.value)}
            style={inputStyle}
          />
          <div style={{ marginTop: 18 }}>
            <button type="submit" className="cg-bouton" disabled={chargement}>
              {chargement ? "Vérification…" : "Entrer"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── Calculs d'affichage ───────────────────────────────────────────
  const personnes = vue.personnes;
  const actives = personnes.filter((p) => p.active);
  const groupe = (c: "vendredi" | "mardi" | "deux") => personnes.filter((p) => p.creneau === c);
  const confirmes = (c: Creneau) => actives.filter((p) => p.creneauConfirme === c).length;
  const aRembourser = personnes.filter((p) => p.reste !== null && p.reste !== 0);
  const enAttente = personnes.filter((p) => p.active && p.autreProposeLe && !p.creneauConfirme);
  const ciblesAnnulation = personnes.filter((p) => !p.cycleAnnuleLe && !p.retractationLe && !p.effaceLe && p.rembourseCentimes < p.montantCentimes);

  const carte = (p: Personne) => {
    const precis = p.creneau === "vendredi" || p.creneau === "mardi";
    const selection = choix[p.reference] ?? (precis ? (p.creneau as Creneau) : "");
    const bloquee = !p.active || enCours;
    return (
      <li key={p.reference} className="cg-personne">
        <p style={{ ...pStyle, margin: "0 0 4px", color: colors.title, fontWeight: 600, fontSize: "1.125rem" }}>
          {p.prenom} <span style={{ fontWeight: 400, color: colors.muted, fontSize: "1rem" }}>{p.email || "(adresse effacée)"}</span>
        </p>
        <div>
          <span className={`cg-puce${p.participation === "partager" ? " cg-puce--fort" : ""}`}>{libelleParticipation(p.participation)}</span>
          {p.participation === "partager" && <span className="cg-puce cg-puce--fort">{"À appeler avant la 2e rencontre"}</span>}
          {p.prochainCycle && <span className="cg-puce">{"Prochain cycle : oui"}</span>}
          {p.creneauConfirme && <span className="cg-puce cg-puce--ok">{`Groupe confirmé : ${NOM_CRENEAU[p.creneauConfirme]}`}</span>}
          {p.autreProposeLe && !p.creneauConfirme && <span className="cg-puce">{`Autre créneau proposé le ${jour(p.autreProposeLe)}`}</span>}
          {p.cycleAnnuleLe && <span className="cg-puce cg-puce--fort">{`Cycle annulé le ${jour(p.cycleAnnuleLe)}`}</span>}
          {p.retractationLe && (
            <span className="cg-puce cg-puce--fort">{`Rétractation le ${jour(p.retractationLe)}${p.retractationHorsDelai ? " (HORS DÉLAI)" : ""}`}</span>
          )}
          {p.rembourseCentimes > 0 && <span className="cg-puce cg-puce--ok">{`Remboursé : ${euros(p.rembourseCentimes)}`}</span>}
          {p.effaceLe && <span className="cg-puce">{`Données effacées le ${jour(p.effaceLe)}`}</span>}
        </div>
        {p.active && !p.creneauConfirme && (
          <div className="cg-actions">
            <label htmlFor={`creneau-${p.reference}`} className="sr-only">{`Groupe pour ${p.prenom}`}</label>
            <select
              id={`creneau-${p.reference}`}
              className="cg-select"
              value={selection}
              onChange={(ev) => setChoix((c) => ({ ...c, [p.reference]: ev.target.value }))}
            >
              <option value="">{"Choisir le groupe"}</option>
              <option value="vendredi">{"Vendredi, 21 h"}</option>
              <option value="mardi">{"Mardi, 14 h"}</option>
            </select>
            <button
              type="button"
              className="cg-bouton"
              disabled={bloquee || !selection}
              onClick={() =>
                agir(
                  { action: "confirmer", reference: p.reference, creneau: selection },
                  `Envoyer à ${p.prenom} ?\n\nElle recevra l'email « Ton groupe du Cercle est confirmé » (groupe du ${selection}).`
                )
              }
            >
              {"Confirmer et envoyer"}
            </button>
            {precis && !p.autreProposeLe && (
              <button
                type="button"
                className="cg-bouton cg-bouton--discret"
                disabled={bloquee}
                onClick={() =>
                  agir(
                    { action: "proposer_autre", reference: p.reference },
                    `Envoyer à ${p.prenom} ?\n\nElle recevra l'email lui proposant le groupe du ${p.creneau === "vendredi" ? "mardi" : "vendredi"}.`
                  )
                }
              >
                {"Proposer l'autre créneau"}
              </button>
            )}
          </div>
        )}
        <p style={{ ...pStyle, margin: "12px 0 0", fontSize: "0.9375rem" }}>
          <a href={p.paiementUrl} target="_blank" rel="noopener noreferrer" className="cl-link">
            {"Voir le paiement dans Stripe"}
            <span className="sr-only">{" (s'ouvre dans un nouvel onglet)"}</span>
          </a>
        </p>
      </li>
    );
  };

  const groupes: { titre: string; cle: "vendredi" | "mardi" | "deux" }[] = [
    { titre: "Le vendredi soir, 21 h", cle: "vendredi" },
    { titre: "Le mardi après-midi, 14 h", cle: "mardi" },
    { titre: "Les deux me vont", cle: "deux" },
  ];

  return (
    <div className="cl-wrap" style={{ padding: "48px 20px 96px", maxWidth: 860 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 className="cl-h2" style={{ margin: 0 }}>
          {"Gestion du Cercle"}
        </h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="cg-bouton cg-bouton--discret" onClick={() => charger(code)} disabled={chargement || enCours}>
            {chargement ? "Chargement…" : "Actualiser"}
          </button>
          <button type="button" className="cg-bouton cg-bouton--discret" onClick={deconnexion}>
            {"Se déconnecter"}
          </button>
        </div>
      </div>
      <p style={{ margin: "14px 0 0" }}>
        <span className={`cg-puce ${vue.mode === "test" ? "" : "cg-puce--fort"}`}>
          {vue.mode === "test" ? "Mode test Stripe : aucun vrai paiement" : "MODE RÉEL : vrais paiements"}
        </span>
      </p>

      {message && (
        <p role="status" className={`cg-message${message.erreur ? " cg-message--erreur" : ""}`} style={{ marginTop: 20 }}>
          {message.texte}
        </p>
      )}

      {/* Résumé */}
      <section className="cg-section" aria-labelledby="g-resume">
        <h2 id="g-resume" style={{ ...h2Style, fontSize: "1.5rem" }}>{"Où on en est"}</h2>
        <p style={pStyle}>
          {`${actives.length} inscrite(s) active(s) sur ${personnes.length}. Choix à l'inscription : ${groupe("vendredi").length} pour le vendredi, ${groupe("mardi").length} pour le mardi, ${groupe("deux").length} « les deux ».`}
        </p>
        <p style={pStyle}>
          {`Groupes confirmés : vendredi ${confirmes("vendredi")}, mardi ${confirmes("mardi")}. Chaque groupe a besoin d'au moins quatre personnes.`}
        </p>
      </section>

      {/* Inscrites */}
      <section className="cg-section" aria-labelledby="g-inscrites">
        <h2 id="g-inscrites" style={{ ...h2Style, fontSize: "1.5rem" }}>{"Les inscrites"}</h2>
        {personnes.length === 0 && <p style={pStyle}>{"Personne pour le moment."}</p>}
        {groupes.map((g) => {
          const liste = groupe(g.cle);
          if (liste.length === 0) return null;
          return (
            <div key={g.cle} style={{ marginTop: 28 }}>
              <h3 className="cl-h3" style={{ marginBottom: 12 }}>{`${g.titre} (${liste.length})`}</h3>
              <ul className="cg-liste">{liste.map(carte)}</ul>
            </div>
          );
        })}
      </section>

      {/* Annuler le cycle */}
      <section className="cg-section" aria-labelledby="g-annuler">
        <h2 id="g-annuler" style={{ ...h2Style, fontSize: "1.5rem" }}>{"Annuler le cycle"}</h2>
        <p style={pStyle}>
          {"Si aucun groupe n'a lieu : envoie l'email « Le Cercle n'aura pas lieu cette fois » à toutes les inscrites. Les remboursements restent à faire dans Stripe (liste plus bas)."}
        </p>
        <button
          type="button"
          className="cg-bouton"
          disabled={enCours || ciblesAnnulation.length === 0}
          onClick={() =>
            agir(
              { action: "annuler_cycle" },
              `Annuler le cycle et écrire à ${ciblesAnnulation.length} personne(s) ?\n\n${ciblesAnnulation.map((p) => p.prenom).join(", ")}`
            )
          }
        >
          {`Annuler le cycle (${ciblesAnnulation.length} email(s))`}
        </button>
      </section>

      {/* Remboursements */}
      <section className="cg-section" aria-labelledby="g-remb">
        <h2 id="g-remb" style={{ ...h2Style, fontSize: "1.5rem" }}>{"Remboursements à faire dans Stripe"}</h2>
        {aRembourser.length === 0 ? (
          <p style={pStyle}>{"Aucun remboursement en attente."}</p>
        ) : (
          <ul className="cg-liste">
            {aRembourser.map((p) => (
              <li key={p.reference} className="cg-ligne">
                <span style={{ ...pStyle, margin: 0 }}>
                  <strong style={{ color: colors.title }}>{p.prenom}</strong>
                  {p.cycleAnnuleLe ? " : cycle annulé" : p.retractationHorsDelai ? " : rétractation, HORS DÉLAI" : " : rétractation"}
                </span>
                <span style={{ ...pStyle, margin: 0, color: colors.title, fontWeight: 600 }}>
                  {p.reste === "a_decider" ? "montant à décider" : euros(p.reste as number)}
                </span>
                <a href={p.paiementUrl} target="_blank" rel="noopener noreferrer" className="cl-link">
                  {"Ouvrir le paiement"}
                  <span className="sr-only">{" (s'ouvre dans un nouvel onglet)"}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
        {enAttente.length > 0 && (
          <>
            <h3 className="cl-h3" style={{ margin: "28px 0 10px" }}>{"En attente de réponse"}</h3>
            <p style={pStyle}>
              {"Autre créneau proposé, pas encore confirmé. Si la personne répond « remboursement », rembourse 12 € dans Stripe."}
            </p>
            <ul className="cg-liste">
              {enAttente.map((p) => (
                <li key={p.reference} className="cg-ligne">
                  <span style={{ ...pStyle, margin: 0 }}>
                    <strong style={{ color: colors.title }}>{p.prenom}</strong>
                    {` : proposition du ${p.autreProposeLe ? jour(p.autreProposeLe) : ""}`}
                  </span>
                  <a href={p.paiementUrl} target="_blank" rel="noopener noreferrer" className="cl-link">
                    {"Ouvrir le paiement"}
                    <span className="sr-only">{" (s'ouvre dans un nouvel onglet)"}</span>
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* Liens Zoom */}
      <section className="cg-section" aria-labelledby="g-zoom">
        <h2 id="g-zoom" style={{ ...h2Style, fontSize: "1.5rem" }}>{"Liens Zoom de la veille"}</h2>
        <p style={pStyle}>
          {"En production, chaque veille à 18 h, le lien part tout seul aux personnes dont le groupe est confirmé. Ici, tu peux l'envoyer à la main pour tester."}
        </p>
        <p>
          <span className={`cg-puce ${vue.zoom.vendredi ? "cg-puce--ok" : "cg-puce--fort"}`}>
            {vue.zoom.vendredi ? "Lien Zoom du vendredi : réglé" : "Lien Zoom du vendredi : MANQUANT"}
          </span>
          <span className={`cg-puce ${vue.zoom.mardi ? "cg-puce--ok" : "cg-puce--fort"}`}>
            {vue.zoom.mardi ? "Lien Zoom du mardi : réglé" : "Lien Zoom du mardi : MANQUANT"}
          </span>
        </p>
        <ul className="cg-liste">
          {vue.rencontres.map((r) => {
            const reste = r.destinataires - r.dejaEnvoyes;
            return (
              <li key={`${r.creneau}-${r.numero}`} className="cg-ligne">
                <span style={{ ...pStyle, margin: 0 }}>
                  <strong style={{ color: colors.title }}>{r.libelle}</strong>
                  <br />
                  {`${r.destinataires} personne(s) confirmée(s), liens déjà envoyés : ${r.dejaEnvoyes}`}
                </span>
                <button
                  type="button"
                  className="cg-bouton cg-bouton--discret"
                  disabled={enCours || reste <= 0 || !vue.zoom[r.creneau]}
                  onClick={() =>
                    agir(
                      { action: "envoyer_liens", creneau: r.creneau, numero: r.numero },
                      `Envoyer le lien Zoom de « ${r.libelle} » à ${reste} personne(s) ?`
                    )
                  }
                >
                  {"Envoyer maintenant"}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Effacement */}
      <section className="cg-section" aria-labelledby="g-effacement">
        <h2 id="g-effacement" style={{ ...h2Style, fontSize: "1.5rem" }}>{"Effacement des données"}</h2>
        <p style={pStyle}>
          {`Comme promis dans la politique de confidentialité, téléphones, communes, prénoms et façons de participer sont effacés une semaine après la dernière rencontre de chaque groupe (à partir du ${jour(vue.effacement.premiereEcheance)}). Cela se fait tout seul en production, avec un compte rendu par email.`}
        </p>
        <p style={pStyle}>{`Paiements à nettoyer : ${vue.effacement.aEffacer}. Déjà nettoyés : ${vue.effacement.effaces}.`}</p>
        <button
          type="button"
          className="cg-bouton cg-bouton--discret"
          disabled={enCours || vue.effacement.aEffacer === 0}
          onClick={() =>
            agir(
              { action: "effacer", forcer: vue.mode === "test" },
              vue.mode === "test"
                ? `MODE TEST. Effacer maintenant les données de ${vue.effacement.aEffacer} paiement(s) de test ? C'est irréversible.`
                : "Effacer les données des paiements dont l'échéance est passée ? C'est irréversible."
            )
          }
        >
          {vue.mode === "test" ? "Effacer maintenant (test)" : "Lancer l'effacement des échéances passées"}
        </button>
      </section>
    </div>
  );
}
