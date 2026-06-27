import type { MetadataRoute } from "next";

// Domaine canonique du site (avec www).
const BASE_URL = "https://www.methodetracea.fr";

// Zones privées : l'application et les routes techniques ne doivent pas
// être explorées ni indexées par les moteurs.
const DISALLOW = ["/app/", "/api/"];

// Robots explicitement autorisés : Google + principaux robots d'IA.
// Les nommer ne change pas l'autorisation (la règle « * » plus bas les
// couvrirait déjà), mais cela rend le robots.txt lisible et garantit
// qu'ils ne seront jamais bloqués par erreur.
const ALLOWED_BOTS = [
  "Googlebot",        // Google (recherche classique)
  "Google-Extended",  // Google (entraînement / réponses IA Gemini)
  "GPTBot",           // OpenAI / ChatGPT
  "OAI-SearchBot",    // OpenAI (recherche)
  "ChatGPT-User",     // OpenAI (navigation à la demande)
  "ClaudeBot",        // Anthropic / Claude
  "Claude-Web",       // Anthropic (navigation à la demande)
  "PerplexityBot",    // Perplexity
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...ALLOWED_BOTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
      // Tous les autres robots : autorisés partout sauf les zones privées.
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
