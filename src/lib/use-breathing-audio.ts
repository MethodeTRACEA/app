"use client";

import { useEffect, useRef } from "react";
import type { AudioLevel } from "./use-exercise-audio";

// ══════════════════════════════════════════════════════════════
// useBreathingAudio — texture sonore synchronisée au cycle respiratoire
//
// Chaîne : source → preFilter (1 200 Hz fixe) → filter (modulé) → gain
//
// preFilter coupe le haut du spectre "air / hiss" avant modulation.
// filter modulé suit le cycle via setTargetAtTime (courbe exponentielle) :
//   inspire (4s) → gain 0.07, filtre  760 Hz  — ouverture douce
//   expire  (6s) → gain 0.04, filtre  590 Hz  — fermeture douce
//   neutre       → gain 0.055, filtre 620 Hz  — base stable
//
// setTargetAtTime donne une courbe physique (amortissement exponentiel) :
//   départ rapide → décélération progressive → plateau naturel
// ══════════════════════════════════════════════════════════════

type BreathPhase = "pre" | "install" | "inspire" | "expire" | "close";

// Constantes de temps pour setTargetAtTime
// TC = temps pour atteindre ~63 % de la cible — plus grand = plus lent
const TC_INSPIRE  = 1.5;   // phase 4 s → atteint ~93 % à t=4 s
const TC_EXPIRE   = 2.2;   // phase 6 s → atteint ~94 % à t=6 s
const TC_NEUTRAL  = 1.0;   // retour neutre
const TC_FADE_IN  = 1.2;   // première activation
const TC_FADE_OUT = 1.5;   // coupure son
const UNMOUNT_S   = 0.8;   // démontage composant

// Gains par niveau — valeurs volontairement basses
const CFG: Record<Exclude<AudioLevel, "off">, { base: number; inspire: number; expire: number }> = {
  low:    { base: 0.028, inspire: 0.035, expire: 0.020 },
  medium: { base: 0.055, inspire: 0.070, expire: 0.040 },
};

// Fréquences du filtre modulé — écart étroit pour réduire l'effet "soufflerie"
const FREQ_NEUTRAL = 620;
const FREQ_INSPIRE = 760;
const FREQ_EXPIRE  = 590;

// Fréquence du pre-filtre fixe — supprime le "air/hiss" haute fréquence de la source
const FREQ_PREFILTER = 1200;

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

// Helpers — cancel + ancre + approche exponentielle (évite les clics)
function rampGain(gain: GainNode, target: number, tc: number, now: number) {
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.setTargetAtTime(target, now, tc);
}

function rampFreq(filter: BiquadFilterNode, target: number, tc: number, now: number) {
  filter.frequency.cancelScheduledValues(now);
  filter.frequency.setValueAtTime(filter.frequency.value, now);
  filter.frequency.setTargetAtTime(target, now, tc);
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
      rampGain(gain, 0, TC_FADE_OUT, now);
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
      rampGain(gain, 0, TC_FADE_OUT, ctx.currentTime);
      return;
    }

    if (!ctxRef.current || ctxRef.current.state === "closed") {
      const ctx = new AudioContext();

      const source      = ctx.createBufferSource();
      source.buffer     = buildNoiseBuffer(ctx);
      source.loop       = true;

      // Étage 1 : atténuation fixe du "hiss" haute fréquence de la source
      const preFilter           = ctx.createBiquadFilter();
      preFilter.type            = "lowpass";
      preFilter.frequency.value = FREQ_PREFILTER;
      preFilter.Q.value         = 0.3;   // très plat — juste un rolloff doux

      // Étage 2 : filtre modulé qui suit le cycle respiratoire
      const filter           = ctx.createBiquadFilter();
      filter.type            = "lowpass";
      filter.frequency.value = FREQ_NEUTRAL;
      filter.Q.value         = 0.5;

      const gain      = ctx.createGain();
      gain.gain.value = 0;

      source.connect(preFilter);
      preFilter.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();

      ctxRef.current    = ctx;
      gainRef.current   = gain;
      filterRef.current = filter;
    }

    // Fondu d'entrée — la phase sync prendra le relais au prochain effet
    const ctx  = ctxRef.current!;
    const gain = gainRef.current!;
    if (ctx.state === "closed") return;
    rampGain(gain, CFG[level].base, TC_FADE_IN, ctx.currentTime);
  }, [level]);

  // Synchronisation filtre + gain avec la phase respiratoire
  useEffect(() => {
    if (level === "off") return;
    const ctx    = ctxRef.current;
    const gain   = gainRef.current;
    const filter = filterRef.current;
    if (!ctx || !gain || !filter || ctx.state === "closed") return;

    const cfg = CFG[level as "low" | "medium"];
    const now = ctx.currentTime;

    if (phase === "inspire") {
      rampGain(gain,   cfg.inspire,  TC_INSPIRE, now);
      rampFreq(filter, FREQ_INSPIRE, TC_INSPIRE, now);
    } else if (phase === "expire") {
      rampGain(gain,   cfg.expire,   TC_EXPIRE,  now);
      rampFreq(filter, FREQ_EXPIRE,  TC_EXPIRE,  now);
    } else {
      // pre, install, close → texture neutre
      rampGain(gain,   cfg.base,     TC_NEUTRAL, now);
      rampFreq(filter, FREQ_NEUTRAL, TC_NEUTRAL, now);
    }
  }, [phase, level]);
}
