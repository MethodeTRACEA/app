import { Navigation } from "@/components/Navigation";
import { CookieBanner } from "@/components/CookieBanner";
import { AuthProvider } from "@/lib/auth-context";
import { OnboardingRedirect } from "@/components/OnboardingRedirect";
import Link from "next/link";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <Navigation />
      <OnboardingRedirect />
      <main className="flex-1">{children}</main>
      <footer className="bg-espresso text-beige-dark text-center py-6 md:py-8 text-sm tracking-wide px-4">
        <img src="/images/tracea-logo-terra-hd.png" alt="TRACÉA" className="h-10 md:h-14 mx-auto mb-2 object-contain" />
        <p className="mb-4 text-xs md:text-sm">
          Stabilité émotionnelle · Entraînement physiologique
        </p>
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 text-xs text-warm-gray">
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
  );
}
