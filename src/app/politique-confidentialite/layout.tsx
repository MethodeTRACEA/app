import type { Metadata } from "next";

// Layout "passe-plat" : porte uniquement le titre SEO de la page
// /politique-confidentialite (composant client, ne peut pas exporter
// `metadata`).
export const metadata: Metadata = {
  title: "Politique de confidentialité | TRACÉA",
};

export default function PolitiqueConfidentialiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
