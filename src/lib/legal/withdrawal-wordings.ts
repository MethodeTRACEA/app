// ===================================================================
// TRACÉA — Wordings versionnés du renoncement au droit de rétractation
// ===================================================================
// Lu par :
//   - src/app/app/subscribe/page.tsx (affichage de la case à cocher)
//   - src/app/api/subscribe/route.ts (snapshot inséré dans
//     public.withdrawal_consents.wording_snapshot)
//
// Toute évolution du texte exige :
//   1. ajouter une nouvelle entrée vN+1 (NE PAS modifier l'existante) ;
//   2. mettre à jour WITHDRAWAL_WORDING_CURRENT_VERSION ;
//   3. valider juridiquement avant déploiement.
//
// v1 = wording actuellement affiché en production, recopié à
// l'identique depuis subscribe/page.tsx (ne pas modifier).
// ===================================================================

export const WITHDRAWAL_WORDINGS = {
  v1: "Je demande l'accès immédiat à TRACÉA Premium et je reconnais que mon droit de rétractation peut être perdu une fois l'accès commencé, dans les conditions prévues par les CGU.",
} as const;

export type WithdrawalWordingVersion = keyof typeof WITHDRAWAL_WORDINGS;

export const WITHDRAWAL_WORDING_CURRENT_VERSION: WithdrawalWordingVersion = "v1";

export function getCurrentWithdrawalWording(): {
  version: WithdrawalWordingVersion;
  text: string;
} {
  return {
    version: WITHDRAWAL_WORDING_CURRENT_VERSION,
    text: WITHDRAWAL_WORDINGS[WITHDRAWAL_WORDING_CURRENT_VERSION],
  };
}
