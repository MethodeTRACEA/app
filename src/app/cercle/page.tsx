import type { Metadata } from "next";
import { CercleLanding } from "./_landing/CercleLanding";
import { lireEtatInscription } from "./_landing/etat";

// Le Cercle TRACÉA en ligne — page de présentation, version A « nuit
// chaude ». La version B « aube » est sur /cercle/b (temporaire, le temps
// qu'Alyson choisisse). Contenu commun : _landing/CercleLanding.tsx.
export const metadata: Metadata = {
  title: "Le Cercle TRACÉA · Quand ça déborde",
  description:
    "Parce que personne ne devrait rester seul avec ce qui déborde.",
};

// Page calculée à chaque visite : date de clôture et places restantes.
export const dynamic = "force-dynamic";

export default async function CerclePage() {
  const etat = await lireEtatInscription();
  return <CercleLanding theme="nuit" etat={etat} />;
}
