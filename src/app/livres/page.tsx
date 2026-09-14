import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LIVRES_ACTIF } from "@/lib/feature-flags";
import { LivresContent } from "./LivresContent";

// Textes issus du brief chantier 63 (audités doctrine) — ne pas reformuler.
export const metadata: Metadata = {
  alternates: { canonical: "https://www.methodetracea.fr/livres" },
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
  // Page mise en veille : même en tapant l'URL directement, on repart
  // sur l'accueil. Rien n'est supprimé, il suffit de repasser
  // LIVRES_ACTIF à true pour tout retrouver.
  if (!LIVRES_ACTIF) redirect("/");

  const enPrecommande = Date.now() < DATE_SORTIE.getTime();
  return <LivresContent enPrecommande={enPrecommande} />;
}
