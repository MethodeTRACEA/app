import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { CookieBanner } from "@/components/CookieBanner";
import { AuthProvider } from "@/lib/auth-context";
import { OnboardingRedirect } from "@/components/OnboardingRedirect";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TRACÉA · Régulation émotionnelle structurée",
  description:
    "Entraînement à la stabilité émotionnelle par la récupération physiologique",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navigation />
          <OnboardingRedirect />
          <main className="flex-1">{children}</main>
          <footer className="bg-espresso text-beige-dark text-center py-8 text-sm tracking-wide">
            <span className="text-terra font-serif text-xl block mb-2">
              TRACEA
            </span>
            <p className="mb-4">
              Stabilité émotionnelle · Entraînement physiologique
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-warm-gray">
              <Link
                href="/mentions-legales"
                className="hover:text-terra-light transition-colors"
              >
                Mentions légales
              </Link>
              <Link
                href="/politique-confidentialite"
                className="hover:text-terra-light transition-colors"
              >
                Politique de confidentialité
              </Link>
              <Link
                href="/conditions-utilisation"
                className="hover:text-terra-light transition-colors"
              >
                Conditions d&apos;utilisation
              </Link>
            </div>
          </footer>
          <CookieBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
