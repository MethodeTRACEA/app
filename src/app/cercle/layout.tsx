import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { CercleFooter, Halo } from "./_ui";
import "./cercle.css";

// Le Cercle TRACÉA en ligne — enveloppe commune des pages /cercle/*.
// Pilote : pages non indexées (noindex) et absentes du sitemap, par
// décision d'Alyson. Pas de barre de menu (PublicNav les exclut), pas de
// mesure d'audience (SiteAnalytics) ni de Sentry navigateur.
//
// Polices : next/font les télécharge AU MOMENT DE LA CONSTRUCTION et les
// sert depuis le site (/_next/static/media). Le navigateur des visiteuses
// ne contacte aucun serveur extérieur. Limitées aux pages du Cercle.
const serif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cercle-serif",
});

const sans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cercle-sans",
});

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CercleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`cercle ${serif.variable} ${sans.variable}`}>
      <Halo />
      <main style={{ flex: 1, position: "relative", zIndex: 1 }}>{children}</main>
      <CercleFooter />
    </div>
  );
}
