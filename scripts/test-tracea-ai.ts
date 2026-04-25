/**
 * scripts/test-tracea-ai.ts
 *
 * Test automatique IA TRACÉA — 30 cas de test
 *
 * Usage :
 *   npx tsx scripts/test-tracea-ai.ts
 *
 * Génère : docs/AI_TEST_REPORT.md
 *
 * Ne modifie pas la logique IA (applyTraceaV3, route API, system prompt, Supabase, auth).
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

// ── Charger .env.local avant tout appel API ──────────────────────────────────
// (doit s'exécuter avant la création du client Anthropic)

function loadEnvLocal(): void {
  const candidates = [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(__dirname, "../.env.local"),
  ];
  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf-8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#") || !t.includes("=")) continue;
      const idx = t.indexOf("=");
      const key = t.slice(0, idx).trim();
      let val = t.slice(idx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
    console.log(`[ENV] Chargé : ${p}`);
    return;
  }
  console.warn("[ENV] .env.local introuvable — ANTHROPIC_API_KEY doit être définie manuellement");
}

loadEnvLocal();

// ── Import des modules IA (chemins relatifs — pas d'alias @/ hors Next.js) ──
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { applyTraceaV3 } = require("../src/lib/ai/applyTraceaV3") as {
  applyTraceaV3: (text: string, emotion: string) => string;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { MIRROR_SYSTEM_PROMPT } = require("../src/lib/ai/traceaMirrorPrompt") as {
  MIRROR_SYSTEM_PROMPT: string;
};

// ── Types ────────────────────────────────────────────────────────────────────

interface TestCase {
  id: number;
  category: string;
  situation: string;
  emotion: string;
  besoin: string;
  action: string;
  /** true = action est une intention future (pas encore accomplie) */
  actionIsIntention: boolean;
}

interface RuleFailure {
  rule: string;
  detail: string;
}

interface TestResult {
  testCase: TestCase;
  rawResponse: string;
  finalResponse: string;
  passed: boolean;
  failures: RuleFailure[];
  error?: string;
  durationMs: number;
}

// ── 30 cas de test ───────────────────────────────────────────────────────────

