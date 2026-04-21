/**
 * generate-gaze-segments.mjs
 *
 * 1. UNE seule génération ElevenLabs via /with-timestamps
 *    → retourne l'audio (base64) ET les timestamps par caractère
 * 2. Détection des frontières de phrases dans le texte source
 *    → les 6 premiers "." donnent les 6 points de coupe
 * 3. Parseur MP3 maison (pur Node, sans ffmpeg)
 *    → découpe aux frames les plus proches des timestamps
 * 4. Écriture de 7 fichiers dans /public/audio/gaze/
 *
 * Garantie : les 7 fichiers proviennent d'une seule synthèse vocale.
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
const VOICE_ID = "pFZP5JQG7iQjIQuC4Bku";  // Lily (validée)

const SETTINGS = {
  stability:         0.68,   // plus humain qu'à 0.60, plus naturel qu'à 0.80
  similarity_boost:  0.70,
  style:             0.00,
  use_speaker_boost: false,
};

// Les 7 phrases — séparées par un saut de ligne pour forcer une pause naturelle.
// Les "." en fin de phrase sont les seuls points dans ce texte.
const SENTENCES = [
  "Tu peux lever légèrement les yeux de l'écran.",
  "Regarde quelque chose de proche.",
  "Puis quelque chose un peu plus loin.",
  "Encore un autre endroit.",
  "Sans chercher quoi que ce soit.",
  "Juste regarder.",
  "C'est suffisant pour maintenant.",
];
const TEXT = SENTENCES.join("\n");

const OUT_DIR = path.join(__dirname, "..", "public", "audio", "gaze");

// ── 1. Génération unique avec timestamps ────────────────────
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
          reject(new Error(`ElevenLabs ${res.statusCode}: ${raw}`)); return;
        }
        const json = JSON.parse(raw);
        resolve(json);
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ── 2. Timestamps des "." de fin de phrase ──────────────────
// Le texte ne contient pas d'autres points (les apostrophes sont ' pas .)
// → chaque "." dans alignment.characters est une fin de phrase.
// On prend les 6 premiers comme points de coupe (phrases 1→6).
function findSplitTimes(alignment) {
  const { characters, character_end_times_seconds } = alignment;
  const periods = [];
  for (let i = 0; i < characters.length; i++) {
    if (characters[i] === ".") {
      // Marge de 80 ms dans le silence suivant pour couper proprement
      periods.push(character_end_times_seconds[i] + 0.08);
    }
  }
  if (periods.length < 7) throw new Error(`Attendu 7 points, trouvé ${periods.length}`);
  console.log("  Points de coupe (s) :", periods.slice(0, 6).map(t => t.toFixed(3)).join("  |  "));
  return periods.slice(0, 6); // 6 coupures → 7 segments
}

// ── 3. Parseur de frames MP3 (pur Node) ────────────────────
// MPEG1 Layer3 — durée par frame = 1152 / sampleRate ≈ 26 ms @ 44100 Hz
// MPEG2 Layer3 — durée par frame =  576 / sampleRate ≈ 26 ms @ 22050 Hz
function parseMp3Frames(buf) {
  let pos = 0;

  // Sauter le tag ID3v2 si présent
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) {
    const id3Len =
      ((buf[6] & 0x7F) << 21) | ((buf[7] & 0x7F) << 14) |
      ((buf[8] & 0x7F) <<  7) |  (buf[9] & 0x7F);
    pos = 10 + id3Len;
  }

  const BITRATES_V1L3 = [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0];
  const BITRATES_V2L3 = [0, 8,16,24,32,40,48,56, 64, 80, 96,112,128,144,160,0];
  const SR_V1 = [44100, 48000, 32000];
  const SR_V2 = [22050, 24000, 16000];

  const frames = [];

  while (pos < buf.length - 4) {
    if (buf[pos] !== 0xFF || (buf[pos + 1] & 0xE0) !== 0xE0) { pos++; continue; }

    const vBits = (buf[pos + 1] >> 3) & 0x3;   // 11=MPEG1 10=MPEG2
    const lBits = (buf[pos + 1] >> 1) & 0x3;   // 01=Layer3
    if (lBits !== 0x01) { pos++; continue; }

    const isV1      = vBits === 0x3;
    const brIdx     = (buf[pos + 2] >> 4) & 0xF;
    const srIdx     = (buf[pos + 2] >> 2) & 0x3;
    const padding   = (buf[pos + 2] >> 1) & 0x1;

    if (srIdx === 3) { pos++; continue; }

    const bitrate    = (isV1 ? BITRATES_V1L3 : BITRATES_V2L3)[brIdx] * 1000;
    const sampleRate = (isV1 ? SR_V1 : SR_V2)[srIdx];
    if (bitrate <= 0) { pos++; continue; }

    const spf         = isV1 ? 1152 : 576;
    const frameLen    = Math.floor(spf / 8 * bitrate / sampleRate) + padding;
    const frameDur    = spf / sampleRate;

    if (frameLen <= 4 || pos + frameLen > buf.length) { pos++; continue; }

    frames.push({ offset: pos, length: frameLen, duration: frameDur });
    pos += frameLen;
  }

  return frames;
}

// ── 4. Découpage aux frontières de frames ──────────────────
function splitFrames(buf, frames, splitTimes) {
  const segments = [];
  let cumTime    = 0;
  let segStart   = frames[0].offset;
  let splitIdx   = 0;

  for (const frame of frames) {
    if (splitIdx < splitTimes.length && cumTime >= splitTimes[splitIdx]) {
      segments.push(buf.slice(segStart, frame.offset));
      segStart = frame.offset;
      splitIdx++;
    }
    cumTime += frame.duration;
  }

  // Dernier segment
  const last = frames[frames.length - 1];
  segments.push(buf.slice(segStart, last.offset + last.length));

  return segments;
}

// ── Main ─────────────────────────────────────────────────────
if (!API_KEY) { console.error("✗ ELEVENLABS_API_KEY manquante"); process.exit(1); }
fs.mkdirSync(OUT_DIR, { recursive: true });

console.log(`→ Voix   : Lily (${VOICE_ID})`);
console.log(`→ Modèle : eleven_multilingual_v2  |  Stabilité : ${SETTINGS.stability}`);
console.log("→ Génération unique en cours…\n");

const result     = await generateWithTimestamps();
const audioBuf   = Buffer.from(result.audio_base64, "base64");
console.log(`  Source générée : ${(audioBuf.length / 1024).toFixed(1)} KB`);

// Sauvegarder la source brute (utile pour debug / re-découpage)
fs.writeFileSync(path.join(OUT_DIR, "gaze_source.mp3"), audioBuf);
console.log("  gaze_source.mp3 sauvegardé\n");

console.log("→ Détection des frontières de phrases…");
const splitTimes = findSplitTimes(result.alignment);

console.log("\n→ Parseur MP3 + découpage en 7 segments…");
const frames   = parseMp3Frames(audioBuf);
console.log(`  ${frames.length} frames détectées`);

const segments = splitFrames(audioBuf, frames, splitTimes);
if (segments.length !== 7) throw new Error(`Attendu 7 segments, obtenu ${segments.length}`);

console.log("\n→ Écriture des fichiers…");
for (let i = 0; i < 7; i++) {
  const file = path.join(OUT_DIR, `gaze_${i + 1}.mp3`);
  fs.writeFileSync(file, segments[i]);
  console.log(`  gaze_${i + 1}.mp3  (${(segments[i].length / 1024).toFixed(1)} KB)`);
}

console.log("\n✓ 7 segments issus d'une seule génération — cohérence d'intonation garantie.");
