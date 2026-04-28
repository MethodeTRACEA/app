const KEY = "tracea_anonymous_id";

/**
 * Retourne l'ID anonyme persistant de l'utilisateur.
 * Génère un UUID si absent, le stocke dans localStorage.
 * Safe côté serveur (retourne "" si window indisponible).
 */
export function getOrCreateAnonymousId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
