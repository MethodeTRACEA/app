import type { Metadata } from "next";

// Layout "passe-plat" : porte uniquement le titre SEO de la page
// /conditions-utilisation (composant client, ne peut pas exporter
// `metadata`).
export const metadata: Metadata = {
  title: "Conditions d'utilisation | TRACÉA",
};

export default function ConditionsUtilisationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