const TEST_CASES: TestCase[] = [
  // ── colère (2) ──────────────────────────────────────────────────────────
  {
    id: 1,
    category: "colère",
    situation: "Mon chef a annulé ma présentation au dernier moment devant toute l'équipe",
    emotion: "colère",
    besoin: "être respecté dans mon travail",
    action: "en parler directement avec lui demain",
    actionIsIntention: true,
  },
  {
    id: 2,
    category: "colère",
    situation: "J'ai découvert que mon colocataire avait utilisé mes affaires sans demander",
    emotion: "colère",
    besoin: "que mon espace personnel soit respecté",
    action: "poser mes limites clairement",
    actionIsIntention: true,
  },

  // ── tristesse (2) ────────────────────────────────────────────────────────
  {
    id: 3,
    category: "tristesse",
    situation: "Mon meilleur ami a déménagé à l'autre bout de la France ce week-end",
    emotion: "tristesse",
    besoin: "maintenir ce lien malgré la distance",
    action: "lui envoyer un message ce soir",
    actionIsIntention: true,
  },
  {
    id: 4,
    category: "tristesse",
    situation: "J'ai raté une opportunité professionnelle importante sur laquelle je comptais vraiment",
    emotion: "tristesse",
    besoin: "me reconnecter à ce qui compte vraiment pour moi",
    action: "prendre du temps pour moi ce week-end",
    actionIsIntention: true,
  },

  // ── peur (2) ─────────────────────────────────────────────────────────────
  {
    id: 5,
    category: "peur",
    situation: "Je dois donner une conférence devant 200 personnes la semaine prochaine",
    emotion: "peur",
    besoin: "me sentir suffisamment préparé",
    action: "faire une répétition avec un ami de confiance",
    actionIsIntention: true,
  },
  {
    id: 6,
    category: "peur",
    situation: "J'ai reçu des résultats médicaux inquiétants à discuter avec mon médecin",
    emotion: "peur",
    besoin: "comprendre ce qui se passe vraiment",
    action: "appeler le cabinet médical ce matin",
    actionIsIntention: true,
  },

  // ── honte (2) ────────────────────────────────────────────────────────────
  {
    id: 7,
    category: "honte",
    situation: "J'ai dit quelque chose de vraiment blessant à ma mère lors d'une dispute",
    emotion: "honte",
    besoin: "réparer ce lien important",
    action: "m'excuser sincèrement dès ce soir",
    actionIsIntention: true,
  },
  {
    id: 8,
    category: "honte",
    situation: "J'ai fait une erreur visible devant toute mon équipe lors de la réunion de direction",
    emotion: "honte",
    besoin: "ne pas me laisser écraser par le regard des autres",
    action: "m'accorder de la compassion",
    actionIsIntention: true,
  },

  // ── culpabilité (2) ──────────────────────────────────────────────────────
  {
    id: 9,
    category: "culpabilité",
    situation: "J'ai complètement oublié l'anniversaire de ma sœur cette année",
    emotion: "culpabilité",
    besoin: "réparer ce que j'ai négligé",
    action: "l'appeler aujourd'hui et lui offrir quelque chose de sincère",
    actionIsIntention: true,
  },
  {
    id: 10,
    category: "culpabilité",
    situation: "J'ai accepté une mission que je savais ne pas pouvoir honorer dans les délais",
    emotion: "culpabilité",
    besoin: "agir en accord avec mes valeurs",
    action: "être honnête avec mon manager sur mes limites réelles",
    actionIsIntention: true,
  },

  // ── confusion (2) ────────────────────────────────────────────────────────
  {
    id: 11,
    category: "confusion",
    situation: "Je reçois des messages contradictoires de mon manager concernant les priorités du projet",
    emotion: "confusion",
    besoin: "avoir une direction claire",
    action: "demander une réunion de clarification cette semaine",
    actionIsIntention: true,
  },
  {
    id: 12,
    category: "confusion",
    situation: "Je ne sais plus si je veux vraiment rester dans cette relation",
    emotion: "confusion",
    besoin: "du temps et de l'espace pour y voir plus clair",
    action: "prendre quelques jours sans pression pour moi",
    actionIsIntention: true,
  },

  // ── frustration (2) ──────────────────────────────────────────────────────
  {
    id: 13,
    category: "frustration",
    situation: "Le même problème technique revient chaque semaine depuis deux mois malgré mes signalements",
    emotion: "frustration",
    besoin: "être entendu et que les choses avancent concrètement",
    action: "escalader directement au niveau supérieur",
    actionIsIntention: true,
  },
  {
    id: 14,
    category: "frustration",
    situation: "Je prépare ce projet depuis des mois et il est constamment repoussé sans explication",
    emotion: "frustration",
    besoin: "que mon travail soit reconnu à sa juste valeur",
    action: "exprimer clairement ce que cette situation me coûte",
    actionIsIntention: true,
  },

  // ── solitude (2) ─────────────────────────────────────────────────────────
  {
    id: 15,
    category: "solitude",
    situation: "Je suis dans une nouvelle ville depuis 6 mois et je n'ai toujours pas de vrais amis",
    emotion: "solitude",
    besoin: "créer des liens authentiques",
    action: "m'inscrire à une activité de groupe cette semaine",
    actionIsIntention: true,
  },
  {
    id: 16,
    category: "solitude",
    situation: "Même entouré de mes proches lors des fêtes, je me sens profondément incompris",
    emotion: "solitude",
    besoin: "être vraiment vu et entendu par quelqu'un",
    action: "avoir une vraie conversation avec une personne de confiance",
    actionIsIntention: true,
  },

  // ── besoin flou (2) ──────────────────────────────────────────────────────
  {
    id: 17,
    category: "besoin flou",
    situation: "Quelque chose ne va pas depuis quelques jours mais je n'arrive pas à mettre le doigt dessus",
    emotion: "tristesse",
    besoin: "je ne sais pas vraiment ce dont j'ai besoin",
    action: "m'asseoir avec ce sentiment sans chercher à le résoudre tout de suite",
    actionIsIntention: true,
  },
  {
    id: 18,
    category: "besoin flou",
    situation: "Je me sens épuisé sans raison apparente depuis une semaine",
    emotion: "confusion",
    besoin: "",
    action: "me reposer et voir ce qui émerge",
    actionIsIntention: true,
  },

  // ── action ambiguë (2) ───────────────────────────────────────────────────
  {
    id: 19,
    category: "action ambiguë",
    situation: "Ma relation avec mon collègue est tendue depuis une semaine sans raison claire",
    emotion: "frustration",
    besoin: "clarifier la situation",
    action: "lui parler directement ou attendre que ça se tasse",
    actionIsIntention: true,
  },
  {
    id: 20,
    category: "action ambiguë",
    situation: "Je dois choisir entre deux offres d'emploi très différentes avant vendredi",
    emotion: "confusion",
    besoin: "prendre la bonne décision pour moi",
    action: "faire une liste de critères ou en parler à quelqu'un de confiance",
    actionIsIntention: true,
  },

  // ── action au futur (2) ──────────────────────────────────────────────────
  {
    id: 21,
    category: "action au futur",
    situation: "J'ai eu une dispute avec mon frère ce matin avant le travail",
    emotion: "colère",
    besoin: "qu'on puisse se parler vraiment sans s'agresser",
    action: "je vais l'appeler demain soir quand je serai plus calme",
    actionIsIntention: true,
  },
  {
    id: 22,
    category: "action au futur",
    situation: "Je traverse une période de transition professionnelle difficile et incertaine",
    emotion: "peur",
    besoin: "trouver une direction qui correspond à qui je suis",
    action: "je vais contacter un coach professionnel la semaine prochaine",
    actionIsIntention: true,
  },

  // ── action formulée avec "je" (2) ────────────────────────────────────────
  {
    id: 23,
    category: "action formulée avec je",
    situation: "Mon ami m'a exclu d'un projet commun sans aucune explication",
    emotion: "tristesse",
    besoin: "comprendre ce qui s'est passé entre nous",
    action: "je lui envoie un message pour qu'on se retrouve",
    actionIsIntention: true,
  },
  {
    id: 24,
    category: "action formulée avec je",
    situation: "Je suis épuisé par la surcharge de travail accumulée ce mois-ci",
    emotion: "frustration",
    besoin: "me ressourcer vraiment",
    action: "je prends une journée pour moi sans obligation",
    actionIsIntention: true,
  },

  // ── situation très courte (2) ────────────────────────────────────────────
  {
    id: 25,
    category: "situation très courte",
    situation: "Dispute.",
    emotion: "colère",
    besoin: "être entendu",
    action: "en parler",
    actionIsIntention: true,
  },
  {
    id: 26,
    category: "situation très courte",
    situation: "Seul.",
    emotion: "tristesse",
    besoin: "connexion",
    action: "appeler quelqu'un",
    actionIsIntention: true,
  },

  // ── situation longue (2) ─────────────────────────────────────────────────
  {
    id: 27,
    category: "situation longue",
    situation:
      "Cela fait maintenant trois mois que je gère un projet très complexe impliquant plusieurs équipes, des délais impossibles, des demandes contradictoires de la direction et un budget réduit de moitié en cours de route. Chaque semaine de nouveaux obstacles surgissent. J'ai l'impression de nager à contre-courant en permanence, de devoir justifier chaque décision et de n'avoir aucun soutien réel. Ce matin on m'a encore demandé de faire plus avec moins.",
    emotion: "frustration",
    besoin: "être reconnu pour ce que j'accomplis réellement",
    action: "demander un entretien formel avec ma direction cette semaine",
    actionIsIntention: true,
  },
  {
    id: 28,
    category: "situation longue",
    situation:
      "Ma relation de couple traverse une phase très difficile depuis un an. Nous vivons ensemble mais nous nous éloignons de plus en plus. Chaque tentative de communication finit en dispute. Les silences sont devenus la norme. Je ne dors plus bien. Je pense parfois à la séparation mais j'ai aussi peur de faire une erreur irréparable. Nous partageons un appartement, des amis communs, des projets. Je ne sais plus vraiment ce que je veux.",
    emotion: "confusion",
    besoin: "retrouver de la clarté sur ce que je veux vraiment",
    action: "consulter un thérapeute de couple pour y voir plus clair",
    actionIsIntention: true,
  },

  // ── contradiction émotion/besoin (2) ─────────────────────────────────────
  {
    id: 29,
    category: "contradiction émotion/besoin",
    situation: "J'ai enfin reçu la promotion que je demandais depuis deux ans",
    emotion: "peur",
    besoin: "prouver que je mérite cette promotion",
    action: "dresser une liste de mes forces et de mes premiers objectifs",
    actionIsIntention: true,
  },
  {
    id: 30,
    category: "contradiction émotion/besoin",
    situation: "La personne que j'aime m'a dit pour la première fois qu'elle m'aimait",
    emotion: "tristesse",
    besoin: "m'assurer que c'est réel et que ça va durer",
    action: "lui dire à mon tour ce que je ressens vraiment",
    actionIsIntention: true,
  },
];

