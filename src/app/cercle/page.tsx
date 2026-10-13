import type { Metadata } from "next";
import { CercleLanding } from "./_landing/CercleLanding";
import { lireEtatInscription } from "./_landing/etat";

// Le Cercle TRACÉA en ligne — page de présentation (version « aube »,
// retenue le 13/10/2026). Contenu : _landing/CercleLanding.tsx.
export const metadata: Metadata = {
  title: "Le Cercle TRACÉA · Quand ça déborde",
  description:
    "Parce que personne ne devrait rester seul avec ce qui déborde.",
};

// Page calculée à chaque visite : date de clôture et places restantes.
export const dynamic = "force-dynamic";

export default async function CerclePage() {
  const etat = await lireEtatInscription();
  return <CercleLanding etat={etat} />;
}
