"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { NightMode } from "@/components/NightMode";

const publicLinks = [
  { href: "/", label: "Accueil" },
];

const authLinks = [
  { href: "/", label: "Accueil" },
  { href: "/app/entrainement", label: "S'entraîner" },
  { href: "/app/historique", label: "Historique" },
  { href: "/app/ressources", label: "Ressources" },
  { href: "/app/profil", label: "Profil" },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, loading, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = user ? authLinks : publicLinks;

  const linkClass = (href: string) => {
    const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return `flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-200 ${
      isActive ? "bg-terra text-cream" : "text-warm-gray hover:text-terra hover:bg-beige"
    }`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-beige-dark">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/tracea-logo-espresso-transparent.png"
              alt="TRACÉA"
              width={120}
              height={36}
              className="h-8 w-auto dark:hidden"
              priority
            />
            <Image
              src="/images/tracea-logo-blanc-transparent.png"
              alt="TRACÉA"
              width={120}
              height={36}
              className="h-8 w-auto hidden dark:block"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            <ul className="flex gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass(link.href)}>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
              {user && isAdmin && (
                <li>
                  <Link
                    href="/app/admin"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-200 ${
                      pathname === "/app/admin"
                        ? "bg-espresso text-cream"
                        : "text-warm-gray hover:text-espresso hover:bg-beige"
                    }`}
                  >
                    <span className="text-sm">⚙</span>
                    <span>Admin</span>
                  </Link>
                </li>
              )}
            </ul>
            {!loading && !user && (
              <Link href="/app/connexion" className="btn-primary !px-4 !py-1.5 !text-xs">
                Connexion
              </Link>
            )}
            <NightMode />
          </div>

          {/* Mobile right: NightMode + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <NightMode />
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              className="p-2 rounded-lg text-warm-gray hover:text-terra hover:bg-beige transition-colors"
            >
              {menuOpen ? (
                /* X icon */
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                /* Hamburger icon */
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-beige-dark bg-cream/98 px-4 py-3">
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={linkClass(link.href)}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {user && isAdmin && (
              <li>
                <Link
                  href="/app/admin"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-200 ${
                    pathname === "/app/admin"
                      ? "bg-espresso text-cream"
                      : "text-warm-gray hover:text-espresso hover:bg-beige"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-sm">⚙</span>
                  <span>Admin</span>
                </Link>
              </li>
            )}
          </ul>
          {!loading && !user && (
            <div className="mt-3 pt-3 border-t border-beige-dark">
              <Link
                href="/app/connexion"
                className="btn-primary !px-4 !py-2 !text-xs w-full text-center block"
                onClick={() => setMenuOpen(false)}
              >
                Connexion
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