// ── Directive de ton (réplique de route.ts — non exportée) ───────────────────

function getToneDirective(emotion: string): string {
  const e = emotion.toLowerCase().trim();

  if (e === "colère") {
    return `Signature émotionnelle : COLÈRE
Ton : direct, ancré.
Rythme : court, peu d'espace entre les phrases.
Micro-phrase optionnelle (1 seule, si pertinent) : "Ça pousse." ou "Il y a quelque chose."
Validation finale — choisir UNE parmi : "Tu peux t'écouter." / "Tu peux t'appuyer là-dessus."`;
  }
  if (e === "tristesse") {
    return `Signature émotionnelle : TRISTESSE
Ton : doux, lent.
Rythme : avec respiration — sauts de ligne possibles.
Micro-phrase optionnelle (1 seule, si pertinent) : "C'est lourd." ou "Ça touche."
Validation finale — choisir UNE parmi : "Tu peux prendre ce temps." / "Ça a sa place."`;
  }
  if (e === "peur") {
    return `Signature émotionnelle : PEUR
Ton : stable, sécurisant.
Rythme : régulier.
Micro-phrase optionnelle (1 seule, si pertinent) : "Il y a une tension." ou "Ton corps réagit."
Validation finale — choisir UNE parmi : "Tu peux ralentir." / "Tu peux rester là."`;
  }
  if (e === "confusion") {
    return `Signature émotionnelle : CONFUSION
Ton : ouvert, non défini.
Rythme : légèrement flottant.
Micro-phrase optionnelle (1 seule, si pertinent) : "C'est flou." ou "Quelque chose échappe."
Validation finale — choisir UNE parmi : "Ça peut rester comme ça." / "Tu n'as pas besoin de savoir tout de suite."`;
  }
  if (e === "honte") {
    return `Signature émotionnelle : HONTE
Ton : très délicat, minimal.
Rythme : lent, épuré.
Micro-phrase optionnelle (1 seule, si pertinent) : "Ça se referme." ou "C'est difficile à montrer."
Validation finale — choisir UNE parmi : "Tu peux y aller doucement." / "Tu peux rester avec toi."`;
  }
  if (e === "frustration") {
    return `Signature émotionnelle : FRUSTRATION
Ton : lucide, posé.
Rythme : légèrement haché.
Micro-phrase optionnelle (1 seule, si pertinent) : "Ça bloque." ou "Quelque chose résiste."
Validation finale — choisir UNE parmi : "Tu peux le voir." / "C'est là."`;
  }

  return `Ton attendu pour cette réponse : neutre, humain, direct.
Miroir simple. Pas de surcharge émotionnelle.
Validation finale — choisir UNE parmi : "Ça a du sens." / "Ça compte."`;
}

