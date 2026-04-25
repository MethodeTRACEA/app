/**
 * scripts/test-tracea-human.ts
 *
 * Évaluation qualitative (ressenti humain) des réponses IA TRACÉA
 * par un juge LLM — 30 cas issus de la suite de tests technique.
 *
 * Usage :
 *   npx tsx --tsconfig tsconfig.scripts.json scripts/test-tracea-human.ts
 *
 * Génère : docs/AI_HUMAN_REPORT.md
 *
 * Ne modifie pas l'IA, les prompts, ni la logique produit.
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

// ── Réutilisation des 30 cas et helpers depuis le test technique ─────────────
// loadEnvLocal() est appelé au niveau module dans test-tracea-ai.ts à l'import.
import { TestCase, TEST_CASES, buildUserMessage } from "./test-tracea-ai";

// ── Modules TRACÉA ────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { applyTraceaV3 } = require("../src/lib/ai/applyTraceaV3") as {
  applyTraceaV3: (text: string, emotion: string) => string;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { MIRROR_SYSTEM_PROMPT } = require("../src/lib/ai/traceaMirrorPrompt") as {
  MIRROR_SYSTEM_PROMPT: string;
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface DimensionScore {
  score: number;
  commentaire: string;
}

interface HumanEvaluation {
  justesse_emotionnelle: DimensionScore;
  impact: DimensionScore;
  lisibilite: DimensionScore;
  problemes: string[];
  score_global: number;
}

interface HumanTestResult {
  testCase: TestCase;
  traceaResponse: string;
  evaluation: HumanEvaluation | null;
  error?: string;
  durationMs: number;
}

// ── System prompt du juge ─────────────────────────────────────────────────────

const JUDGE_SYSTEM_PROMPT = `Tu es un expert en qualité de réponse miroir pour l'outil TRACÉA.

TRACÉA fonctionne comme un miroir humain :
- Il reflète uniquement ce que la personne a vécu, ressenti et choisi.
- Il ne conseille pas, n'interprète pas, n'ajoute pas de sens.
- Le ton s'adapte à l'émotion : colère (direct, ancré), tristesse (doux, lent), peur (stable, sécurisant), confusion (ouvert, flottant), honte (délicat, minimal), frustration (lucide, posé).
- La direction est formulée comme intention, pas acte accompli.
- Max 4 phrases.

Tu notes de 0 à 10 chaque dimension et identifies les problèmes présents.
Tu réponds UNIQUEMENT en JSON valide, sans markdown, sans texte avant ou après.`;

// ── Génération d'une réponse TRACÉA ──────────────────────────────────────────

async function generateTraceaResponse(
  tc: TestCase,
  client: Anthropic
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    temperature: 0.5,
    system: MIRROR_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserMessage(tc) }],
  });
  const raw =
    message.content[0].type === "text" ? message.content[0].text.trim() : "";
  return applyTraceaV3(raw, tc.emotion);
}

// ── Évaluation par le juge LLM ────────────────────────────────────────────────

async function evaluateResponse(
  tc: TestCase,
  traceaResponse: string,
  client: Anthropic
): Promise<HumanEvaluation> {
  const userMessage = `Situation : "${tc.situation}"
Émotion déclarée : "${tc.emotion}"
Besoin déclaré : "${tc.besoin || "(vide)"}"
Action envisagée : "${tc.action}"

Réponse TRACÉA générée :
"""
${traceaResponse}
"""

Évalue cette réponse sur 3 dimensions et identifie les problèmes.

A. JUSTESSE_ÉMOTIONNELLE (0–10) : ton adapté à l'émotion déclarée, émotion bien présente, aucune déformation du vécu.
B. IMPACT (0–10) : clarté, sentiment d'être reconnu, action ancrée comme direction (pas acte accompli).
C. LISIBILITÉ (0–10) : phrases courtes et fluides, pas de répétition visible, pas de lourdeur.

PROBLÈMES à signaler si présents (sinon tableau vide) :
- "répétition" : une phrase ou expression revient deux fois inutilement
- "perte_information" : situation ou émotion absente de la réponse
- "phrase_inutile" : une phrase n'apporte rien au miroir
- "ton_plat" : le ton manque de nuance émotionnelle
- "manque_précision" : action ou émotion est vague ou déformée

Réponds uniquement avec ce JSON (pas de markdown autour) :
{
  "justesse_emotionnelle": { "score": <0-10>, "commentaire": "<max 12 mots>" },
  "impact": { "score": <0-10>, "commentaire": "<max 12 mots>" },
  "lisibilite": { "score": <0-10>, "commentaire": "<max 12 mots>" },
  "problemes": [],
  "score_global": <moyenne des 3 scores, 1 décimale>
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    temperature: 0,
    system: JUDGE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const raw =
    message.content[0].type === "text" ? message.content[0].text.trim() : "{}";
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned) as HumanEvaluation;

  // Normalise problemes : le juge renvoie parfois des objets {type, description}
  // au lieu de strings simples — on extrait la clé "type" ou on stringify.
  parsed.problemes = (parsed.problemes ?? []).map((p: unknown) =>
    typeof p === "string" ? p : String((p as { type?: string }).type ?? p)
  );

  // Recalcul du score global pour garantir la cohérence
  parsed.score_global =
    Math.round(
      ((parsed.justesse_emotionnelle.score +
        parsed.impact.score +
        parsed.lisibilite.score) /
        3) *
        10
    ) / 10;

  return parsed;
}

// ── Utilitaires rapport ───────────────────────────────────────────────────────

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return (
    Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10
  );
}

function scoreBar(score: number): string {
  const filled = Math.round(score);
  return "█".repeat(filled) + "░".repeat(10 - filled) + `  ${score.toFixed(1)}`;
}

// ── Génération du rapport Markdown ───────────────────────────────────────────

function generateReport(
  results: HumanTestResult[],
  totalDurationMs: number
): string {
  const evaluated = results.filter((r) => r.evaluation !== null);
  const errors = results.filter((r) => r.error).length;

  const avg_je = avg(evaluated.map((r) => r.evaluation!.justesse_emotionnelle.score));
  const avg_im = avg(evaluated.map((r) => r.evaluation!.impact.score));
  const avg_li = avg(evaluated.map((r) => r.evaluation!.lisibilite.score));
  const avg_gl = avg(evaluated.map((r) => r.evaluation!.score_global));

  // Fréquence des problèmes
  const problemCounts: Record<string, number> = {};
  for (const r of evaluated) {
    for (const p of r.evaluation!.problemes) {
      problemCounts[p] = (problemCounts[p] || 0) + 1;
    }
  }
  const sortedProblems = Object.entries(problemCounts).sort(
    (a, b) => b[1] - a[1]
  );

  // Moyennes par émotion
  const byEmotion: Record<string, number[]> = {};
  for (const r of evaluated) {
    const e = r.testCase.emotion;
    if (!byEmotion[e]) byEmotion[e] = [];
    byEmotion[e].push(r.evaluation!.score_global);
  }

  // Cas faibles / excellents
  const weak = evaluated
    .filter((r) => r.evaluation!.score_global < 7)
    .sort((a, b) => a.evaluation!.score_global - b.evaluation!.score_global);
  const excellent = evaluated
    .filter((r) => r.evaluation!.score_global > 8.5)
    .sort((a, b) => b.evaluation!.score_global - a.evaluation!.score_global);

  const now =
    new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";

  const lines: string[] = [];

  // ── En-tête ───────────────────────────────────────────────────────────────
  lines.push(`# Rapport d'évaluation qualitative IA TRACÉA`);
  lines.push(``);
  lines.push(`**Généré le :** ${now}`);
  lines.push(`**Durée totale :** ${(totalDurationMs / 1000).toFixed(1)}s`);
  lines.push(`**Juge :** claude-sonnet-4-6 (température 0)`);
  lines.push(
    `**Cas évalués :** ${evaluated.length}/30${errors > 0 ? ` (${errors} erreurs)` : ""}`
  );
  lines.push(``);
  lines.push(`---`);
  lines.push(``);

  // ── Résumé global ─────────────────────────────────────────────────────────
  lines.push(`## Résumé global`);
  lines.push(``);
  lines.push(`| Dimension | Score moyen | Visualisation |`);
  lines.push(`|-----------|-------------|---------------|`);
  lines.push(`| Justesse émotionnelle | **${avg_je}/10** | \`${scoreBar(avg_je)}\` |`);
  lines.push(`| Impact | **${avg_im}/10** | \`${scoreBar(avg_im)}\` |`);
  lines.push(`| Lisibilité | **${avg_li}/10** | \`${scoreBar(avg_li)}\` |`);
  lines.push(`| **Score global** | **${avg_gl}/10** | \`${scoreBar(avg_gl)}\` |`);
  lines.push(``);

  // Distribution
  lines.push(`### Distribution des scores globaux`);
  lines.push(``);
  const buckets = [
    { label: "< 6", min: 0, max: 6 },
    { label: "6–7", min: 6, max: 7 },
    { label: "7–8", min: 7, max: 8 },
    { label: "8–9", min: 8, max: 9 },
    { label: "≥ 9", min: 9, max: 11 },
  ];
  const scores_gl = evaluated.map((r) => r.evaluation!.score_global);
  lines.push(`| Plage | Cas | Proportion |`);
  lines.push(`|-------|-----|------------|`);
  for (const b of buckets) {
    const count = scores_gl.filter((s) => s >= b.min && s < b.max).length;
    const pct = ((count / evaluated.length) * 100).toFixed(0);
    lines.push(`| ${b.label} | ${count} | ${"█".repeat(count)}${"░".repeat(Math.max(0, 10 - count))} ${pct}% |`);
  }
  lines.push(``);

  // Par émotion
  lines.push(`### Scores par émotion`);
  lines.push(``);
  lines.push(`| Émotion | Score moyen | Cas |`);
  lines.push(`|---------|-------------|-----|`);
  for (const [emotion, scores] of Object.entries(byEmotion).sort(
    (a, b) => avg(a[1]) - avg(b[1])
  )) {
    lines.push(`| ${emotion} | ${avg(scores)}/10 | ${scores.length} |`);
  }
  lines.push(``);

  // ── Problèmes détectés ────────────────────────────────────────────────────
  lines.push(`---`);
  lines.push(``);
  lines.push(`## Problèmes détectés`);
  lines.push(``);

  if (sortedProblems.length === 0) {
    lines.push(
      `Aucun problème récurrent détecté sur les ${evaluated.length} cas évalués. ✅`
    );
  } else {
    lines.push(`| Problème | Occurrences | Fréquence |`);
    lines.push(`|----------|-------------|-----------|`);
    for (const [problem, count] of sortedProblems) {
      const pct = ((count / evaluated.length) * 100).toFixed(0);
      lines.push(
        `| \`${problem}\` | ${count} | ${pct}% des cas |`
      );
    }
  }
  lines.push(``);

  // ── Cas faibles ───────────────────────────────────────────────────────────
  lines.push(`---`);
  lines.push(``);
  lines.push(`## Cas faibles — score < 7/10 (${weak.length})`);
  lines.push(``);

  if (weak.length === 0) {
    lines.push(`Aucun cas en dessous de 7/10. ✅`);
    lines.push(``);
  } else {
    for (const r of weak) {
      const tc = r.testCase;
      const ev = r.evaluation!;
      lines.push(
        `### Cas ${tc.id} — ${tc.category} | **${ev.score_global}/10**`
      );
      lines.push(``);
      lines.push(`**Situation :** ${tc.situation}`);
      lines.push(``);
      lines.push(`**Réponse TRACÉA :**`);
      lines.push(``);
      lines.push(`> ${r.traceaResponse.replace(/\n/g, "\n> ")}`);
      lines.push(``);
      lines.push(`| Dimension | Score | Commentaire |`);
      lines.push(`|-----------|-------|-------------|`);
      lines.push(
        `| Justesse émotionnelle | ${ev.justesse_emotionnelle.score}/10 | ${ev.justesse_emotionnelle.commentaire} |`
      );
      lines.push(
        `| Impact | ${ev.impact.score}/10 | ${ev.impact.commentaire} |`
      );
      lines.push(
        `| Lisibilité | ${ev.lisibilite.score}/10 | ${ev.lisibilite.commentaire} |`
      );
      if (ev.problemes.length > 0) {
        lines.push(``);
        lines.push(
          `**Problèmes :** ${ev.problemes.map((p) => `\`${p}\``).join(", ")}`
        );
      }
      lines.push(``);
      lines.push(`---`);
      lines.push(``);
    }
  }

  // ── Cas excellents ────────────────────────────────────────────────────────
  lines.push(`## Cas excellents — score > 8.5/10 (${excellent.length})`);
  lines.push(``);

  if (excellent.length === 0) {
    lines.push(`Aucun cas au-dessus de 8.5/10.`);
    lines.push(``);
  } else {
    for (const r of excellent) {
      const tc = r.testCase;
      const ev = r.evaluation!;
      lines.push(
        `### Cas ${tc.id} — ${tc.category} | **${ev.score_global}/10**`
      );
      lines.push(``);
      lines.push(`**Situation :** ${tc.situation}`);
      lines.push(``);
      lines.push(`**Réponse TRACÉA :**`);
      lines.push(``);
      lines.push(`> ${r.traceaResponse.replace(/\n/g, "\n> ")}`);
      lines.push(``);
      lines.push(`**Pourquoi ça fonctionne :**`);
      lines.push(``);
      lines.push(`- Justesse : ${ev.justesse_emotionnelle.commentaire}`);
      lines.push(`- Impact : ${ev.impact.commentaire}`);
      lines.push(`- Lisibilité : ${ev.lisibilite.commentaire}`);
      lines.push(``);
    }
  }

  // ── Tendances générales ───────────────────────────────────────────────────
  lines.push(`---`);
  lines.push(``);
  lines.push(`## Tendances générales`);
  lines.push(``);

  const dims = [
    { name: "Justesse émotionnelle", avg: avg_je },
    { name: "Impact", avg: avg_im },
    { name: "Lisibilité", avg: avg_li },
  ].sort((a, b) => b.avg - a.avg);

  lines.push(`### Ce qui fonctionne`);
  lines.push(``);
  for (const d of dims.filter((d) => d.avg >= 7.5)) {
    lines.push(`- **${d.name}** (${d.avg}/10)`);
  }
  const noProblem = evaluated.filter(
    (r) => r.evaluation!.problemes.length === 0
  ).length;
  if (noProblem > 0) {
    lines.push(
      `- **${noProblem} cas sans problème** (${((noProblem / evaluated.length) * 100).toFixed(0)}% des évaluations)`
    );
  }
  if (excellent.length > 0) {
    lines.push(
      `- **${excellent.length} cas excellents** (score > 8.5) — le modèle miroir fonctionne bien sur ces profils`
    );
  }
  lines.push(``);

  lines.push(`### Ce qui doit être amélioré`);
  lines.push(``);

  const weakEmotions = Object.entries(byEmotion)
    .map(([e, scores]) => ({ emotion: e, avg: avg(scores) }))
    .filter((e) => e.avg < 7.5)
    .sort((a, b) => a.avg - b.avg);

  if (weakEmotions.length > 0) {
    for (const e of weakEmotions) {
      lines.push(
        `- **${e.emotion}** : score moyen ${e.avg}/10 — catégorie à surveiller`
      );
    }
  } else {
    lines.push(`- Aucune émotion sous 7.5/10 de moyenne.`);
  }

  if (sortedProblems.length > 0) {
    const [topProblem, topCount] = sortedProblems[0];
    lines.push(
      `- Problème le plus fréquent : \`${topProblem}\` (${topCount} cas, ${((topCount / evaluated.length) * 100).toFixed(0)}%)`
    );
  }

  const weakestDim = dims[dims.length - 1];
  if (weakestDim.avg < 7.5) {
    lines.push(
      `- Dimension la plus faible : **${weakestDim.name}** (${weakestDim.avg}/10) — axe d'amélioration prioritaire`
    );
  }

  if (weak.length > 0) {
    lines.push(
      `- **${weak.length} cas faibles** — voir détail section "Cas faibles" pour les axes d'amélioration spécifiques`
    );
  }
  lines.push(``);

  // ── Détail complet ────────────────────────────────────────────────────────
  lines.push(`---`);
  lines.push(``);
  lines.push(`## Détail complet — tous les cas`);
  lines.push(``);

  for (const r of results) {
    const tc = r.testCase;
    const ev = r.evaluation;
    const scoreStr = ev ? `${ev.score_global}/10` : "⚠️ ERREUR";
    const indicator = !ev
      ? "⚠️"
      : ev.score_global > 8.5
      ? "⭐"
      : ev.score_global >= 7
      ? "✅"
      : "❌";

    lines.push(`<details>`);
    lines.push(
      `<summary><strong>Cas ${tc.id} — ${tc.category}</strong> &nbsp; ${indicator} ${scoreStr}</summary>`
    );
    lines.push(``);
    lines.push(
      `**Émotion :** ${tc.emotion} &nbsp;|&nbsp; **Besoin :** ${tc.besoin || "(vide)"}`
    );
    lines.push(``);
    lines.push(`**Réponse TRACÉA :**`);
    lines.push(``);
    lines.push(`> ${r.traceaResponse.replace(/\n/g, "\n> ")}`);
    lines.push(``);

    if (r.error) {
      lines.push(`**Erreur :** ${r.error}`);
    } else if (ev) {
      lines.push(`| Dimension | Score | Commentaire |`);
      lines.push(`|-----------|-------|-------------|`);
      lines.push(
        `| Justesse émotionnelle | ${ev.justesse_emotionnelle.score}/10 | ${ev.justesse_emotionnelle.commentaire} |`
      );
      lines.push(
        `| Impact | ${ev.impact.score}/10 | ${ev.impact.commentaire} |`
      );
      lines.push(
        `| Lisibilité | ${ev.lisibilite.score}/10 | ${ev.lisibilite.commentaire} |`
      );
      if (ev.problemes.length > 0) {
        lines.push(``);
        lines.push(
          `**Problèmes :** ${ev.problemes.map((p) => `\`${p}\``).join(", ")}`
        );
      }
    }

    lines.push(``);
    lines.push(`</details>`);
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(``);
  lines.push(
    `*Rapport généré par \`scripts/test-tracea-human.ts\`. Évaluation par LLM juge — indicatif, non contractuel.*`
  );
  lines.push(``);

  return lines.join("\n");
}

// ── Point d'entrée ────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Évaluation qualitative IA TRACÉA — 30 cas               ");
  console.log("  2 appels API par cas : génération TRACÉA + juge         ");
  console.log("═══════════════════════════════════════════════════════════");
  console.log();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("FATAL: ANTHROPIC_API_KEY manquante dans .env.local");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });
  const results: HumanTestResult[] = [];
  const totalStart = Date.now();

  for (const tc of TEST_CASES) {
    const label = `[${String(tc.id).padStart(2, "0")}/30] ${tc.category}`;
    process.stdout.write(`${label.padEnd(45)} `);

    const caseStart = Date.now();
    try {
      const traceaResponse = await generateTraceaResponse(tc, client);
      // Pause entre les deux appels du même cas
      await new Promise((r) => setTimeout(r, 400));
      const evaluation = await evaluateResponse(tc, traceaResponse, client);
      const durationMs = Date.now() - caseStart;

      results.push({ testCase: tc, traceaResponse, evaluation, durationMs });

      const s = evaluation.score_global;
      const icon = s > 8.5 ? "⭐" : s >= 7 ? "✅" : "⚠️ ";
      console.log(`${icon} ${s.toFixed(1)}/10  (${durationMs}ms)`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const durationMs = Date.now() - caseStart;
      results.push({
        testCase: tc,
        traceaResponse: "",
        evaluation: null,
        error: errorMsg,
        durationMs,
      });
      console.log(`❌ ERREUR — ${errorMsg.slice(0, 55)}`);
    }

    // Pause entre les cas pour éviter le rate limiting
    if (tc.id < TEST_CASES.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  const totalDurationMs = Date.now() - totalStart;
  const evaluated = results.filter((r) => r.evaluation !== null);
  const globalAvg = avg(evaluated.map((r) => r.evaluation!.score_global));

  console.log();
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  Score global moyen : ${globalAvg}/10`);
  console.log(
    `  Cas évalués : ${evaluated.length}/30${results.length - evaluated.length > 0 ? ` (${results.length - evaluated.length} erreurs)` : ""}`
  );
  console.log(`  Durée totale : ${(totalDurationMs / 1000).toFixed(1)}s`);
  console.log("═══════════════════════════════════════════════════════════");

  const reportContent = generateReport(results, totalDurationMs);
  const reportPath = path.resolve(process.cwd(), "docs/AI_HUMAN_REPORT.md");
  fs.writeFileSync(reportPath, reportContent, "utf-8");

  console.log();
  console.log(`📄 Rapport généré : ${reportPath}`);
  console.log();
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
