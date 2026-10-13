import {
  TOUTES_PLACES_LIBRES,
  inscriptionsCloses,
  type PlacesState,
} from "@/lib/cercle/config";
import { compterPlaces, getCercleStripe } from "@/lib/cercle/stripe";

// État de la zone d'inscription, partagé par /cercle et /cercle/b :
// « bientôt » tant que CERCLE_INSCRIPTIONS_ACTIVES n'est pas posé,
// « clos » après le 13 novembre 2026 à 23 h 59 (Paris), sinon formulaire.
export type EtatInscription =
  | { type: "bientot" }
  | { type: "clos" }
  | { type: "ouvert"; places: PlacesState };

export async function lireEtatInscription(): Promise<EtatInscription> {
  if (inscriptionsCloses()) return { type: "clos" };
  const cs = getCercleStripe();
  if (!cs.ok) return { type: "bientot" };
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