// ── Construction du message utilisateur (miroir de route.ts) ─────────────────

function buildUserMessage(tc: TestCase): string {
  const toneDirective = getToneDirective(tc.emotion);
  const besoin = tc.besoin.trim();

  return `Voici ce que la personne a vécu :

Situation : "${tc.situation}"
Émotion : "${tc.emotion}"${besoin ? `\nBesoin : "${besoin}"` : ""}
Action choisie (à reprendre MOT POUR MOT) : "${tc.action}"

---

${toneDirective}

---

Écris 2 à 4 phrases maximum, dans cet ordre :
1. la situation
2. l'émotion${besoin ? ` — tu peux intégrer le besoin dans cette phrase si c'est naturel, sans l'ajouter séparément` : ""}
3. l'intention choisie — mots EXACTS — formulée comme direction, pas comme acte accompli
   (ex : "Ce qui te semble juste, c'est [action mot pour mot].")
4. une validation courte

Si un champ est vide, ne pas le mentionner. Pas de titres. Pas de séparation. Texte brut uniquement.`;
}

// ── Vérification des règles ───────────────────────────────────────────────────

const FORBIDDEN_PHRASES = [
  "tu devrais",
  "il faut",
  "essaie de",
  "parce que",
  "c'est normal",
  "tout va aller bien",
];

