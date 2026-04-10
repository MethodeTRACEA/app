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
  | "propose-long"
  | "ressenti"
  | "corps"
  | "ancrer"
  | "exercice"
  | "feedback"
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
          {phase === "inspire" ? "Inspire\…" : "Expire\…"}
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
  const [red컚ction, setRed컚ction] = useState<string | null>(null);
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
        return red컚ction || nextAction;
      case "pas-maintenant": {
        const anchorLabels: Record<TimeAnchor, string> = {
          "apres-ecran": "après cet écran",
          "10-minutes": "dans 10 minutes",
          "avant-ce-soir": "avant ce soir",
          "plus-tard": "plus tard aujourd’hui",
        };
        const when = timeAnchor ? anchorLabels[timeAnchor] : "plus tard";
        return `${nextAction} (${when})`;
      }
      default:
        return nextAction;
    }
  }, [nextAction, actionPlanType, red컚ction, timeAnchor]);

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
                Là, c&apos;est plutôt :
              </p>
            </div>
            <div className="w-full space-y-3">
              {([
                ["deborde", "Ça déborde"],
                ["charge", "C’est chargé"],
                ["encore", "Ça va encore"],
                ["calme", "Plutôt calme"],
              ] as [ActivationLevel, string][]).map(([value, label]) => (
                <AutoChip
                  key={value}
                  label={label}
                  onClick={() => {
                    setActivationLevel(value);
                    setScreen("ressenti");
                  }}
                />
              ))}
            </div>
            <p className="font-inter text-xs text-t-creme/40 text-center">
              Sans réfléchir longtemps.
            </p>
            <div className="mt-4">
              <ExitLink label="Quitter" href="/app" />
            </div>
          </div>
        );

      // ════════════════════════════════════════════════════
      // PROPOSITION BASCULE COURT → LONG
      // ════════════════════════════════════════════════════
      case "propose-long":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-4">
              <h1 className="font-serif text-2xl text-t-beige">
                Continuer
              </h1>
              <p className="font-body text-lg text-t-creme/70 leading-relaxed">
                On peut te proposer une version plus complète de la traversée.
                <br />
                Tu veux continuer ici ou passer au parcours complet ?
              </p>
            </div>
            <div className="w-full space-y-3">
              <PrimaryButton
                onClick={() => {
                  console.info("[TRACEA flow_router]", JSON.stringify({
                    source: "flow_router",
                    current_flow: "short",
                    proposed_flow: "long",
                    router_reason: "activation_level_" + (activationLevel || "unknown"),
                    source_step: "entree",
                    user_choice: "stay",
                    next_flow: "short",
                    next_screen: "ressenti",
                  }));
                  setScreen("ressenti");
                }}
              >
                Continuer ici
              </PrimaryButton>
              <SecondaryButton
                onClick={() => {
                  console.info("[TRACEA flow_router]", JSON.stringify({
                    source: "flow_router",
                    current_flow: "short",
                    proposed_flow: "long",
                    router_reason: "activation_level_" + (activationLevel || "unknown"),
                    source_step: "entree",
                    user_choice: "switch",
                    next_flow: "long",
                    next_screen: "session",
                  }));
                  router.push(`/app/session?activation=${activationLevel}`);
                }}
              >
                Passer au parcours complet
              </SecondaryButton>
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
                Là, c&apos;est surtout :
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
                Autre mot
              </button>
            )}
            <p className="font-inter text-xs text-t-creme/40 text-center">
              Le plus proche suffit.
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
                Où c&apos;est le plus marqué ?
              </p>
            </div>
            <div className="w-full space-y-3">
              {(["poitrine", "ventre", "gorge", "tete", "epaules"] as BodyZone[]).map((z) => (
                <AutoChip
                  key={z}
                  label={BODY_LABELS[z]}
                  onClick={() => {
                    setBodyZone(z);
                    setScreen("ancrer");
                  }}
                />
              ))}
              <div className="opacity-50 space-y-3 pt-1">
                {(["partout", "je-ne-sais-pas"] as BodyZone[]).map((z) => (
                  <AutoChip
                    key={z}
                    label={BODY_LABELS[z]}
                    onClick={() => {
                      setBodyZone(z);
                      setScreen("ancrer");
                    }}
                  />
                ))}
              </div>
            </div>
            <p className="font-inter text-xs text-t-creme/40 text-center">
              Choisis l&apos;endroit le plus marqu&eacute;, m&ecirc;me si ce n&apos;est pas parfait.
            </p>
          </div>
        );

      // ════════════════════════════════════════════════════
      // ÉCRAN 3 — ANCRER
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
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setAnchorMethod(m);
                    setTriedMethods((prev) => [...prev, m]);
                    setScreen("exercice");
                  }}
                  className="w-full text-center rounded-full font-inter text-sm font-medium px-5 py-3 cursor-pointer transition-all duration-200 bg-t-brume/30 text-t-beige border border-[rgba(232,216,199,0.45)] hover:bg-t-brume/55 hover:border-[rgba(232,216,199,0.70)] hover:text-white"
                >
                  {ANCHOR_LABELS[m]}
                </button>
              ))}
            </div>
            <p className="font-inter text-xs text-t-creme/60 text-center">
              Commence par le plus concret.
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
                Là
              </h1>
              <p className="font-body text-lg text-t-creme/70">
                Là, c&apos;est comment ?
              </p>
            </div>
            <div className="w-full space-y-3">
              {([
                ["pareil", "pareil"],
                ["un-peu", "un peu"],
                ["plus-agite", "plus agité"],
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
                      const alt = getAlternativeMethod(triedMethods, false);
                      setAltMethod(alt);
                      setTriedMethods((prev) => [...prev, alt]);
                      setScreen("branche-pareil-exercice");
                    } else {
                      setScreen("branche-agite");
                    }
                  }}
                />
              ))}
            </div>
            <p className="font-inter text-xs text-t-creme/30 text-center">
              Il n&apos;y a pas de bonne réponse.
            </p>
          </div>
        );

      // ════════════════════════════════════════════════════
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
                Là
              </h1>
              <p className="font-body text-lg text-t-creme/70">
                Ça a bougé ?
              </p>
            </div>
            <div className="w-full space-y-3">
              {([
                ["un-peu", "un peu mieux"],
                ["pareil", "pareil"],
                ["plus-agite", "plus agité"],
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
                On quitte cette manière-là.
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
                Émerger
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
                Autre idée
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
                ["version-petite", "j’en fais une version plus petite"],
                ["pas-maintenant", "pas maintenant, mais aujourd’hui"],
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
                On réduit encore.
              </p>
            </div>
            <div className="t-card p-6 text-center">
              <p className="font-body text-xl text-t-beige/90 italic">
                {reduced}
              </p>
            </div>
            <PrimaryButton
              onClick={() => {
                setRed컚ction(reduced);
                setScreen("check-final");
              }}
            >
              Ça me va
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
                Ton repère
              </h1>
              <p className="font-body text-lg text-t-creme/70">
                Choisis un repère.
              </p>
            </div>
            <div className="w-full space-y-3">
              {([
                ["apres-ecran", "après cet écran"],
                ["10-minutes", "dans 10 minutes"],
                ["avant-ce-soir", "avant ce soir"],
                ["plus-tard", "plus tard aujourd’hui"],
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
                Là, c&apos;est plutôt :
              </p>
            </div>
            <div className="w-full space-y-3">
              {([
                ["prochain-pas", "juste un prochain pas"],
                ["calme", "un peu plus de calme"],
                ["clarte", "un peu plus de clarté"],
                ["rien-special", "rien de spécial, mais je continue"],
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
              Ta traversée
            </h1>

            <div className="t-card p-6 w-full space-y-4">
              <SynthRow
                label="Ce qui était là"
                value={currentFeeling ? FEELING_LABELS[currentFeeling] : "\—"}
              />
              <SynthRow
                label="Dans le corps"
                value={bodyZone ? BODY_LABELS[bodyZone] : "\—"}
              />
              <SynthRow
                label="Ce qui a aidé"
                value={anchorMethod ? ANCHOR_LABELS[anchorMethod] : "\—"}
              />
              <SynthRow
                label="Le prochain pas"
                value={finalAction || "\—"}
              />
            </div>

            <p className="font-body text-lg text-t-creme/60 italic text-center">
              Tu as pris un moment pour toi.
            </p>

            <div className="w-full space-y-3">
              <PrimaryButton onClick={() => router.push("/app")}>
                Retour à l&apos;accueil
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
                  setRed컚ction(null);
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
                Si tu veux aller un peu plus loin, tu peux faire une traversée complète.
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
              Juste quelques secondes.
            </p>
            <p className="font-inter text-xs text-t-creme/30 text-center">
              Tu n&apos;as rien à réussir ici.
            </p>
            <PrimaryButton onClick={onDone}>
              C&apos;est fait
            </PrimaryButton>
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
                Repère :
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
