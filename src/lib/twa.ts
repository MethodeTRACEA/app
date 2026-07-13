// TRACÉA — Détection du contexte TWA Android (chantier 60).
//
// Choix retenu (note de finesse du brief 13/07) : on ne considère comme
// TWA que l'app distribuée par le Play Store, identifiée par le référent
// `android-app://`. Une PWA installée depuis le navigateur sur Android
// tombe aussi en display-mode standalone, mais la contrainte billing
// Google ne s'applique qu'à l'app Play Store : elle garde donc l'achat.
//
// Le référent n'est fiable qu'au premier chargement (une navigation dure
// à l'intérieur de la TWA le remplace par l'URL de la page précédente).
// On le fige donc en sessionStorage dès qu'on l'a vu, pour que la
// détection survive aux rechargements pendant toute la session.

const TWA_SESSION_KEY = "tracea_twa_context";

export function isRunningInTWA(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(TWA_SESSION_KEY) === "1") return true;
    if (document.referrer.startsWith("android-app://")) {
      sessionStorage.setItem(TWA_SESSION_KEY, "1");
      return true;
    }
  } catch {
    // sessionStorage indisponible (navigation privée stricte) : on
    // retombe sur le seul référent, sans persistance.
    return document.referrer.startsWith("android-app://");
  }
  return false;
}
