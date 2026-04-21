/**
 * generate-gaze-full.mjs
 * Génère un seul fichier audio continu pour GazeGuide.
 * Voix : Lily (pFZP5JQG7iQjIQuC4Bku) — eleven_multilingual_v2
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
const VOICE_ID = "pFZP5JQG7iQjIQuC4Bku";   // Lily

// Les "..." sont lus par ElevenLabs comme des pauses naturelles
// Les sauts de ligne renforcent la respiration entre les phrases
const TEXT = `Tu peux lever légèrement les yeux de l'écran...

Regarde quelque chose de proche...

Puis quelque chose... un peu plus loin...

Encore un autre endroit...

Sans chercher quoi que ce soit...

Juste regarder...

C'est suffisant pour maintenant.`;

const SETTINGS = {
  stability:         0.60,
  similarity_boost:  0.70,
  style:             0.00,
  use_speaker_boost: false,
};

const OUT = path.join(__dirname, "..", "public", "audio", "gaze", "gaze_full.mp3");

console.log(`→ Voix   : Lily (${VOICE_ID})`);
console.log(`→ Modèle : eleven_multilingual_v2`);
console.log(`→ Sortie : ${OUT}\n`);

const buf = await new Promise((resolve, reject) => {
  const body = JSON.stringify({
    text:           TEXT,
    model_id:       "eleven_multilingual_v2",
    voice_settings: SETTINGS,
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
console.log(`✓ gaze_full.mp3 généré (${(buf.length / 1024).toFixed(1)} KB)`);
