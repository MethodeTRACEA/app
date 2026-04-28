import { NextResponse } from "next/server";
import { generateToken } from "@/lib/track-token";

// ===================================================================
// GET /api/track-token
//
// Émet un token HMAC horaire pour signer les appels /api/track-event.
// Stateless — aucun stockage serveur.
// Le client cache le token dans sessionStorage pour la durée de l'onglet.
// ===================================================================

export function GET() {
  try {
    const token = generateToken();
    return NextResponse.json({ token });
  } catch (err) {
    console.error("[TRACK TOKEN] Erreur génération:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export function POST()   { return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 }); }
export function PUT()    { return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 }); }
export function DELETE() { return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 }); }
