"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { NightMode } from "@/components/NightMode";
import { useState, useEffect, useRef } from "react";

const publicLinks = [{ href: "/app", label: "Accueil" }];

const authLinks = [
  { href: "/app", label: "Accueil" },
  { href: "/app/session", label: "Session" },
  { href: "/app/entrainement", label: "S'entraîner" },
  { href: "/app/historique", label: "Traces" },
  { href: "/app/ressources", label: "Ressources" },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, loading, isAdmin, signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const links = user ? authLinks : publicLinks;

  // Fermer le drawer au changement de page
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Fermer le drawer au clic en dehors
  useEffect(() => {
    if (!drawerOpen) return;
    function handleClick(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setDrawerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [drawerOpen]);

  // Bloquer le scroll quand le drawer est ouvert
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-espresso border-b border-espresso">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Gauche : Logo */}
            <Link href="/app" className="flex-shrink-0">
              <Image
                src="/images/tracea-logo-terra-v2.png"
                alt="TRACÉA"
                width={512}
                height={369}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>

            {/* Centre : TRACÉA (mobile) / liens (desktop) */}
            <span className="font-serif text-lg text-cream tracking-wider md:hidden">
              TRACÉA
            </span>

            {/* Desktop : liens classiques */}
            <div className="hidden md:flex items-center gap-2">
              <ul className="flex gap-1">
                {links.map((link) => {
                  const isActive =
                    link.href === "/app"
                      ? pathname === "/app"
                      : pathname.startsWith(link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-200 ${
                          isActive
                            ? "bg-terra text-cream"
                            : "text-beige-dark hover:text-terra-light hover:bg-white/10"
                        }`}
                      >
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
                {user && isAdmin && (
                  <li>
                    <Link
                      href="/app/admin"
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-200 ${
                        pathname === "/app/admin"
                          ? "bg-terra text-cream"
                          : "text-beige-dark hover:text-terra-light hover:bg-white/10"
                      }`}
                    >
                      <span className="text-sm">&#9881;</span>
                      <span>Admin</span>
                    </Link>
                  </li>
                )}
              </ul>
              {!loading && !user && (
                <Link
                  href="/app/connexion"
                  className="btn-primary !px-4 !py-1.5 !text-xs"
                >
                  Connexion
                </Link>
              )}
              <NightMode />
            </div>

            {/* Mobile : bouton menu hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              <NightMode />
              <button
                onClick={() => setDrawerOpen(true)}
                className="w-10 h-10 flex items-center justify-center text-cream rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Ouvrir le menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── DRAWER MOBILE ── */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 md:hidden ${
          drawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panneau latéral */}
      <div
        ref={drawerRef}
        className={`fixed top-0 left-0 z-[70] h-full w-72 bg-espresso shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header du drawer */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-white/10">
          <span className="font-serif text-lg text-cream tracking-wider">
            TRACÉA
          </span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-9 h-9 flex items-center justify-center text-cream/70 hover:text-cream rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Fermer le menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Liens */}
        <nav className="px-3 py-4 space-y-1">
          {links.map((link) => {
            const isActive =
              link.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-200 ${
                  isActive
                    ? "bg-terra text-cream"
                    : "text-beige-dark hover:bg-white/8 hover:text-cream"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {user && isAdmin && (
            <Link
              href="/app/admin"
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-200 ${
                pathname === "/app/admin"
                  ? "bg-terra text-cream"
                  : "text-beige-dark hover:bg-white/8 hover:text-cream"
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Séparateur + actions bas */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 px-3 py-4 space-y-1">
          {!loading && !user && (
            <Link
              href="/app/connexion"
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium tracking-wide text-terra hover:bg-terra/10 transition-all"
            >
              Connexion
            </Link>
          )}
          {user && (
            <button
              onClick={async () => {
                await signOut();
                setDrawerOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-medium tracking-wide text-dusty hover:bg-white/5 transition-all text-left"
            >
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </>
  );
}
