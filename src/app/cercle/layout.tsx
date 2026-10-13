import type { Metadata } from "next";
import { CercleFooter, pageStyle } from "./_ui";

// Le Cercle TRACÉA en ligne — enveloppe commune des pages /cercle/*.
// Pilote : pages non indexées (noindex) et absentes du sitemap, par
// décision d'Alyson. Pas de barre de menu (PublicNav les exclut), pas de
// mesure d'audience (SiteAnalytics) ni de Sentry navigateur.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CercleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="cercle" style={pageStyle}>
      <style>{`
        .cercle input:focus-visible,
        .cercle button:focus-visible,
        .cercle a:focus-visible {
          outline: 2px solid #E0A893;
          outline-offset: 3px;
          border-radius: 4px;
        }
        .cercle-footer-link:hover { color: #F5EFE6 !important; }
      `}</style>
      <main style={{ flex: 1 }}>{children}</main>
      <CercleFooter />
    </div>
  );
}
