import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import {
  CASES_OBLIGATOIRES,
  CRENEAUX,
  CYCLE_ID,
  PARTICIPATIONS,
  TEXTES_VERSION,
  inscriptionsCloses,
  type CreneauId,
  type ParticipationId,
} from "@/lib/cercle/config";
import {
  compterPlaces,
  getCercleStripe,
  getCerclePriceId,
} from "@/lib/cercle/stripe";

// ===================================================================
// POST /api/cercle/inscription — Le Cercle TRACÉA en ligne
//
// Reçoit le formulaire de /cercle, vérifie tout côté serveur, puis crée
// une page de paiement Stripe Checkout (paiement unique de 12 €).
//
// Séparation stricte avec l'application :
//   - aucune lecture/écriture Supabase ;
//   - réglages Stripe propres au Cercle (cf. src/lib/cercle/stripe.ts) ;
//   - le webhook Stripe de l'app ignore déjà les paiements uniques.
//
// Où vont les réponses :
//   - métadonnées de la session Checkout : uniquement le cycle et le
//     créneau (nécessaires au comptage des places, non modifiables) ;
//   - métadonnées du paiement (PaymentIntent) : toutes les réponses et
//     chaque case cochée avec sa date et son heure. Ces métadonnées sont
//     modifiables, ce qui permettra d'effacer téléphone et commune une
//     semaine après la dernière rencontre.
// ===================================================================

export const runtime = "nodejs";

// ── Limite de requêtes par IP (même principe que /api/chapitre-offert) ──
const ipWindows = new Map<string, number[]>();
const IP_MAX = 10;
const IP_WIN = 10 * 60_000;

function slidingWindow(key: string): boolean {
  const now = Date.now();
  const cutoff = now - IP_WIN;
  const ts = (ipWindows.get(key) ?? []).filter((t) => t > cutoff);
  if (ts.length >= IP_MAX) {
    ipWindows.set(key, ts);
    return false;
  }
  ts.push(now);
  ipWindows.set(key, ts);
  if (ipWindows.size > 5_000) ipWindows.clear();
  return true;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^[+0-9 ().-]{6,25}$/;

function texte(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim().replace(/\s+/g, " ");
  if (t.length === 0 || t.length > max) return null;
  return t;
}

function erreur(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

export async function POST(request: NextRequest) {
  // 1. Inscriptions closes ?
  if (inscriptionsCloses()) {
    return erreur("Les inscriptions sont closes.", "closed", 403);
  }

  // 2. Réglages Stripe du Cercle (mode test obligatoire sauf feu vert).
  const cs = getCercleStripe();
  if (!cs.ok) {
    console.warn("[CERCLE] Inscription refusée, réglage:", cs.reason);
    return erreur(
      "Les inscriptions ne sont pas encore ouvertes.",
      "not_open",
      403
    );
  }

  // 3. Limite de requêtes.
  const ip = getClientIp(request.headers) ?? "unknown";
  if (!slidingWindow(ip)) {
    return erreur(
      "Trop de tentatives. Réessaie dans quelques minutes.",
      "rate_limited",
      429
    );
  }

  // 4. Lecture et validation du formulaire.
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 4_096) {
    return erreur("Formulaire invalide.", "too_large", 413);
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return erreur("Formulaire invalide.", "invalid_body", 400);
  }

  const prenom = texte(body.prenom, 60);
  const email = texte(body.email, 254)?.toLowerCase() ?? null;
  const telephone = texte(body.telephone, 25);
  const commune = texte(body.commune, 80);
  const creneau = CRENEAUX.find((c) => c.id === body.creneau);
  const participation = PARTICIPATIONS.find(
    (p) => p.id === body.participation
  );
  const prochainCycle = body.prochainCycle === true;
  const cases = (body.cases ?? {}) as Record<string, unknown>;

  if (
    !prenom ||
    !email ||
    !EMAIL_REGEX.test(email) ||
    !telephone ||
    !PHONE_REGEX.test(telephone) ||
    (telephone.match(/\d/g)?.length ?? 0) < 8 ||
    !commune ||
    !creneau ||
    !participation
  ) {
    return erreur(
      "Certaines réponses manquent ou sont incomplètes.",
      "invalid_fields",
      400
    );
  }
  if (!CASES_OBLIGATOIRES.every((c) => cases[c.id] === true)) {
    return erreur(
      "Toutes les cases obligatoires doivent être cochées.",
      "missing_consent",
      400
    );
  }

  try {
    const stripe = cs.stripe;

    // 5. Places restantes (paiements réussis + paiements en cours).
    const places = await compterPlaces(stripe);
    if (!places[creneau.id as CreneauId]) {
      return erreur(
        creneau.id === "deux"
          ? "Les deux créneaux sont complets."
          : "Ce créneau est complet. Tu peux en choisir un autre.",
        "full",
        409
      );
    }

    // 6. Prix « Cercle TRACÉA en ligne », 12 €, paiement unique.
    const priceId = await getCerclePriceId(stripe);

    // 7. Preuve horodatée : réponses + chaque case cochée.
    const valideA = new Date().toISOString();
    const casesMetadata: Record<string, string> = {};
    for (const c of CASES_OBLIGATOIRES) {
      casesMetadata[`case_${c.id}`] = `cochée le ${valideA}`;
    }

    const paiementMetadata: Record<string, string> = {
      cercle: CYCLE_ID,
      creneau: creneau.id,
      creneau_libelle: creneau.label,
      prenom,
      email_inscription: email,
      telephone,
      commune,
      participation: participation.id as ParticipationId,
      participation_libelle: participation.label,
      prochain_cycle: prochainCycle
        ? `oui, cochée le ${valideA}`
        : "non",
      ...casesMetadata,
      textes_version: TEXTES_VERSION,
      formulaire_valide_le: valideA,
    };

    const origin = request.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      locale: "fr",
      submit_type: "pay",
      allow_promotion_codes: false,
      // 30 min : durée minimale autorisée par Stripe. Pendant ce temps
      // la place est réservée (comptée dans compterPlaces).
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60 + 30,
      metadata: { cercle: CYCLE_ID, creneau: creneau.id },
      payment_intent_data: {
        description: `Cercle TRACÉA en ligne · ${creneau.label}`,
        metadata: paiementMetadata,
      },
      success_url: `${origin}/cercle/merci`,
      cancel_url: `${origin}/cercle?paiement=annule#inscription`,
    });

    if (!session.url) {
      console.error("[CERCLE] Session Stripe sans URL:", session.id);
      return erreur("Erreur de paiement. Réessaie.", "no_url", 500);
    }

    console.log(
      "[CERCLE] Session créée:",
      session.id,
      "créneau:",
      creneau.id,
      cs.live ? "LIVE" : "test"
    );
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[CERCLE] Exception Stripe:", msg);
    return erreur(
      "Le paiement n'a pas pu démarrer. Réessaie dans un instant.",
      "stripe_error",
      500
    );
  }
}
