// ===================================================================
// Interrupteurs de fonctionnalités — un seul point de contrôle.
//
// Ces constantes servent à mettre une page en veille sans rien
// supprimer : le code, les textes et les images restent en place,
// seule la visibilité change.
// ===================================================================

// LIVRES_ACTIF — page /livres (les deux livres + le pack).
//
//   false = page mise en veille :
//           · le lien « Livres » disparaît de la barre de navigation
//           · l'URL /livres redirige vers l'accueil (redirection
//             temporaire 307, sans conséquence pour le référencement)
//           · l'URL est retirée du sitemap envoyé à Google
//
//   true  = tout revient exactement comme avant, sans autre modification.
//
// Mise en veille demandée par Alyson le 14/09/2026.
export const LIVRES_ACTIF = false;
