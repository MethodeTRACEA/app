"use client";

import { useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════
// useExerciseAudio — couche sonore ambiante pour les exercices TRACÉA
//
// Génère du bruit rose (Voss–McCartney) filtré en passe-bas :
//   breathing → 800 Hz  : nappe chaude et aérienne
//   grounding → 380 Hz  : texture dense, grave, stabilisante
//   gaze      → 1 400 Hz: texture légère, ouverte, spatiale
//
// Utilise la Web Audio API pour des fondus natifs sans artefacts.
// Le contexte audio n'est créé qu'au premier clic (politique autoplay).
// ══════════════════════════════════════════════════════════════

export type AudioLevel   = "off" | "low" | "medium";
export type AudioTexture = "breathing" | "grounding" | "gaze";

// Fréquence de coupure du filtre passe-bas par texture
const FILTER_FREQ: Record<AudioTexture, number> = {
  breathing: 800,
  grounding: 380,
  gaze:      1400,
};

// Gain cible par niveau (valeurs volontairement basses — second plan)
const LEVEL_GAIN: Record<AudioLevel, number> = {
  off:    0,
  low:    0.06,
  medium: 0.13,
};

const FADE_IN_S  = 1.0;   // fondu d'entrée
const FADE_OUT_S = 1.5;   // fondu de sortie (toggle off)
const UNMOUNT_S  = 0.8;   // fondu de sortie (démontage composant)

// ── Bruit rose via approximation Voss–McCartney ─────────────
// Résultat : spectre en 1/f, perçu comme plus naturel que le bruit blanc.
// Buffer stéréo de 4 s — la boucle est imperceptible (bruit aléatoire).
function buildNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const length = ctx.sampleRate * 4;
  const buf    = ctx.createBuffer(2, length, ctx.sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
    for (let i = 0; i < length; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + w * 0.5362) * 0.11;
    }
  }
  return buf;
}

// ── Hook principal ───────────────────────────────────────────
export function useExerciseAudio(texture: AudioTexture, level: AudioLevel) {
  const ctxRef  = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Nettoyage au démontage : fondu court puis fermeture du contexte
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    return () => {
      const ctx  = ctxRef.current;
      const gain = gainRef.current;
      if (!ctx || !gain || ctx.state === "closed") return;

      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + UNMOUNT_S);
      setTimeout(() => {
        if (ctx.state !== "closed") ctx.close();
      }, (UNMOUNT_S + 0.15) * 1000);
    };
  }, []);

  // Réaction aux changements de niveau
  useEffect(() => {
    // ── Couper le son ──
    if (level === "off") {
      const ctx  = ctxRef.current;
      const gain = gainRef.current;
      if (!ctx || !gain || ctx.state === "closed") return;

      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + FADE_OUT_S);
      return;
    }

    // ── Première activation : construction du graphe audio ──
    // Créé ici (dans un effet déclenché par clic utilisateur) pour respecter
    // la politique autoplay des navigateurs.
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      const ctx = new AudioContext();

      const source = ctx.createBufferSource();
      source.buffer = buildNoiseBuffer(ctx);
      source.loop   = true;

      const filter       = ctx.createBiquadFilter();
      filter.type        = "lowpass";
      filter.frequency.value = FILTER_FREQ[texture];
      filter.Q.value     = 0.7;

      const gain     = ctx.createGain();
      gain.gain.value = 0;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();

      ctxRef.current  = ctx;
      gainRef.current = gain;
    }

    // ── Fondu vers la cible ──
    const ctx  = ctxRef.current!;
    const gain = gainRef.current!;
    if (ctx.state === "closed") return;

    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(LEVEL_GAIN[level], now + FADE_IN_S);

  }, [level, texture]); // texture est constant par composant
}
