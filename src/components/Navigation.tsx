"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const publicLinks = [
  { href: "/", label: "Accueil", icon: "◈" },
];

const authLinks = [
  { href: "/", label: "Accueil", icon: "◈" },
  { href: "/session", label: "Session", icon: "▸" },
  { href: "/historique", label: "Historique", icon: "◰" },
  { href: "/ressources", label: "Ressources", icon: "◇" },
  { href: "/profil", label: "Profil", icon: "○" },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, loading, isAdmin } = useAuth();

  const links = user ? authLinks : publicLinks;

  return (
    <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-beige-dark">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/tracea-logo-rouge.png"
              alt="TRACÉA"
              width={120}
              height={36}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <div className="flex items-center gap-2">
            <ul className="flex gap-1">
              {links.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-200 ${
                        isActive
                          ? "bg-terra text-cream"
                          : "text-warm-gray hover:text-terra hover:bg-beige"
                      }`}
                    >
                      <span className="text-sm">{link.icon}</span>
                      <span className="hidden sm:inline">{link.label}</span>
                    </Link>
                  </li>
                );
              })}
              {user && isAdmin && (
                <li>
                  <Link
                    href="/admin"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-200 ${
                      pathname === "/admin"
                        ? "bg-espresso text-cream"
                        : "text-warm-gray hover:text-espresso hover:bg-beige"
                    }`}
                  >
                    <span className="text-sm">⚙</span>
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                </li>
              )}
            </ul>
            {!loading && !user && (
              <Link href="/connexion" className="btn-primary !px-4 !py-1.5 !text-xs">
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
