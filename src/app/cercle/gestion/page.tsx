import type { Metadata } from "next";
import { GestionClient } from "./GestionClient";

// Le Cercle TRACÉA en ligne : page privée de gestion du cycle.
// Protégée par un code (CERCLE_GESTION_CODE). Non indexée (le gabarit
// /cercle l'exclut déjà), absente du sitemap, sans lien depuis le site.
export const metadata: Metadata = {
  title: "Gestion du Cercle",
  robots: { index: false, follow: false },
};

export default function CercleGestionPage() {
  return <GestionClient />;
}
