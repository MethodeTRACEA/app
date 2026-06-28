// Données structurées JSON-LD / Schema.org.
// Balisage technique INVISIBLE : aucun texte affiché ni design n'en dépend.
// Types volontairement NEUTRES (Article, Organization, WebSite,
// BreadcrumbList). Jamais de type médical / santé / thérapeutique.
// Aucune donnée inventée : pas d'avis, pas de note (aggregateRating).

export const SITE_URL = "https://www.methodetracea.fr";

// Description neutre, reprise telle quelle de la metadata existante
// (layout racine src/app/layout.tsx).
const SITE_DESCRIPTION = "Outil de régulation émotionnelle en temps réel";

// Dates du lot d'articles (mise en ligne), comme demandé.
const DATE_PUBLISHED = "2026-06-28";
const DATE_MODIFIED = "2026-06-28";

// Organisation éditrice, réutilisée en author ET publisher des articles.
const ORGANIZATION = {
  "@type": "Organization",
  name: "TRACÉA",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/images/tracea-icon-512.png`,
    width: 512,
    height: 512,
  },
} as const;

export function articleJsonLd(params: {
  slug: string;
  headline: string;
  description: string;
}) {
  const url = `${SITE_URL}/articles/${params.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.headline,
    description: params.description,
    inLanguage: "fr-FR",
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    author: ORGANIZATION,
    publisher: ORGANIZATION,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

export function articleBreadcrumbJsonLd(params: { slug: string; title: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Articles",
        item: `${SITE_URL}/articles`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: params.title,
        item: `${SITE_URL}/articles/${params.slug}`,
      },
    ],
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TRACÉA",
    url: SITE_URL,
    logo: ORGANIZATION.logo,
    description: SITE_DESCRIPTION,
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TRACÉA",
    url: SITE_URL,
    inLanguage: "fr-FR",
  };
}
