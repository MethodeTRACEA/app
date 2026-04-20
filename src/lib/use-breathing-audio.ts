"use client";

import { useEffect, useRef } from "react";
import type { AudioLevel } from "./use-exercise-audio";

// ══════════════════════════════════════════════════════════════
// useBreathingAudio — texture sonore synchronisée au cycle respiratoire
//
// Bruit rose très filtré (low-pass) dont le gain et la fréquence
// de coupure suivent lentement l'animation :
//   inspire (4s) → filtre s'ouvre vers 900 Hz, gain monte vers base+delta
//   expire  (6s) → filtre se referme vers 500 Hz, gain descend vers base-delta
//
// Variations volontairement sub-threshold : aucune pulsation perceptible,
// juste une légère respiration de la texture.
// ══════════════════════════════════════════════════════════════

type BreathPhase = "pre" | "install" | "inspire" | "expire" | "close";

const INSPIRE_S = 4.0;
const EXPIRE_S  = 6.0;
const NEUTRAL_S = 1.5;
const FADE_IN_S = 1.2;
const FADE_OUT_S = 1.5;
const UNMOUNT_S  = 0.8;

// Gain base + variation par niveau (valeurs volontairement basses)
const CFG: Record<Exclude<AudioLevel, "off">, { base: number; delta: number }> = {
  low:    { base: 0.025, delta: 0.010 },
  medium: { base: 0.050, delta: 0.020 },
};

const FREQ_NEUTRAL = 700;
const FREQ_INSPIRE = 900;
const FREQ_EXPIRE  = 500;

// Bruit rose stéréo 4 s (approximation Voss–McCartney)
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
      b5 = -0.7616  * b5 - w * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + w * 0.5362) * 0.11;
    }
  }
  return buf;
}

export function useBreathingAudio(phase: BreathPhase, level: AudioLevel) {
  const ctxRef    = useRef<AudioContext | null>(null);
  const gainRef   = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);

  // Nettoyage au démontage
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

  // Réaction aux changements de niveau (crée le contexte au premier clic)
  useEffect(() => {
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

    if (!ctxRef.current || ctxRef.current.state === "closed") {
      const ctx = new AudioContext();

      const source      = ctx.createBufferSource();
      source.buffer     = buildNoiseBuffer(ctx);
      source.loop       = true;

      const filter          = ctx.createBiquadFilter();
      filter.type           = "lowpass";
      filter.frequency.value = FREQ_NEUTRAL;
      filter.Q.value        = 0.7;

      const gain      = ctx.createGain();
      gain.gain.value = 0;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();

      ctxRef.current    = ctx;
      gainRef.current   = gain;
      filterRef.current = filter;
    }

    // Fondu d'entrée vers le gain de base — la phase sync prendra le relais
    const ctx  = ctxRef.current!;
    const gain = gainRef.current!;
    if (ctx.state === "closed") return;

    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(CFG[level].base, now + FADE_IN_S);
  }, [level]);

  // Synchronisation filtre + gain avec la phase respiratoire
  useEffect(() => {
    if (level === "off") return;
    const ctx    = ctxRef.current;
    const gain   = gainRef.current;
    const filter = filterRef.current;
    if (!ctx || !gain || !filter || ctx.state === "closed") return;

    const { base, delta } = CFG[level as "low" | "medium"];
    const now = ctx.currentTime;

    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    filter.frequency.cancelScheduledValues(now);
    filter.frequency.setValueAtTime(filter.frequency.value, now);

    if (phase === "inspire") {
      gain.gain.linearRampToValueAtTime(base + delta, now + INSPIRE_S);
      filter.frequency.linearRampToValueAtTime(FREQ_INSPIRE, now + INSPIRE_S);
    } else if (phase === "expire") {
      gain.gain.linearRampToValueAtTime(base - delta, now + EXPIRE_S);
      filter.frequency.linearRampToValueAtTime(FREQ_EXPIRE, now + EXPIRE_S);
    } else {
      // pre, install, close → retour neutre
      gain.gain.linearRampToValueAtTime(base, now + NEUTRAL_S);
      filter.frequency.linearRampToValueAtTime(FREQ_NEUTRAL, now + NEUTRAL_S);
    }
  }, [phase, level]);
}
