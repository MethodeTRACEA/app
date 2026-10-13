"use client";

import { Analytics } from "@vercel/analytics/react";
import { usePathname } from "next/navigation";

// Mesure d'audience Vercel, partout SAUF sur les pages du Cercle TRACÉA
// en ligne (/cercle/*), qui ne doivent charger aucun outil de mesure.
// Double garde : le script n'est pas monté sur /cercle, et si une
// navigation interne l'avait déjà chargé, beforeSend jette tout
// événement dont l'adresse est sous /cercle.
function isCercle(path: string): boolean {
  return path === "/cercle" || path.startsWith("/cercle/");
}

export function SiteAnalytics() {
  const pathname = usePathname();
  if (isCercle(pathname)) return null;

  return (
    <Analytics
      beforeSend={(event) => {
        try {
          if (isCercle(new URL(event.url).pathname)) return null;
        } catch {
          // URL illisible : on laisse passer, comme avant.
        }
        return event;
      }}
    />
  );
}
