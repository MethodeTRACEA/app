// ===================================================================
// TRACÉA — Wordings versionnés du consentement RGPD art. 9
// ===================================================================
// 3 cases du ConsentGate (data perso / données sensibles / stockage).
//
// Lu par :
//   - src/components/ConsentGate.tsx (affichage label + description)
//   - src/app/api/consent/route.ts (snapshot inséré dans
//     public.consent_logs.wording_snapshot, format
//     "<label>\n\n<description>")
//
// Évolution du texte → nouvelle version vN+1, NE PAS modifier
// l'existante (preuve juridique versionnée).
//
// v1 = wording actuellement affiché en production, label et
// description recopiés à l'identique depuis ConsentGate.tsx
// (ne pas modifier).
// ===================================================================

export type RgpdConsentType =
  | "data_processing"
  | "sensitive_data"
  | "local_storage_usage";

interface RgpdConsentCopy {
  label: string;
  description: string;
}

export const RGPD_WORDINGS = {
  v1: {
    data_processing: {
      label: "J'accepte le traitement de mes données personnelles",
      description:
        "Prénom/pseudonyme, données de session et de progression, dans le cadre de l'utilisation de l'application TRACEA.",
    },
    sensitive_data: {
      label:
        "J'accepte le traitement de mes données émotionnelles sensibles",
      description:
        "Descriptions d'émotions, ressentis corporels, vérités intérieures, données relevant de l'article 9 du RGPD (données de santé psychologique).",
    },
    local_storage_usage: {
      label: "J'accepte le stockage sécurisé de mes données",
      description:
        "Mes données de session seront conservées dans une base de données sécurisée hébergée en Union européenne (Francfort, Allemagne) via Supabase.",
    },
  },
  // v2 (chantier 35) : identique à v1, sauf TRACEA → TRACÉA dans la
  // description data_processing. Seule différence textuelle entre les
  // deux versions. v1 reste IMMUABLE — preuve juridique versionnée.
  v2: {
    data_processing: {
      label: "J'accepte le traitement de mes données personnelles",
      description:
        "Prénom/pseudonyme, données de session et de progression, dans le cadre de l'utilisation de l'application TRACÉA.",
    },
    sensitive_data: {
      label:
        "J'accepte le traitement de mes données émotionnelles sensibles",
      description:
        "Descriptions d'émotions, ressentis corporels, vérités intérieures, données relevant de l'article 9 du RGPD (données de santé psychologique).",
    },
    local_storage_usage: {
      label: "J'accepte le stockage sécurisé de mes données",
      description:
        "Mes données de session seront conservées dans une base de données sécurisée hébergée en Union européenne (Francfort, Allemagne) via Supabase.",
    },
  },
} as const satisfies Record<string, Record<RgpdConsentType, RgpdConsentCopy>>;

export type RgpdWordingVersion = keyof typeof RGPD_WORDINGS;

export const RGPD_WORDING_CURRENT_VERSION: RgpdWordingVersion = "v2";

export function getCurrentRgpdWordings(): {
  version: RgpdWordingVersion;
  wordings: Record<RgpdConsentType, RgpdConsentCopy>;
} {
  return {
    version: RGPD_WORDING_CURRENT_VERSION,
    wordings: RGPD_WORDINGS[RGPD_WORDING_CURRENT_VERSION],
  };
}

/**
 * Snapshot textuel pour persistance DB.
 * Format : "<label>\n\n<description>" — pur texte, pas de HTML.
 */
export function buildRgpdWordingSnapshot(
  version: RgpdWordingVersion,
  consentType: RgpdConsentType
): string {
  const copy = RGPD_WORDINGS[version][consentType];
  return `${copy.label}\n\n${copy.description}`;
}
