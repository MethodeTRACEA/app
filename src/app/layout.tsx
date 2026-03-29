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
      <head>
        <link rel="icon" href="/images/tracea-favicon.ico" sizes="any" />
        <link rel="icon" href="/images/tracea-favicon-32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/images/tracea-favicon-64.png" sizes="64x64" type="image/png" />
        <link rel="apple-touch-icon" href="/images/tracea-apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navigation />
          <OnboardingRedirect />
          <main className="flex-1">{children}</main>
          <footer className="bg-espresso text-beige-dark text-center py-8 text-sm tracking-wide">
            <div className="flex flex-col items-center mb-2">
              <svg width="32" height="32" viewBox="0 0 100 100" fill="none" aria-hidden="true" className="text-terra-light mb-1">
                <path d="M 38 12 C 60 6, 85 18, 90 45 C 95 72, 78 92, 50 94 C 22 96, 6 78, 8 52 C 10 30, 25 16, 38 12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M 42 28 C 58 24, 72 34, 74 50 C 76 66, 64 78, 48 78 C 32 78, 22 66, 24 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
                <circle cx="50" cy="44" r="4" fill="currentColor" />
              </svg>
              <span className="font-serif text-sm tracking-[0.2em] text-terra-light">TRACÉA</span>
            </div>
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