// Mots émotionnels que l'IA ne devrait pas inventer (absents des données utilisateur)
const INVENTED_EMOTION_WORDS = [
  "triste",
  "joyeux",
  "heureux",
  "anxieux",
  "angoissé",
  "déprimé",
  "soulagé",
  "fier",
  "gêné",
  "jaloux",
  "envieux",
  "déçu",
  "surpris",
  "choqué",
  "nostalgique",
  "apaisé",
];

function countSentences(text: string): number {
  // Chaque bloc séparé par \n\n est une unité — on compte aussi les points finaux
  const normalized = text.replace(/\n+/g, " ").trim();
  const matches = normalized.match(/[.!?](?:\s|$)/g);
  return matches ? matches.length : normalized ? 1 : 0;
}

function checkRules(tc: TestCase, response: string): RuleFailure[] {
  const failures: RuleFailure[] = [];
  const lower = response.toLowerCase();
  const inputText =
    `${tc.situation} ${tc.emotion} ${tc.besoin} ${tc.action}`.toLowerCase();

  // Règle 1 — Phrases interdites
  for (const phrase of FORBIDDEN_PHRASES) {
    if (lower.includes(phrase)) {
      failures.push({
        rule: "phrases_interdites",
        detail: `Contient "${phrase}"`,
      });
    }
  }

  // Règle 2 — Première personne dans la réponse finale
  if (lower.includes("je ") || lower.includes("j'")) {
    failures.push({
      rule: "premiere_personne",
      detail: 'Contient "je" ou "j\'" dans la réponse finale',
    });
  }

  // Règle 3 — Plus de 4 phrases
  const sentenceCount = countSentences(response);
  if (sentenceCount > 4) {
    failures.push({
      rule: "max_4_phrases",
      detail: `${sentenceCount} phrases détectées (max autorisé : 4)`,
    });
  }

  // Règle 4 — Action reformulée comme acte accompli alors que c'est une intention
  if (tc.actionIsIntention) {
    // "tu as fait" est un faux positif si la SITUATION elle-même contient "j'ai fait"
    // (le miroir le traduit légitimement en "tu as fait" pour décrire la situation)
    const situationHasFait = /\bj'ai fait\b/i.test(tc.situation);
    if (!situationHasFait && /\btu as fait\b/i.test(response)) {
      failures.push({
        rule: "action_reformulee_passee",
        detail: '"tu as fait" détecté alors que l\'action est une intention future',
      });
    }
    // Détecter "tu as [verbe de l'action]" — extrait le premier verbe de l'action
    const actionVerb = tc.action
      .replace(/^(je\s+(vais\s+)?|j')/i, "")
      .split(/\s+/)[0]
      .toLowerCase()
      .replace(/['']/g, "'");
    if (
      actionVerb.length > 2 &&
      new RegExp(`\\btu as ${actionVerb}\\b`, "i").test(response)
    ) {
      failures.push({
        rule: "action_reformulee_passee",
        detail: `Action future détectée au passé composé : "tu as ${actionVerb}"`,
      });
    }
  }

  // Règle 5 — Émotion inventée (mot émotionnel absent de toutes les données utilisateur)
  for (const word of INVENTED_EMOTION_WORDS) {
    if (lower.includes(word) && !inputText.includes(word)) {
      failures.push({
        rule: "emotion_inventee",
        detail: `Mot émotionnel absent des données utilisateur : "${word}"`,
      });
    }
  }

  // Règle 6 — Besoin inventé ("besoin" ou "il te faut" non dérivé des inputs)
  if (
    lower.includes("ton besoin") &&
    !inputText.includes("besoin")
  ) {
    failures.push({
      rule: "besoin_invente",
      detail: '"ton besoin" mentionné alors que le champ besoin est vide ou absent',
    });
  }

  return failures;
}

// ── Appel à l'API Anthropic ───────────────────────────────────────────────────

async function callAI(
  tc: TestCase
): Promise<{ rawText: string; finalText: string; durationMs: number }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY manquante — vérifiez votre .env.local ou définissez la variable d'environnement"
    );
  }

  const client = new Anthropic({ apiKey });
  const userMessage = buildUserMessage(tc);

  const start = Date.now();
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    temperature: 0.5,
    // Pas de cache_control ici — réservé à la production pour les économies de coût
    system: MIRROR_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });
  const durationMs = Date.now() - start;

  const rawText =
    message.content[0].type === "text" ? message.content[0].text.trim() : "";
  const finalText = applyTraceaV3(rawText, tc.emotion);

  return { rawText, finalText, durationMs };
}

