"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { CSSProperties } from "react";

// Liens de la barre publique.
const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/comment-ca-marche", label: "Comment ça marche" },
  { href: "/articles", label: "Articles" },
  { href: "/livres", label: "Livres" },
];

// Pages publiques où la barre ne doit PAS apparaître (elles gardent leur
// propre mise en page : écran plein de /start, pages légales claires).
const HIDDEN = new Set([
  "/start",
  "/mentions-legales",
  "/politique-confidentialite",
  "/conditions-utilisation",
]);

export function PublicNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === "/";

  // Accueil : barre transparente en haut, qui devient sombre au défilement.
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Refermer le menu mobile quand on change de page.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Pas de barre publique sur l'application ni sur les pages exclues.
  if (pathname.startsWith("/app")) return null;
  if (HIDDEN.has(pathname)) return null;

  const showLogo = !isHome;
  const solid = !isHome || scrolled || menuOpen;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const navStyle: CSSProperties = {
    position: isHome ? "fixed" : "sticky",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    background: solid ? "rgba(26,18,13,0.92)" : "transparent",
    borderBottom: solid
      ? "1px solid rgba(240,230,214,0.10)"
      : "1px solid transparent",
    backdropFilter: solid ? "blur(10px)" : "none",
    WebkitBackdropFilter: solid ? "blur(10px)" : "none",
    transition: "background 0.3s ease, border-color 0.3s ease",
  };

  const linkStyle = (href: string): CSSProperties => ({
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: isActive(href) ? "#F5EFE6" : "rgba(240,230,214,0.72)",
    textDecoration: "none",
    transition: "color 0.2s ease",
  });

  const ctaStyle: CSSProperties = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    color: "#1A120D",
    background:
      "linear-gradient(135deg, #D4A96A 0%, #C97B6A 42%, #B8634F 72%, #A5503E 100%)",
    borderRadius: 40,
    padding: "9px 22px",
    textDecoration: "none",
    whiteSpace: "nowrap",
  };

  return (
    <nav style={navStyle}>
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Gauche : logo (sauf sur l'accueil, qui a déjà son grand logo) */}
          {showLogo ? (
            <Link href="/" aria-label="Accueil TRACÉA" className="flex items-center">
              <img
                src="/images/tracea-logo-blanc-transparent.png"
                alt="TRACÉA"
                className="h-8 w-auto object-contain"
              />
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}

          {/* Desktop : liens + bouton Commencer */}
          <div className="hidden md:flex items-center gap-6">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} style={linkStyle(link.href)}>
                {link.label}
              </Link>
            ))}
            <Link href="/start" style={ctaStyle}>
              Commencer
            </Link>
          </div>

          {/* Mobile : bouton hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg"
            style={{ color: "#E8D8C7" }}
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {menuOpen && (
        <div
          className="md:hidden"
          style={{
            background: "rgba(26,18,13,0.98)",
            borderTop: "1px solid rgba(240,230,214,0.10)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{ ...linkStyle(link.href), padding: "10px 4px", fontSize: 15 }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/start"
              onClick={() => setMenuOpen(false)}
              style={{ ...ctaStyle, textAlign: "center", marginTop: 8, padding: "12px 22px" }}
            >
              Commencer
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
