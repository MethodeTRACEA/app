import type { Metadata } from "next";
import { CercleLanding } from "../_landing/CercleLanding";
import { lireEtatInscription } from "../_landing/etat";

// Le Cercle TRACÉA en ligne — version B « aube » (fond clair).
// TEMPORAIRE : page de comparaison avec /cercle (version A). Non indexée
// (noindex hérité du layout /cercle). À supprimer une fois le choix fait.
export const metadata: Metadata = {
  title: "Le Cercle TRACÉA · Quand ça déborde (version B)",
  description:
    "Parce que personne ne devrait rester seul avec ce qui déborde.",
};

export const dynamic = "force-dynamic";

export default async function CercleVersionBPage() {
  const etat = await lireEtatInscription();
  return <CercleLanding theme="aube" etat={etat} />;
}