// ── Génération du rapport Markdown ───────────────────────────────────────────

function generateReport(results: TestResult[], totalDurationMs: number): string {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const errors = results.filter((r) => r.error).length;

  const now = new Date()
    .toISOString()
    .replace("T", " ")
    .slice(0, 19)
    .concat(" UTC");

  const lines: string[] = [];

  lines.push(`# Rapport de test IA TRACÉA`);
  lines.push(``);
  lines.push(`**Généré le :** ${now}`);
  lines.push(`**Durée totale :** ${(totalDurationMs / 1000).toFixed(1)}s`);
  lines.push(`**Modèle :** claude-sonnet-4-6`);
  lines.push(`**Post-traitement :** applyTraceaV3`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`## Résumé`);
  lines.push(``);
  lines.push(`| Métrique | Valeur |`);
  lines.push(`|----------|--------|`);
  lines.push(`| Cas testés | ${results.length} |`);
  lines.push(`| ✅ Réussites | ${passed} |`);
  lines.push(`| ❌ Échecs | ${failed} |`);
  lines.push(`| ⚠️ Erreurs API | ${errors} |`);
  lines.push(
    `| Taux de réussite | ${((passed / results.length) * 100).toFixed(0)}% |`
  );
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`## Résultats par catégorie`);
  lines.push(``);
  lines.push(`| # | Catégorie | Statut | Règles cassées |`);
  lines.push(`|---|-----------|--------|----------------|`);
  for (const r of results) {
    const status = r.error
      ? "⚠️ ERREUR"
      : r.passed
      ? "✅ PASS"
      : "❌ FAIL";
    const rules = r.failures.map((f) => f.rule).join(", ") || "—";
    lines.push(`| ${r.testCase.id} | ${r.testCase.category} | ${status} | ${rules} |`);
  }
  lines.push(``);

  // ── Détail des cas échoués ─────────────────────────────────────────────
  const failedResults = results.filter((r) => !r.passed);

  lines.push(`---`);
  lines.push(``);

  if (failedResults.length === 0) {
    lines.push(`## ✅ Tous les 30 cas ont réussi`);
    lines.push(``);
    lines.push(
      `L'IA TRACÉA respecte toutes les règles de robustesse sur cette suite de tests.`
    );
    lines.push(``);
  } else {
    lines.push(`## Détail des cas échoués (${failedResults.length})`);
    lines.push(``);

    for (const r of failedResults) {
      const tc = r.testCase;
      lines.push(`### Cas ${tc.id} — ${tc.category}`);
      lines.push(``);
      lines.push(`**Situation :** ${tc.situation}`);
      lines.push(``);
      lines.push(`**Émotion :** \`${tc.emotion}\``);
      lines.push(``);
      lines.push(`**Besoin :** ${tc.besoin || "_(vide)_"}`);
      lines.push(``);
      lines.push(`**Action :** ${tc.action}`);
      lines.push(``);

      if (r.error) {
        lines.push(`**Erreur API :**`);
        lines.push(``);
        lines.push(`\`\`\``);
        lines.push(r.error);
        lines.push(`\`\`\``);
      } else {
        lines.push(`**Réponse IA (après applyTraceaV3) :**`);
        lines.push(``);
        lines.push(`> ${r.finalResponse.replace(/\n/g, "\n> ")}`);
        lines.push(``);
        lines.push(`**Règles cassées :**`);
        lines.push(``);
        for (const f of r.failures) {
          lines.push(`- ❌ \`${f.rule}\` : ${f.detail}`);
        }
      }

      lines.push(``);
      lines.push(`---`);
      lines.push(``);
    }
  }

  // ── Détail complet (tous les cas, repliables) ──────────────────────────
  lines.push(`## Détail complet — tous les cas`);
  lines.push(``);

  for (const r of results) {
    const tc = r.testCase;
    const status = r.error
      ? "⚠️ ERREUR"
      : r.passed
      ? "✅ PASS"
      : "❌ FAIL";

    lines.push(`<details>`);
    lines.push(
      `<summary><strong>Cas ${tc.id} — ${tc.category}</strong> &nbsp; ${status}</summary>`
    );
    lines.push(``);
    lines.push(`**Situation :** ${tc.situation}`);
    lines.push(``);
    lines.push(`**Émotion :** \`${tc.emotion}\``);
    lines.push(``);
    lines.push(`**Besoin :** ${tc.besoin || "_(vide)_"}`);
    lines.push(``);
    lines.push(`**Action :** ${tc.action}`);
    lines.push(``);

    if (r.error) {
      lines.push(`**Erreur :** ${r.error}`);
    } else {
      lines.push(`**Durée :** ${r.durationMs}ms`);
      lines.push(``);
      lines.push(`**Réponse brute (avant applyTraceaV3) :**`);
      lines.push(``);
      lines.push(`\`\`\``);
      lines.push(r.rawResponse);
      lines.push(`\`\`\``);
      lines.push(``);
      lines.push(`**Réponse finale (après applyTraceaV3) :**`);
      lines.push(``);
      lines.push(`> ${r.finalResponse.replace(/\n/g, "\n> ")}`);
      lines.push(``);

      if (r.failures.length > 0) {
        lines.push(`**Règles cassées :**`);
        lines.push(``);
        for (const f of r.failures) {
          lines.push(`- ❌ \`${f.rule}\` : ${f.detail}`);
        }
      } else {
        lines.push(`**Règles :** toutes respectées ✅`);
      }
    }

    lines.push(``);
    lines.push(`</details>`);
    lines.push(``);
  }

  // ── Référence des règles ───────────────────────────────────────────────
  lines.push(`---`);
  lines.push(``);
  lines.push(`## Règles vérifiées automatiquement`);
  lines.push(``);
  lines.push(`| Règle | Description | Déclenchement |`);
  lines.push(`|-------|-------------|---------------|`);
  lines.push(
    `| \`phrases_interdites\` | Phrases jamais acceptables dans une réponse miroir | "tu devrais", "il faut", "essaie de", "parce que", "c'est normal", "tout va aller bien" |`
  );
  lines.push(
    `| \`premiere_personne\` | L'IA ne parle jamais d'elle-même | "je " ou "j'" détecté dans la réponse |`
  );
  lines.push(
    `| \`max_4_phrases\` | Limite de longueur | Plus de 4 phrases détectées |`
  );
  lines.push(
    `| \`action_reformulee_passee\` | L'intention n'est pas transformée en acte accompli | "tu as fait" ou "tu as [verbe action]" avec actionIsIntention=true |`
  );
  lines.push(
    `| \`emotion_inventee\` | Pas de vocabulaire émotionnel hors données utilisateur | Mot émotionnel absent de situation+émotion+besoin+action |`
  );
  lines.push(
    `| \`besoin_invente\` | "ton besoin" non introduit si champ besoin vide | "ton besoin" présent avec besoin="" |`
  );
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(
    `*Rapport généré par \`scripts/test-tracea-ai.ts\`. Ne pas modifier manuellement.*`
  );
  lines.push(``);

  return lines.join("\n");
}

