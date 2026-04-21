/**
 * patch-grounding-2.mjs
 * Régénère uniquement grounding_2.mp3 avec le texte nettoyé
 * (suppression de "(e)" → "assis" au lieu de "assis(e)").
 */

import https from "https";
import fs    from "fs";
import path  from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath   = path.join(__dirname, "..", ".env.local");
fs.readFileSync(envPath, "utf8").split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k && v.length) process.env[k.trim()] = v.join("=").trim();
});

const API_KEY  = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = "pFZP5JQG7iQjIQuC4Bku"; // Lily

if (!API_KEY) { console.error("✗ ELEVENLABS_API_KEY manquante"); process.exit(1); }

// Texte nettoyé — "(e)" supprimé, deux phrases sur une ligne pour cohérence
const TEXT = "Si tu es assis, pose les pieds bien à plat au sol.";

const OUT = path.join(__dirname, "..", "public", "audio", "grounding", "grounding_2.mp3");

console.log(`→ Voix   : Lily (${VOICE_ID})`);
console.log(`→ Texte  : "${TEXT}"`);
console.log(`→ Sortie : ${OUT}\n`);

const buf = await new Promise((resolve, reject) => {
  const body = JSON.stringify({
    text:           TEXT,
    model_id:       "eleven_multilingual_v2",
    voice_settings: {
      stability:         0.68,
      similarity_boost:  0.70,
      style:             0.00,
      use_speaker_boost: false,
    },
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

fs.writeFileSync(OUT, buf);
console.log(`✓ grounding_2.mp3 régénéré (${(buf.length / 1024).toFixed(1)} KB)`);
