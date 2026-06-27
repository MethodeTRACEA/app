import type { Metadata } from "next";

// Layout "passe-plat" : il n'affiche rien de plus, il sert uniquement à
// porter les métadonnées SEO de la page /comment-ca-marche (qui est un
// composant client et ne peut donc pas exporter `metadata` elle-même).
export const metadata: Metadata = {
  title: "Gérer ses émotions : la méthode TRACÉA en 6 étapes",
  description:
    "TRACÉA t'accompagne en 6 étapes (T·R·A·C·E·A) pour partir du corps, pas de la tête, quand une émotion déborde. Concret, en quelques minutes.",
};

export default function CommentCaMarcheLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
