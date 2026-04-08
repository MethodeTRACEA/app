"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { ExitLink } from "@/components/ui/ExitLink";

// ── Flow routing constants ─────────────────────────────────
const SHORT_FLOW_V2 = "short" as const;
const LONG_FLOW = "long" as const;

type FlowRoute = typeof SHORT_FLOW_V2 | typeof LONG_FLOW;

const ACTIVATION_FLOW_MAP: Record<string, FlowRoute> = {
  deborde: SHORT_FLOW_V2,
  charge: SHORT_FLOW_V2,
  encore: LONG_FLOW,
  calme: LONG_FLOW,
};

// ═══════════════════════════════════════════════════════════
// TRACÉA — Traversée courte V2 (3 étapes, ultra-optimisée)
// Flow : Entrée → Ressenti → Corps → Bascule → Ancrer →
//        Exercice → Feedback → (branche) → Émerger →
//        Aligner → Check final → Synthèse
// ═══════════════════════════════════════════════════════════

type Screen =
  | "entree"
  | "ressenti"
  | "corps"
  | "bascule"
  | "ancrer"
  | "exercice"
  | "feedback"
  | "branche-pareil"
  | "branche-pareil-exercice"
  | "branche-pareil-feedback"
  | "branche-agite"
  | "branche-agite-exercice"
  | "emerger"
  | "aligner"
  | "sous-ecran-reduit"
  | "sous-ecran-repere"
  | "check-final"
  | "synthese";

type ActivationLevel = "deborde" | "charge" | "encore" | "calme";
type Feeling = "serre" | "agite" | "lourd" | "flou" | "vide" | "bloque" | "je-ne-sais-pas";
type BodyZone = "poitrine" | "ventre" | "gorge" | "tete" | "epaules" | "partout" | "je-ne-sais-pas";
type AnchorMethod = "appuis" | "autour" | "souffle";
type AnchorEffect = "un-peu" | "pareil" | "plus-agite" | "je-ne-sais-pas";
type ActionPlanType = "maintenant" | "10-minutes" | "version-petite" | "pas-maintenant";
type EndState = "prochain-pas" | "calme" | "clarte" | "rien-special";
type TimeAnchor = "apres-ecran" | "10-minutes" | "avant-ce-soir" | "plus-tard";

const FEELING_LABELS: Record<Feeling, string> = {
  "serre": "serré",
  "agite": "agité",
  "lourd": "lourd",
  "flou": "flou",
  "vide": "vide",
  "bloque": "bloqué",
  "je-ne-sais-pas": "je ne sais pas",
};

const BODY_LABELS: Record<BodyZone, string> = {
  "poitrine": "poitrine",
  "ventre": "ventre",
  "gorge": "gorge",
  "tete": "tête",
  "epaules": "épaules",
  "partout": "partout",
  "je-ne-sais-pas": "je ne sais pas",
};

const ANCHOR_LABELS: Record<AnchorMethod, string> = {
  "appuis": "sentir les appuis du corps",
  "autour": "regarder autour de moi",
  "souffle": "expirer plus lentement",
};

// Actions émerger — pool complet
const EMERGE_ACTIONS = [
  "m'asseoir 2 minutes",
  "poser mes pieds au sol un moment",
  "enlever une stimulation",
  "regarder au loin 10 secondes",
  "ouvrir une fenêtre",
  "boire un verre d'eau",
  "relâcher les épaules",
] as const;

// Versions réduites
const REDUCED_ACTIONS: Record<string, string> = {
  "m'asseoir 2 minutes": "m'asseoir 30 secondes",
  "poser mes pieds au sol un moment": "poser mes pieds au sol 10 secondes",
  "enlever une stimulation": "baisser le son ou la lumière",
  "regarder au loin 10 secondes": "regarder au loin 5 secondes",
  "ouvrir une fenêtre": "me tourner vers la fenêtre",
  "boire un verre d'eau": "boire une gorgée",
  "relâcher les épaules": "relâcher les épaules une fois",
};

// ── Chip auto-advance ──────────────────────────────────────
function AutoChip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="t-chip w-full text-center"
    >
      {label}
    </button>
  );
}

