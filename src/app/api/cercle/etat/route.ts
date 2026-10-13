import { NextResponse } from "next/server";
import { diagnosticEtat } from "@/app/cercle/_landing/etat";

// ===================================================================
// GET /api/cercle/etat : « les inscriptions ouvrent bientôt ? »
//
// Sert au repère « Bientôt » de l'onglet « Cercle de parole » du menu.
// Même calcul que la page /cercle (diagnosticEtat), sans Stripe. Ne
// renvoie qu'un booléen : aucun réglage, aucune raison, aucune valeur.
// Mise en cache courte côté Vercel pour ne pas solliciter la fonction à
// chaque page vue ; calculée à chaque requête (jamais figée à la
// construction du site).
// ===================================================================

export const dynamic = "force-dynamic";

export async function GET() {
  const { etat } = diagnosticEtat();
  return NextResponse.json(
    { bientot: etat === "bientot" },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}
