import { NextRequest, NextResponse } from "next/server";

// ⚠️  Stripe n'est pas encore intégré.
// Cette route est bloquée pour empêcher toute auto-activation de l'abonnement.
// À déverrouiller uniquement quand la vérification de paiement Stripe sera en place.
//
// Le code de mise à jour du profil (is_subscribed = true via service role) est conservé
// en commentaire ci-dessous pour la future intégration :
//
// import { createClient } from "@supabase/supabase-js";
// ... vérifier le webhook Stripe, puis :
// await supabaseService.from("profiles").update({ is_subscribed: true }).eq("id", user.id);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { error: "Paiement non encore activé" },
    { status: 403 }
  );
}