// ── Timer circulaire (10s) ─────────────────────────────────
function Timer10({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [seconds, setSeconds] = useState(10);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (seconds <= 0) {
      setDone(true);
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const progress = ((10 - seconds) / 10) * 100;

  return (
    <div className="flex flex-col items-center gap-6 mt-6">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40" cy="40" r="36"
            fill="none"
            stroke="rgba(232,216,199,0.12)"
            strokeWidth="4"
          />
          <circle
            cx="40" cy="40" r="36"
            fill="none"
            stroke="rgba(214,165,106,0.6)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 36}`}
            strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-inter text-lg text-t-creme/70">
          {seconds}
        </span>
      </div>
      {done && (
        <PrimaryButton onClick={onComplete}>
          C&apos;est fait
        </PrimaryButton>
      )}
    </div>
  );
}

// ── Compteur 3 cycles respiration ──────────────────────────
function BreathCounter({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState<"inspire" | "expire">("inspire");

  useEffect(() => {
    if (cycle >= 3) return;
    const duration = phase === "inspire" ? 4000 : 5000;
    const t = setTimeout(() => {
      if (phase === "inspire") {
        setPhase("expire");
      } else {
        setPhase("inspire");
        setCycle((c) => c + 1);
      }
    }, duration);
    return () => clearTimeout(t);
  }, [cycle, phase]);

  const done = cycle >= 3;

  return (
    <div className="flex flex-col items-center gap-6 mt-6">
      <div className="flex items-center gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-500 ${
              i < cycle
                ? "bg-t-dore/70"
                : i === cycle && !done
                ? "bg-t-dore/40 animate-pulse"
                : "bg-t-creme/15"
            }`}
          />
        ))}
      </div>
      {!done && (
        <p className="font-body text-xl text-t-beige/80 italic animate-pulse">
          {phase === "inspire" ? "Inspire\u2026" : "Expire\u2026"}
        </p>
      )}
      {done && (
        <PrimaryButton onClick={onComplete}>
          C&apos;est fait
        </PrimaryButton>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════

export default function TraverseeCourteV2Page() {
  return (
    <Suspense>
      <TraverseeCourteV2 />
    </Suspense>
  );
}

function TraverseeCourteV2() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Detect if entered via soft-switch (skip entry screen) ──
  const skipEntree = searchParams.get("skip") === "entree";

  // ── State ──
  const [screen, setScreen] = useState<Screen>(skipEntree ? "ressenti" : "entree");
  const [activationLevel, setActivationLevel] = useState<ActivationLevel | null>(null);
  const [currentFeeling, setCurrentFeeling] = useState<Feeling | null>(null);
  const [bodyZone, setBodyZone] = useState<BodyZone | null>(null);
  const [anchorMethod, setAnchorMethod] = useState<AnchorMethod | null>(null);
  const [anchorEffect, setAnchorEffect] = useState<AnchorEffect | null>(null);
  const [nextAction, setNextAction] = useState<string | null>(null);
  const [actionPlanType, setActionPlanType] = useState<ActionPlanType | null>(null);
  const [reducedAction, setReducedAction] = useState<string | null>(null);
  const [timeAnchor, setTimeAnchor] = useState<TimeAnchor | null>(null);
  const [endState, setEndState] = useState<EndState | null>(null);
  const [showMoreFeelings, setShowMoreFeelings] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);

  // Méthodes déjà essayées (pour ne jamais reproposer)
  const [triedMethods, setTriedMethods] = useState<AnchorMethod[]>([]);
  // Branche pareil: méthode alternative
  const [altMethod, setAltMethod] = useState<AnchorMethod | null>(null);

  // Actions émerger: 3 aléatoires puis 3 autres
  const [emergePool] = useState(() => {
    const shuffled = [...EMERGE_ACTIONS].sort(() => Math.random() - 0.5);
    return shuffled;
  });

  // ── Helpers ──
  const bodyLabel = bodyZone ? BODY_LABELS[bodyZone] : "";

  const getAlternativeMethod = useCallback(
    (exclude: AnchorMethod[], noBreath: boolean): AnchorMethod => {
      const all: AnchorMethod[] = ["appuis", "autour", "souffle"];
      const available = all.filter(
        (m) => !exclude.includes(m) && !(noBreath && m === "souffle")
      );
      return available[0] || "appuis";
    },
    []
  );

  const getFinalAction = useCallback((): string => {
    if (!nextAction) return "";
    switch (actionPlanType) {
      case "maintenant":
        return nextAction;
      case "10-minutes":
        return `${nextAction} (dans 10 min)`;
      case "version-petite":
        return reducedAction || nextAction;
      case "pas-maintenant": {
        const anchorLabels: Record<TimeAnchor, string> = {
          "apres-ecran": "apr\u00e8s cet \u00e9cran",
          "10-minutes": "dans 10 minutes",
          "avant-ce-soir": "avant ce soir",
          "plus-tard": "plus tard aujourd\u2019hui",
        };
        const when = timeAnchor ? anchorLabels[timeAnchor] : "plus tard";
        return `${nextAction} (${when})`;
      }
      default:
        return nextAction;
    }
  }, [nextAction, actionPlanType, reducedAction, timeAnchor]);

  // ── Rendu par écran ──────────────────────────────────────

  const renderScreen = () => {
    switch (screen) {
      // ════════════════════════════════════════════════════
      // ÉCRAN 0 — ENTRÉE
      // ════════════════════════════════════════════════════
      case "entree":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-3">
              <h1 className="font-serif text-2xl text-t-beige">
                Avant de commencer
              </h1>
              <p className="font-body text-lg text-t-creme/70">
                L\u00e0, c&apos;est plut\u00f4t :
              </p>
            </div>
            <div className="w-full space-y-3">
              {([
                ["deborde", "\u00c7a d\u00e9borde"],
                ["charge", "C\u2019est charg\u00e9"],
                ["encore", "\u00c7a va encore"],
                ["calme", "Plut\u00f4t calme"],
              ] as [ActivationLevel, string][]).map(([value, label]) => (
                <AutoChip
                  key={value}
                  label={label}
                  onClick={() => {
                    setActivationLevel(value);
                    const flow = ACTIVATION_FLOW_MAP[value];
                    if (flow === LONG_FLOW) {
                      router.push(`/app/session?activation=${value}`);
                    } else {
                      setScreen("ressenti");
                    }
                  }}
                />
              ))}
            </div>
            <p className="font-inter text-xs text-t-creme/40 text-center">
              Sans r\u00e9fl\u00e9chir longtemps.
            </p>
            <div className="mt-4">
              <ExitLink label="Quitter" href="/app" />
            </div>
          </div>
        );

      // ════════════════════════════════════════════════════
      // ÉCRAN 1 — RESSENTI
      // ════════════════════════════════════════════════════
      case "ressenti":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-3">
              <h1 className="font-serif text-2xl text-t-beige">
                Traverser
              </h1>
              <p className="font-body text-lg text-t-creme/70">
                L\u00e0, c&apos;est surtout :
              </p>
            </div>
            <div className="w-full space-y-3">
              {(["serre", "agite", "lourd", "flou"] as Feeling[]).map((f) => (
                <AutoChip
                  key={f}
                  label={FEELING_LABELS[f]}
                  onClick={() => {
                    setCurrentFeeling(f);
                    setScreen("corps");
                  }}
                />
              ))}
              {showMoreFeelings &&
                (["vide", "bloque", "je-ne-sais-pas"] as Feeling[]).map((f) => (
                  <AutoChip
                    key={f}
                    label={FEELING_LABELS[f]}
                    onClick={() => {
                      setCurrentFeeling(f);
                      setScreen("corps");
                    }}
                  />
                ))}
            </div>
            {!showMoreFeelings && (
              <button
                type="button"
                onClick={() => setShowMoreFeelings(true)}
                className="font-inter text-[13px] text-t-creme/50 underline underline-offset-[3px]"
              >
                Voir plus
              </button>
            )}
            <p className="font-inter text-xs text-t-creme/40 text-center">
              Tu peux choisir le plus proche.
            </p>
          </div>
        );

      // ════════════════════════════════════════════════════
      // ÉCRAN 2 — CORPS
      // ════════════════════════════════════════════════════
      case "corps":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-3">
              <h1 className="font-serif text-2xl text-t-beige">
                Dans le corps
              </h1>
              <p className="font-body text-lg text-t-creme/70">
                O\u00f9 c&apos;est le plus marqu\u00e9 ?
              </p>
            </div>
            <div className="w-full grid grid-cols-2 gap-3">
              {(["poitrine", "ventre", "gorge", "tete", "epaules", "partout", "je-ne-sais-pas"] as BodyZone[]).map(
                (z) => (
                  <AutoChip
                    key={z}
                    label={BODY_LABELS[z]}
                    onClick={() => {
                      setBodyZone(z);
                      setScreen("bascule");
                    }}
                  />
                )
              )}
            </div>
            <p className="font-inter text-xs text-t-creme/40 text-center">
              Le plus proche suffit.
            </p>
          </div>
        );

      // ════════════════════════════════════════════════════
      // ÉCRAN 3 — BASCULE
      // ════════════════════════════════════════════════════
      case "bascule":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-4">
              <p className="font-body text-xl text-t-beige/90 italic">
                C&apos;est surtout dans la {bodyLabel}.
              </p>
              <p className="font-body text-lg text-t-creme/60">
                On revient juste au corps.
              </p>
            </div>
            <PrimaryButton onClick={() => setScreen("ancrer")}>
              Continuer
            </PrimaryButton>
          </div>
        );

      // ════════════════════════════════════════════════════
      // ÉCRAN 4 — ANCRER
      // ════════════════════════════════════════════════════
      case "ancrer":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-3">
              <h1 className="font-serif text-2xl text-t-beige">
                Ancrer
              </h1>
              <p className="font-body text-lg text-t-creme/70">
                On ralentit un peu, simplement.
              </p>
            </div>
            <div className="w-full space-y-3">
              {(["appuis", "autour", "souffle"] as AnchorMethod[]).map((m) => (
                <AutoChip
                  key={m}
                  label={ANCHOR_LABELS[m]}
                  onClick={() => {
                    setAnchorMethod(m);
                    setTriedMethods((prev) => [...prev, m]);
                    setScreen("exercice");
                  }}
                />
              ))}
            </div>
            <p className="font-inter text-xs text-t-creme/40 text-center">
              Choisis le plus simple maintenant.
            </p>
          </div>
        );

      // ════════════════════════════════════════════════════
      // ÉCRAN 5 — EXERCICE (conditionnel)
      // ════════════════════════════════════════════════════
      case "exercice":
        return renderExercise(anchorMethod!, () => setScreen("feedback"));

      // ════════════════════════════════════════════════════
      // ÉCRAN 6 — FEEDBACK
      // ════════════════════════════════════════════════════
      case "feedback":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-3">
              <h1 className="font-serif text-2xl text-t-beige">
                L\u00e0
              </h1>
              <p className="font-body text-lg text-t-creme/70">
                \u00c7a a boug\u00e9 un peu ?
              </p>
            </div>
            <div className="w-full space-y-3">
              {([
                ["un-peu", "un peu"],
                ["pareil", "pareil"],
                ["plus-agite", "plus agit\u00e9"],
                ["je-ne-sais-pas", "je ne sais pas trop"],
              ] as [AnchorEffect, string][]).map(([value, label]) => (
                <AutoChip
                  key={value}
                  label={label}
                  onClick={() => {
                    setAnchorEffect(value);
                    if (value === "un-peu" || value === "je-ne-sais-pas") {
                      setScreen("emerger");
                    } else if (value === "pareil") {
                      setScreen("branche-pareil");
                    } else {
                      setScreen("branche-agite");
                    }
                  }}
                />
              ))}
            </div>
          </div>
        );

      // ════════════════════════════════════════════════════
      // BRANCHE PAREIL
      // ════════════════════════════════════════════════════
      case "branche-pareil": {
        const alt = getAlternativeMethod(triedMethods, false);
        if (!altMethod) setAltMethod(alt);
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-4">
              <h1 className="font-serif text-2xl text-t-beige">
                On change l\u00e9g\u00e8rement
              </h1>
              <p className="font-body text-lg text-t-creme/60">
                Ce n&apos;est pas grave si c&apos;est pareil.
              </p>
              <p className="font-body text-lg text-t-creme/60">
                On essaie autrement.
              </p>
            </div>
            <PrimaryButton
              onClick={() => {
                const method = altMethod || alt;
                setTriedMethods((prev) => [...prev, method]);
                setScreen("branche-pareil-exercice");
              }}
            >
              Continuer
            </PrimaryButton>
          </div>
        );
      }

      case "branche-pareil-exercice":
        return renderExercise(
          altMethod || getAlternativeMethod(triedMethods.slice(0, -1), false),
          () => setScreen("branche-pareil-feedback")
        );

      case "branche-pareil-feedback":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-3">
              <h1 className="font-serif text-2xl text-t-beige">
                L\u00e0
              </h1>
              <p className="font-body text-lg text-t-creme/70">
                \u00c7a a boug\u00e9 ?
              </p>
            </div>
            <div className="w-full space-y-3">
              {([
                ["un-peu", "un peu mieux"],
                ["pareil", "pareil"],
                ["plus-agite", "plus agit\u00e9"],
              ] as [AnchorEffect, string][]).map(([value, label]) => (
                <AutoChip
                  key={value}
                  label={label}
                  onClick={() => {
                    setAnchorEffect(value);
                    setScreen("emerger");
                  }}
                />
              ))}
            </div>
          </div>
        );

      // ════════════════════════════════════════════════════
      // BRANCHE PLUS AGITÉ
      // ════════════════════════════════════════════════════
      case "branche-agite": {
        const safeMethod = getAlternativeMethod(triedMethods, true);
        if (!altMethod) setAltMethod(safeMethod);
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-4">
              <h1 className="font-serif text-2xl text-t-beige">
                On change
              </h1>
              <p className="font-body text-lg text-t-creme/60">
                On ne force pas.
              </p>
              <p className="font-body text-lg text-t-creme/60">
                On quitte cette mani\u00e8re-l\u00e0.
              </p>
            </div>
            <PrimaryButton
              onClick={() => {
                setTriedMethods((prev) => [...prev, altMethod || safeMethod]);
                setScreen("branche-agite-exercice");
              }}
            >
              Continuer
            </PrimaryButton>
          </div>
        );
      }

      case "branche-agite-exercice":
        return renderExercise(
          altMethod || getAlternativeMethod(triedMethods.slice(0, -1), true),
          () => setScreen("emerger")
        );

      // ════════════════════════════════════════════════════
      // ÉCRAN 7 — ÉMERGER
      // ════════════════════════════════════════════════════
      case "emerger": {
        const first3 = emergePool.slice(0, 3);
        const next3 = emergePool.slice(3, 6);
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-3">
              <h1 className="font-serif text-2xl text-t-beige">
                \u00c9merger
              </h1>
              <p className="font-body text-lg text-t-creme/70">
                Qu&apos;est-ce qui est le plus simple maintenant ?
              </p>
            </div>
            <div className="w-full space-y-3">
              {first3.map((action) => (
                <AutoChip
                  key={action}
                  label={action}
                  onClick={() => {
                    setNextAction(action);
                    setScreen("aligner");
                  }}
                />
              ))}
              {showMoreActions &&
                next3.map((action) => (
                  <AutoChip
                    key={action}
                    label={action}
                    onClick={() => {
                      setNextAction(action);
                      setScreen("aligner");
                    }}
                  />
                ))}
            </div>
            {!showMoreActions && (
              <button
                type="button"
                onClick={() => setShowMoreActions(true)}
                className="font-inter text-[13px] text-t-creme/50 underline underline-offset-[3px]"
              >
                Autre id\u00e9e
              </button>
            )}
          </div>
        );
      }

      // ════════════════════════════════════════════════════
      // ÉCRAN 8 — ALIGNER
      // ════════════════════════════════════════════════════
      case "aligner":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-3">
              <h1 className="font-serif text-2xl text-t-beige">
                Aligner
              </h1>
              <p className="font-body text-lg text-t-creme/70">
                Choisis la version la plus simple.
              </p>
            </div>
            <div className="w-full space-y-3">
              {([
                ["maintenant", "je le fais maintenant"],
                ["10-minutes", "je le fais dans 10 minutes"],
                ["version-petite", "j\u2019en fais une version plus petite"],
                ["pas-maintenant", "pas maintenant, mais aujourd\u2019hui"],
              ] as [ActionPlanType, string][]).map(([value, label]) => (
                <AutoChip
                  key={value}
                  label={label}
                  onClick={() => {
                    setActionPlanType(value);
                    if (value === "version-petite") {
                      setScreen("sous-ecran-reduit");
                    } else if (value === "pas-maintenant") {
                      setScreen("sous-ecran-repere");
                    } else {
                      setScreen("check-final");
                    }
                  }}
                />
              ))}
            </div>
          </div>
        );

      // ════════════════════════════════════════════════════
      // SOUS-ÉCRAN — VERSION PLUS PETITE
      // ════════════════════════════════════════════════════
      case "sous-ecran-reduit": {
        const reduced = nextAction ? REDUCED_ACTIONS[nextAction] || nextAction : "";
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-3">
              <h1 className="font-serif text-2xl text-t-beige">
                Encore plus simple
              </h1>
              <p className="font-body text-lg text-t-creme/60">
                On r\u00e9duit encore.
              </p>
            </div>
            <div className="t-card p-6 text-center">
              <p className="font-body text-xl text-t-beige/90 italic">
                {reduced}
              </p>
            </div>
            <PrimaryButton
              onClick={() => {
                setReducedAction(reduced);
                setScreen("check-final");
              }}
            >
              \u00c7a me va
            </PrimaryButton>
          </div>
        );
      }

      // ════════════════════════════════════════════════════
      // SOUS-ÉCRAN — REPÈRE
      // ════════════════════════════════════════════════════
      case "sous-ecran-repere":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-3">
              <h1 className="font-serif text-2xl text-t-beige">
                Ton rep\u00e8re
              </h1>
              <p className="font-body text-lg text-t-creme/70">
                Choisis un rep\u00e8re.
              </p>
            </div>
            <div className="w-full space-y-3">
              {([
                ["apres-ecran", "apr\u00e8s cet \u00e9cran"],
                ["10-minutes", "dans 10 minutes"],
                ["avant-ce-soir", "avant ce soir"],
                ["plus-tard", "plus tard aujourd\u2019hui"],
              ] as [TimeAnchor, string][]).map(([value, label]) => (
                <AutoChip
                  key={value}
                  label={label}
                  onClick={() => {
                    setTimeAnchor(value);
                    setScreen("check-final");
                  }}
                />
              ))}
            </div>
          </div>
        );

      // ════════════════════════════════════════════════════
      // ÉCRAN 9 — CHECK FINAL
      // ════════════════════════════════════════════════════
      case "check-final":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-3">
              <h1 className="font-serif text-2xl text-t-beige">
                En repartant
              </h1>
              <p className="font-body text-lg text-t-creme/70">
                L\u00e0, c&apos;est plut\u00f4t :
              </p>
            </div>
            <div className="w-full space-y-3">
              {([
                ["prochain-pas", "juste un prochain pas"],
                ["calme", "un peu plus de calme"],
                ["clarte", "un peu plus de clart\u00e9"],
                ["rien-special", "rien de sp\u00e9cial, mais je continue"],
              ] as [EndState, string][]).map(([value, label]) => (
                <AutoChip
                  key={value}
                  label={label}
                  onClick={() => {
                    setEndState(value);
                    setScreen("synthese");
                  }}
                />
              ))}
            </div>
          </div>
        );

      // ════════════════════════════════════════════════════
      // ÉCRAN 10 — SYNTHÈSE
      // ════════════════════════════════════════════════════
      case "synthese": {
        const finalAction = getFinalAction();
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <h1 className="font-serif text-2xl text-t-beige text-center">
              Ta travers\u00e9e
            </h1>

            <div className="t-card p-6 w-full space-y-4">
              <SynthRow
                label="Ce qui \u00e9tait l\u00e0"
                value={currentFeeling ? FEELING_LABELS[currentFeeling] : "\u2014"}
              />
              <SynthRow
                label="Dans le corps"
                value={bodyZone ? BODY_LABELS[bodyZone] : "\u2014"}
              />
              <SynthRow
                label="Ce qui a aid\u00e9"
                value={anchorMethod ? ANCHOR_LABELS[anchorMethod] : "\u2014"}
              />
              <SynthRow
                label="Le prochain pas"
                value={finalAction || "\u2014"}
              />
            </div>

            <p className="font-body text-lg text-t-creme/60 italic text-center">
              Tu as pris un moment pour toi.
            </p>

            <div className="w-full space-y-3">
              <PrimaryButton onClick={() => router.push("/app")}>
                Retour \u00e0 l&apos;accueil
              </PrimaryButton>
              <SecondaryButton
                onClick={() => {
                  // Reset tout et recommencer
                  setScreen("entree");
                  setActivationLevel(null);
                  setCurrentFeeling(null);
                  setBodyZone(null);
                  setAnchorMethod(null);
                  setAnchorEffect(null);
                  setNextAction(null);
                  setActionPlanType(null);
                  setReducedAction(null);
                  setTimeAnchor(null);
                  setEndState(null);
                  setShowMoreFeelings(false);
                  setShowMoreActions(false);
                  setTriedMethods([]);
                  setAltMethod(null);
                }}
                className="w-full"
              >
                Refaire plus tard
              </SecondaryButton>
            </div>

            {/* ── Bridge optionnel vers traversée complète ── */}
            <div className="mt-8 text-center">
              <p className="font-inter text-[13px] text-t-creme/40 mb-2">
                Si tu veux aller un peu plus loin, tu peux faire une travers\u00e9e compl\u00e8te.
              </p>
              <SecondaryButton
                onClick={() => router.push("/app/session")}
                className="text-sm"
              >
                Continuer
              </SecondaryButton>
            </div>
          </div>
        );
      }
    }
  };

  // ── Exercice conditionnel ────────────────────────────────
  function renderExercise(method: AnchorMethod, onDone: () => void) {
    switch (method) {
      case "appuis":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <h1 className="font-serif text-2xl text-t-beige">Appuis</h1>
            <div className="text-center space-y-4">
              <p className="font-body text-xl text-t-beige/90 leading-relaxed">
                Sens 3 points d&apos;appui :
              </p>
              <p className="font-body text-lg text-t-creme/70 leading-relaxed">
                tes pieds,
                <br />
                ton dos ou ton bassin,
                <br />
                tes mains.
              </p>
            </div>
            <p className="font-inter text-xs text-t-creme/40">
              Reste avec \u00e7a 10 secondes.
            </p>
            <Timer10 onComplete={onDone} />
          </div>
        );

      case "autour":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <h1 className="font-serif text-2xl text-t-beige">Autour</h1>
            <div className="text-center space-y-4">
              <p className="font-body text-xl text-t-beige/90 leading-relaxed">
                Regarde autour de toi.
              </p>
              <p className="font-body text-lg text-t-creme/70 leading-relaxed">
                Rep\u00e8re :
                <br />
                1 chose stable,
                <br />
                1 chose claire,
                <br />
                1 chose immobile.
              </p>
            </div>
            <p className="font-inter text-xs text-t-creme/40">
              Prends 10 secondes.
            </p>
            <Timer10 onComplete={onDone} />
          </div>
        );

      case "souffle":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <h1 className="font-serif text-2xl text-t-beige">Souffle</h1>
            <div className="text-center space-y-4">
              <p className="font-body text-xl text-t-beige/90 leading-relaxed">
                Inspire doucement.
              </p>
              <p className="font-body text-lg text-t-creme/70 leading-relaxed">
                Puis laisse l&apos;air sortir un peu plus lentement.
                <br />
                Juste 3 fois.
              </p>
            </div>
            <p className="font-inter text-xs text-t-creme/40">
              Sans forcer.
            </p>
            <BreathCounter onComplete={onDone} />
          </div>
        );
    }
  }

  return (
    <ScreenContainer overlayOpacity={45}>
      <div className="py-12">
        {renderScreen()}
      </div>
    </ScreenContainer>
  );
}

// ── Ligne de synthèse ──────────────────────────────────────
function SynthRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-4">
      <span className="font-inter text-sm text-t-creme/50 shrink-0">
        {label}
      </span>
      <span className="font-body text-lg text-t-beige/90 text-right italic">
        {value}
      </span>
    </div>
  );
}