// ── Point d'entrée ────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("═══════════════════════════════════════════════════");
  console.log("  Test automatique IA TRACÉA — 30 cas             ");
  console.log("═══════════════════════════════════════════════════");
  console.log();

  const results: TestResult[] = [];
  const totalStart = Date.now();

  for (const tc of TEST_CASES) {
    const label = `[${String(tc.id).padStart(2, "0")}/30] ${tc.category}`;
    process.stdout.write(`${label.padEnd(45)} `);

    try {
      const { rawText, finalText, durationMs } = await callAI(tc);
      const failures = checkRules(tc, finalText);
      const passed = failures.length === 0;

      results.push({
        testCase: tc,
        rawResponse: rawText,
        finalResponse: finalText,
        passed,
        failures,
        durationMs,
      });

      if (passed) {
        console.log(`✅  (${durationMs}ms)`);
      } else {
        const ruleNames = failures.map((f) => f.rule).join(", ");
        console.log(`❌  (${durationMs}ms) → ${ruleNames}`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      results.push({
        testCase: tc,
        rawResponse: "",
        finalResponse: "",
        passed: false,
        failures: [{ rule: "api_error", detail: errorMsg }],
        error: errorMsg,
        durationMs: 0,
      });
      console.log(`⚠️  ERREUR — ${errorMsg.slice(0, 60)}`);
    }

    // Pause entre appels pour éviter le rate limiting
    if (tc.id < TEST_CASES.length) {
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }

  const totalDurationMs = Date.now() - totalStart;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;

  console.log();
  console.log("═══════════════════════════════════════════════════");
  console.log(
    `  Résultats : ${passed}/30 ✅  |  ${failed}/30 ❌`
  );
  console.log(`  Durée totale : ${(totalDurationMs / 1000).toFixed(1)}s`);
  console.log("═══════════════════════════════════════════════════");

  // Écriture du rapport
  const reportContent = generateReport(results, totalDurationMs);
  const reportPath = path.resolve(process.cwd(), "docs/AI_TEST_REPORT.md");
  fs.writeFileSync(reportPath, reportContent, "utf-8");

  console.log();
  console.log(`📄 Rapport généré : ${reportPath}`);
  console.log();

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
