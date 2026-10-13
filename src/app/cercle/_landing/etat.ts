import {
  TOUTES_PLACES_LIBRES,
  inscriptionsCloses,
  type PlacesState,
} from "@/lib/cercle/config";
import { compterPlaces, getCercleStripe, typeCleStripe } from "@/lib/cercle/stripe";

// État de la zone d'inscription de /cercle :
//   « clos »    : après le 13 novembre 2026 à 23 h 59 (Paris) ;
//   « bientôt » : tant qu'un réglage manque ou est refusé (voir
//                 diagnosticEtat, qui donne la raison précise) ;
//   « ouvert »  : formulaire affiché.
export type EtatInscription =
  | { type: "bientot" }
  | { type: "clos" }
  | { type: "ouvert"; places: PlacesState };

export type DiagnosticEtat = {
  etat: "bientot" | "ouvert" | "clos";
  raison: string;
};

// Calcul de l'état SANS appeler Stripe, avec la raison. C'est la seule
// source de vérité : la page /cercle et la section « Réglages » de
// /cercle/gestion l'utilisent toutes les deux.
export function diagnosticEtat(): DiagnosticEtat {
  if (inscriptionsCloses()) {
    return { etat: "clos", raison: "La date de fermeture (13 novembre 2026, 23 h 59, heure de Paris) est passée." };
  }
  const cs = getCercleStripe();
  if (cs.ok) {
    return { etat: "ouvert", raison: "Tous les réglages nécessaires sont bons : le formulaire est affiché." };
  }
  // Plusieurs causes peuvent se cumuler : on les cite toutes.
  const causes: string[] = [];
  if (process.env.CERCLE_INSCRIPTIONS_ACTIVES !== "true") {
    causes.push(
      "CERCLE_INSCRIPTIONS_ACTIVES n'est pas exactement « true » (absente, ou avec une majuscule, un espace ou des guillemets)."
    );
  }
  const type = typeCleStripe();
  if (type === null) {
    causes.push("CERCLE_STRIPE_SECRET_KEY est absente.");
  } else if (type !== "test" && process.env.CERCLE_STRIPE_LIVE !== "true") {
    causes.push(
      type === "autre"
        ? "La clé Stripe ne commence ni par sk_test_ ni par rk_test_ (début inattendu : espace, guillemet ou mauvais préfixe). Elle est donc traitée comme une clé réelle et refusée, car CERCLE_STRIPE_LIVE n'est pas « true »."
        : "La clé Stripe est une clé réelle (live) et CERCLE_STRIPE_LIVE n'est pas « true » : refusée par sécurité."
    );
  }
  if (causes.length === 0) causes.push(`Raison inattendue (${cs.reason}).`);
  return { etat: "bientot", raison: causes.join(" Et aussi : ") };
}

export async function lireEtatInscription(): Promise<EtatInscription> {
  const d = diagnosticEtat();
  if (d.etat === "clos") return { type: "clos" };
  if (d.etat === "bientot") return { type: "bientot" };
  const cs = getCercleStripe();
  if (!cs.ok) return { type: "bientot" }; // ne se produit pas : diagnosticEtat l'a déjà vérifié
  try {
    return { type: "ouvert", places: await compterPlaces(cs.stripe) };
  } catch (err) {
    // Stripe injoignable : on affiche le formulaire, le serveur
    // revérifiera les places au moment de « Valider et payer ».
    console.error(
      "[CERCLE] Comptage des places impossible:",
      err instanceof Error ? err.message : String(err)
    );
    return { type: "ouvert", places: TOUTES_PLACES_LIBRES };
  }
}
