/**
 * generate-gaze-audio.mjs
 *
 * Génère les 7 fichiers audio de GazeGuide via ElevenLabs API.
 *
 * Usage :
 *   node scripts/generate-gaze-audio.mjs
 *
 * Requiert ELEVENLABS_API_KEY dans l'environnement (ou .env.local via dotenv).
 */

import fs   from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

// ── Config ──────────────────────────────────────────────────
// Lecture de la clé depuis process.env ou .env.local (pas de dépendance dotenv)
function loadEnv() {
  const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, "utf8").split("\n").forEach((line) => {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  });
}
loadEnv();

const API_KEY    = process.env.ELEVENLABS_API_KEY;
const MODEL_ID   = "eleven_multilingual_v2";  // Supporte le français natif

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "..", "public", "audio", "gaze");

// Réglages voix : sobre, neutre, sans exagération de style
const VOICE_SETTINGS = {
  stability:         0.80,  // voix stable, cohérente entre les phrases
  similarity_boost:  0.70,  // fidélité à la voix de référence
  style:             0.00,  // 0 = aucun style ajouté (plus sobre)
  use_speaker_boost: false,
};

// 7 phrases dans l'ordre des phases GazeGuide
const PHRASES = [
  { file: "gaze_1.mp3", text: "Lève légèrement les yeux de l'écran" },
  { file: "gaze_2.mp3", text: "Regarde quelque chose de proche" },
  { file: "gaze_3.mp3", text: "Puis quelque chose… un peu plus loin" },
  { file: "gaze_4.mp3", text: "Encore un autre endroit" },
  { file: "gaze_5.mp3", text: "Sans chercher" },
  { file: "gaze_6.mp3", text: "Juste regarder" },
  { file: "gaze_7.mp3", text: "C'est suffisant pour maintenant" },
];

// ── Helpers ──────────────────────────────────────────────────
function apiGet(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.elevenlabs.io",
      path:     endpoint,
      method:   "GET",
      headers:  { "xi-api-key": API_KEY },
    };
    https.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error("JSON parse error")); }
      });
    }).on("error", reject).end();
  });
}

function apiTTS(voiceId, text) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      text,
      model_id:       MODEL_ID,
      voice_settings: VOICE_SETTINGS,
    });

    const options = {
      hostname: "api.elevenlabs.io",
      path:     `/v1/text-to-speech/${voiceId}`,
      method:   "POST",
      headers:  {
        "Content-Type": "application/json",
        "xi-api-key":   API_KEY,
        "Accept":       "audio/mpeg",
      },
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        let err = "";
        res.on("data", (c) => (err += c));
        res.on("end", () => reject(new Error(`ElevenLabs ${res.statusCode}: ${err}`)));
        return;
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ── Sélection de voix ────────────────────────────────────────
// Cherche une voix neutre/multilingue adaptée au français.
// Priorité : voix ayant "fr" dans les langues ou genre féminin + langue fr.
async function pickVoice() {
  const { voices } = await apiGet("/v1/voices");

  // 1. Voix explicitement française
  const frVoice = voices.find((v) =>
    v.fine_tuning?.language === "fr" ||
    (v.labels?.language ?? "").toLowerCase().includes("fr") ||
    (v.labels?.accent ?? "").toLowerCase().includes("french")
  );
  if (frVoice) {
    console.log(`✓ Voix française trouvée : ${frVoice.name} (${frVoice.voice_id})`);
    return frVoice.voice_id;
  }

  // 2. Voix multilingue au ton sobre / neutre
  const neutral = voices.find((v) => {
    const use  = (v.labels?.use_case ?? "").toLowerCase();
    const desc = (v.description ?? "").toLowerCase();
    return use.includes("meditat") || use.includes("calm") ||
           desc.includes("calm")   || desc.includes("neutral");
  });
  if (neutral) {
    console.log(`✓ Voix neutre sélectionnée : ${neutral.name} (${neutral.voice_id})`);
    return neutral.voice_id;
  }

  // 3. Première voix disponible
  const fallback = voices[0];
  console.log(`⚠ Fallback : ${fallback.name} (${fallback.voice_id})`);
  return fallback.voice_id;
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  if (!API_KEY) {
    console.error("✗ ELEVENLABS_API_KEY manquante dans l'environnement.");
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log("→ Récupération des voix ElevenLabs…");
  const voiceId = await pickVoice();

  console.log(`→ Modèle : ${MODEL_ID}`);
  console.log(`→ Sortie : ${OUTPUT_DIR}\n`);

  for (const { file, text } of PHRASES) {
    const dest = path.join(OUTPUT_DIR, file);
    process.stdout.write(`  Génération "${text}"…`);
    const audio = await apiTTS(voiceId, text);
    fs.writeFileSync(dest, audio);
    console.log(` → ${file} (${(audio.length / 1024).toFixed(1)} KB)`);
    // Petite pause pour respecter les rate-limits ElevenLabs
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log("\n✓ 7 fichiers générés dans public/audio/gaze/");
}

main().catch((err) => {
  console.error("✗", err.message);
  process.exit(1);
});
