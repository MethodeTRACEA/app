import type { MetadataRoute } from "next";

// Domaine canonique du site (avec www, comme demandé).
const BASE_URL = "https://www.methodetracea.fr";

// Pages PUBLIQUES uniquement — celles qu'on veut voir remonter dans
// Google et les moteurs de recherche.
// On n'inclut volontairement PAS :
//   - les pages sous /app/* (l'application, réservée aux utilisateurs)
//   - les routes techniques /api/*
//   - /retour (formulaire de feedback, pas une page de contenu)
const PUBLIC_ROUTES = [
  "", // accueil
  "/comment-ca-marche",
  "/start",
  "/mentions-legales",
  "/politique-confidentialite",
  "/conditions-utilisation",
  // Articles SEO
  "/articles/submerge-par-ses-emotions-que-faire",
  "/articles/etre-a-fleur-de-peau-hypersensibilite",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_ROUTES.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
