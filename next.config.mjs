import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Chantier 58 (fusion "Ton espace") — /app/historique et /app/ce-qui-change
  // fusionnent dans /app/espace. Redirections permanentes (301) pour les
  // favoris, liens partagés et navigateurs en cache. Les pages historique/
  // ce-qui-change ne sont pas supprimées ici (P6, après une semaine de prod
  // calme) : ce redirect les rend simplement inatteignables dès maintenant.
  async redirects() {
    return [
      {
        source: "/app/historique",
        destination: "/app/espace",
        permanent: true,
      },
      {
        source: "/app/ce-qui-change",
        destination: "/app/espace",
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
});
