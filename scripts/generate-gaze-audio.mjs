/**
 * generate-gaze-audio.mjs
 *
 * Génère les 7 fichiers audio de GazeGuide via ElevenLabs API.
 * Voix : Lily — Velvety Actress (pFZP5JQG7iQjIQuC4Bku)
 * Modèle : eleven_multilingual_v2
 *
 * Usage :
 *   node scripts/generate-gaze-audio.mjs
 */

import fs   from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));

// ── Charger .env.local ──────────────────────────────────────
const envPath = path.join(__dirname, "..", ".env.local");
fs.readFileSync(envPath, "utf8").split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k && v.length) process.env[k.trim()] = v.join("=").trim();
});
const API_KEY = process.env.ELEVENLABS_API_KEY;

// ── Config ──────────────────────────────────────────────────
const VOICE_ID = "pFZP5JQG7iQjIQuC4Bku";   // Lily — Velvety Actress (British)
const MODEL_ID = "eleven_multilingual_v2";

// Réglages : moins de rigidité que River (0.80 → 0.60), style neutre
const VOICE_SETTINGS = {
  stability:         0.60,   // variation naturelle — voix humaine sans excès
  similarity_boost:  0.70,
  style:             0.00,   // pas de style ajouté
  use_speaker_boost: false,
};

const OUTPUT_DIR = path.join(__dirname, "..", "public", "audio", "gaze");

const PHRASES = [
  { file: "gaze_1.mp3", text: "Lève légèrement les yeux de l'écran" },
  { file: "gaze_2.mp3", text: "Regarde quelque chose de proche" },
  { file: "gaze_3.mp3", text: "Puis quelque chose… un peu plus loin" },
  { file: "gaze_4.mp3", text: "Encore un autre endroit" },
  { file: "gaze_5.mp3", text: "Sans chercher" },
  { file: "gaze_6.mp3", text: "Juste regarder" },
  { file: "gaze_7.mp3", text: "C'est suffisant pour maintenant" },
];

// ── TTS ─────────────────────────────────────────────────────
function tts(text) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      text,
      model_id:       MODEL_ID,
      voice_settings: VOICE_SETTINGS,
    });
    const req = https.request({
      hostname: "api.elevenlabs.io",
      path:     `/v1/text-to-speech/${VOICE_ID}`,
      method:   "POST",
      headers:  {
        "Content-Type": "application/json",
        "xi-api-key":   API_KEY,
        "Accept":       "audio/mpeg",
      },
    }, (res) => {
      if (res.statusCode !== 200) {
        let e = "";
        res.on("data", (c) => (e += c));
        res.on("end", () => reject(new Error(`ElevenLabs ${res.statusCode}: ${e}`)));
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

// ── Main ─────────────────────────────────────────────────────
if (!API_KEY) { console.error("✗ ELEVENLABS_API_KEY manquante"); process.exit(1); }
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

console.log(`→ Voix   : Lily (${VOICE_ID})`);
console.log(`→ Modèle : ${MODEL_ID}`);
console.log(`→ Stabilité : ${VOICE_SETTINGS.stability}  |  Style : ${VOICE_SETTINGS.style}\n`);

for (const { file, text } of PHRASES) {
  process.stdout.write(`  "${text}"…`);
  const audio = await tts(text);
  fs.writeFileSync(path.join(OUTPUT_DIR, file), audio);
  console.log(` → ${file}  (${(audio.length / 1024).toFixed(1)} KB)`);
  await new Promise((r) => setTimeout(r, 500));
}

console.log("\n✓ 7 fichiers régénérés dans public/audio/gaze/");
