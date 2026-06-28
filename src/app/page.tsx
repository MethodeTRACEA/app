// Server Component — PAS de "use client".
//
// force-dynamic : Next.js évalue cette route à chaque requête (pas au build).
// Cela permet de lire LAUNCH_MODE au runtime : changer la variable dans Vercel
// prend effet immédiatement, sans avoir à rebuilder ni redéployer.
//
// Bascule le 12 juin :
//   Vercel → Settings → Environment Variables → LAUNCH_MODE
//   prelaunch → live  (aucun autre changement requis)
import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { JsonLd } from "@/components/JsonLd";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "TRACÉA : Gérer ses émotions quand ça déborde",
  description:
    "Poitrine serrée, pensées en boucle ? TRACÉA te donne un geste concret à faire avec ton corps, là, maintenant. Gratuit, en 2 min. Pas une thérapie.",
};

export const dynamic = "force-dynamic";

export default function Home() {
  const isPrelaunch = process.env.LAUNCH_MODE === "prelaunch";
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={webSiteJsonLd()} />
      <LandingPage isPrelaunch={isPrelaunch} />
    </>
  );
}
