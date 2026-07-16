import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";

// ===================================================================
// CHAPITRE OFFERT — Route serveur (chantier 63)
// Inscription au groupe MailerLite « Livres - chapitre offert ».
// L'automatisation MailerLite (« Ton chapitre est là ») fait le reste.
//
// Sécurité :
//   - Validation stricte de l'e-mail côté serveur
//   - Rate limit par IP (5 requêtes / 10 min) : empêche d'arroser la liste
//   - Clé API exclusivement côté serveur (jamais dans le bundle client)
//   - Adresse déjà inscrite = succès (aucune fuite d'information)
//   - Jamais d'adresse e-mail en clair dans les logs
// ===================================================================

const MAILERLITE_URL = "https://connect.mailerlite.com/api/subscribers";
// Groupe « Livres - chapitre offert » — surchargable par variable d'env.
const GROUP_ID = process.env.MAILERLITE_GROUP_ID || "193174490716308620";

// ── Rate limit in-memory (sliding window, même pattern que track-event) ──

const ipWindows = new Map<string, number[]>();
const IP_MAX = 5;
const IP_WIN = 10 * 60_000; // 10 minutes

const CLEANUP_INTERVAL = 5 * 60_000;
let lastCleanup = Date.now();

function cleanupMap() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const cutoff = now - IP_WIN;
  ipWindows.forEach((ts, k) => {
    if (!ts.some((t) => t > cutoff)) ipWindows.delete(k);
  });
}

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
  return true;
}

// ── Validation e-mail ────────────────────────────────────────────────
// Format simple et strict : pas d'espaces, un seul @, un TLD d'au moins
// 2 caractères. MailerLite revalide de son côté.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ── POST ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    cleanupMap();

    // 1. Taille payload max (1 KB — un e-mail, rien d'autre)
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 1_024) {
      return NextResponse.json({ ok: false }, { status: 413 });
    }

    // 2. Parse body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // 3. Validation e-mail — aucun appel MailerLite si le format est invalide
    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (!email || email.length > 254 || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // 4. Rate limit par IP
    const ip = getClientIp(request.headers);
    if (ip && !slidingWindow(ip)) {
      console.warn("[CHAPITRE OFFERT] Rate limit IP");
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    // 5. Clé API — serveur uniquement
    const apiKey = process.env.MAILERLITE_API_KEY;
    if (!apiKey) {
      console.error("[CHAPITRE OFFERT] MAILERLITE_API_KEY manquante");
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    // 6. Inscription au groupe. L'API MailerLite fait un upsert :
    //    201 = nouvelle abonnée, 200 = adresse déjà connue (mise à jour).
    //    Les deux sont un succès — ne jamais révéler qu'une adresse
    //    était déjà en base.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    let mlResponse: Response;
    try {
      mlResponse = await fetch(MAILERLITE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, groups: [GROUP_ID] }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (mlResponse.status === 200 || mlResponse.status === 201) {
      return NextResponse.json({ ok: true });
    }

    // Erreur MailerLite : log du statut uniquement (jamais l'adresse),
    // aucun détail renvoyé au client.
    console.error(`[CHAPITRE OFFERT] MailerLite HTTP ${mlResponse.status}`);
    return NextResponse.json({ ok: false }, { status: 502 });
  } catch (err) {
    // Timeout ou erreur réseau — même discrétion.
    console.error(
      "[CHAPITRE OFFERT] Erreur:",
      err instanceof Error ? err.name : "inconnue",
    );
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// Rejeter toute autre méthode
export function GET()    { return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 }); }
export function PUT()    { return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 }); }
export function DELETE() { return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 }); }
