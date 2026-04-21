/**
 * generate-grounding-audio.mjs
 *
 * Même architecture que generate-gaze-segments.mjs :
 * 1. UNE seule génération ElevenLabs via /with-timestamps
 * 2. Détection des fins de phrases dans l'alignement
 * 3. Parseur MP3 pur Node — découpe aux frontières de frames
 * 4. 16 segments → /public/audio/grounding/grounding_1–16.mp3
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
const VOICE_ID = "pFZP5JQG7iQjIQuC4Bku";  // Lily — cohérence avec GazeGuide

const SETTINGS = {
  stability:         0.68,
  similarity_boost:  0.70,
  style:             0.00,
  use_speaker_boost: false,
};

// 16 phrases — chacune sur une ligne séparée pour forcer une pause naturelle.
// Tous les "." en fin de phrase sont détectés par le parseur d'alignement.
const SENTENCES = [
  "On revient doucement dans le corps.",
  "Si tu es assis(e), pose les pieds bien à plat au sol.",
  "Sens le contact sous tes pieds.",
  "Presse légèrement tes pieds dans le sol.",
  "Un tout petit peu.",
  "Relâche.",
  "Et recommence une fois.",
  "Presse… puis relâche.",
  "Tu peux simplement rester là un instant.",
  "Garde les pieds en contact avec le sol.",
  "Sens ce point d'appui.",
  "Le reste du corps peut se poser autour.",
  "Ce qui est là peut descendre un peu, jusqu'aux appuis.",
  "Sans forcer.",
  "Juste laisser passer.",
  "C'est suffisant pour maintenant.",
];
const TEXT = SENTENCES.join("\n");

const OUT_DIR = path.join(__dirname, "..", "public", "audio", "grounding");

// ── 1. Génération unique avec timestamps ─────────────────────
function generateWithTimestamps() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      text:           TEXT,
      model_id:       "eleven_multilingual_v2",
      voice_settings: SETTINGS,
    });
    const req = https.request({
      hostname: "api.elevenlabs.io",
      path:     `/v1/text-to-speech/${VOICE_ID}/with-timestamps`,
      method:   "POST",
      headers:  {
        "Content-Type": "application/json",
        "xi-api-key":   API_KEY,
        "Accept":       "application/json",
      },
    }, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => {
        if (res.statusCode !== 200) {
          reject(new Error(`ElevenLabs ${res.statusCode}: ${raw.slice(0, 200)}`)); return;
        }
        resolve(JSON.parse(raw));
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ── 2. Timestamps des fins de phrase ──────────────────────────
// Cherche "." (ou "…" U+2026) suivi de "\n" ou fin de texte.
function findSplitTimes(alignment) {
  const { characters, character_end_times_seconds } = alignment;
  const periods = [];
  for (let i = 0; i < characters.length; i++) {
    const c    = characters[i];
    const next = characters[i + 1];
    const isEOL = next === "\n" || next === undefined || next === null;
    if (isEOL && (c === "." || c === "\u2026")) {
      periods.push(character_end_times_seconds[i] + 0.08);
    }
  }
  if (periods.length < SENTENCES.length) {
    throw new Error(`Attendu ${SENTENCES.length} fins de phrase, trouvé ${periods.length}`);
  }
  const cuts = periods.slice(0, SENTENCES.length - 1);
  console.log("  Points de coupe :", cuts.map(t => t.toFixed(3)).join("  |  "));
  return cuts;
}

// ── 3. Parseur MP3 (pur Node) ─────────────────────────────────
function parseMp3Frames(buf) {
  let pos = 0;
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) {
    const id3Len =
      ((buf[6] & 0x7F) << 21) | ((buf[7] & 0x7F) << 14) |
      ((buf[8] & 0x7F) <<  7) |  (buf[9] & 0x7F);
    pos = 10 + id3Len;
  }
  const BR_V1 = [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0];
  const BR_V2 = [0, 8,16,24,32,40,48,56, 64, 80, 96,112,128,144,160,0];
  const SR_V1 = [44100, 48000, 32000];
  const SR_V2 = [22050, 24000, 16000];
  const frames = [];
  while (pos < buf.length - 4) {
    if (buf[pos] !== 0xFF || (buf[pos + 1] & 0xE0) !== 0xE0) { pos++; continue; }
    const vBits = (buf[pos + 1] >> 3) & 0x3;
    const lBits = (buf[pos + 1] >> 1) & 0x3;
    if (lBits !== 0x01) { pos++; continue; }
    const isV1    = vBits === 0x3;
    const brIdx   = (buf[pos + 2] >> 4) & 0xF;
    const srIdx   = (buf[pos + 2] >> 2) & 0x3;
    const padding = (buf[pos + 2] >> 1) & 0x1;
    if (srIdx === 3) { pos++; continue; }
    const bitrate    = (isV1 ? BR_V1 : BR_V2)[brIdx] * 1000;
    const sampleRate = (isV1 ? SR_V1 : SR_V2)[srIdx];
    if (bitrate <= 0) { pos++; continue; }
    const spf      = isV1 ? 1152 : 576;
    const frameLen = Math.floor(spf / 8 * bitrate / sampleRate) + padding;
    const frameDur = spf / sampleRate;
    if (frameLen <= 4 || pos + frameLen > buf.length) { pos++; continue; }
    frames.push({ offset: pos, length: frameLen, duration: frameDur });
    pos += frameLen;
  }
  return frames;
}

// ── 4. Découpage ────────────────────────────────────────────
function splitFrames(buf, frames, splitTimes) {
  const segments = [];
  let cumTime = 0, segStart = frames[0].offset, splitIdx = 0;
  for (const frame of frames) {
    if (splitIdx < splitTimes.length && cumTime >= splitTimes[splitIdx]) {
      segments.push(buf.slice(segStart, frame.offset));
      segStart = frame.offset;
      splitIdx++;
    }
    cumTime += frame.duration;
  }
  const last = frames[frames.length - 1];
  segments.push(buf.slice(segStart, last.offset + last.length));
  return segments;
}

// ── Main ─────────────────────────────────────────────────────
if (!API_KEY) { console.error("✗ ELEVENLABS_API_KEY manquante"); process.exit(1); }
fs.mkdirSync(OUT_DIR, { recursive: true });

console.log(`→ Voix   : Lily (${VOICE_ID})`);
console.log(`→ Modèle : eleven_multilingual_v2  |  Stabilité : ${SETTINGS.stability}`);
console.log(`→ Phrases : ${SENTENCES.length}\n`);

const result   = await generateWithTimestamps();
const audioBuf = Buffer.from(result.audio_base64, "base64");
console.log(`  Source : ${(audioBuf.length / 1024).toFixed(1)} KB`);
fs.writeFileSync(path.join(OUT_DIR, "grounding_source.mp3"), audioBuf);

console.log("\n→ Détection des frontières…");
const splitTimes = findSplitTimes(result.alignment);

console.log("\n→ Parseur MP3 + découpage…");
const frames   = parseMp3Frames(audioBuf);
console.log(`  ${frames.length} frames détectées`);

const segments = splitFrames(audioBuf, frames, splitTimes);
if (segments.length !== SENTENCES.length) {
  throw new Error(`Attendu ${SENTENCES.length} segments, obtenu ${segments.length}`);
}

console.log("\n→ Écriture…");
for (let i = 0; i < segments.length; i++) {
  const file = path.join(OUT_DIR, `grounding_${i + 1}.mp3`);
  fs.writeFileSync(file, segments[i]);
  console.log(`  grounding_${i + 1}.mp3  (${(segments[i].length / 1024).toFixed(1)} KB)`);
}

console.log(`\n✓ ${SENTENCES.length} segments issus d'une seule génération.`);
