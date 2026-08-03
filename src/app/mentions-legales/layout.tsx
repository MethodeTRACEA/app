import type { Metadata } from "next";

// Layout "passe-plat" : porte uniquement le titre SEO de la page
// /mentions-legales (composant client, ne peut pas exporter `metadata`).
export const metadata: Metadata = {
  alternates: { canonical: "https://www.methodetracea.fr/mentions-legales" },
  title: "Mentions légales | TRACÉA",
};

export default function MentionsLegalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
