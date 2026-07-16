import type { Metadata } from "next";
import { LivresContent } from "./LivresContent";

// Textes issus du brief chantier 63 (audités doctrine) — ne pas reformuler.
export const metadata: Metadata = {
  title: "Les livres | TRACÉA",
  description:
    "Deux livres pour comprendre ce qui se passe en toi. Quand tout monte trop fort, et quand tout s'éloigne.",
};

// L'état précommande / lancement est recalculé à chaque requête, côté
// serveur : la bascule du 1er août est automatique (pas de redéploiement)
// et l'HTML envoyé correspond toujours à l'état réel (pas de décalage
// d'hydratation côté client).
export const dynamic = "force-dynamic";

const DATE_SORTIE = new Date("2026-08-01T00:00:00+02:00");

export default function LivresPage() {
  const enPrecommande = Date.now() < DATE_SORTIE.getTime();
  return <LivresContent enPrecommande={enPrecommande} />;
}
