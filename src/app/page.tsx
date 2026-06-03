// Server Component — PAS de "use client".
//
// force-dynamic : Next.js évalue cette route à chaque requête (pas au build).
// Cela permet de lire LAUNCH_MODE au runtime : changer la variable dans Vercel
// prend effet immédiatement, sans avoir à rebuilder ni redéployer.
//
// Bascule le 12 juin :
//   Vercel → Settings → Environment Variables → LAUNCH_MODE
//   prelaunch → live  (aucun autre changement requis)
import LandingPage from "@/components/LandingPage";

export const dynamic = "force-dynamic";

export default function Home() {
  const isPrelaunch = process.env.LAUNCH_MODE === "prelaunch";
  return <LandingPage isPrelaunch={isPrelaunch} />;
}
