"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { trackEvent } from "@/lib/supabase-store";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { ExitLink } from "@/components/ui/ExitLink";
import { BreathingGuide } from "@/components/BreathingGuide";
import { GroundingGuide } from "@/components/GroundingGuide";
import { GazeGuide } from "@/components/GazeGuide";

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
  | "onboarding"
  | "transition"
  | "exit-transition"
  | "entree"
  | "propose-long"
  | "ressenti"
  | "corps"
  | "ancrer"
  | "exercice"
  | "feedback"
  | "branche-pareil"
  | "branche-pareil-exercice"
  | "branche-pareil-feedback"
  | "branche-agite"
  | "branche-agite-exercice"
  | "emerger"
  | "synthese";

type ActivationLevel = "deborde" | "charge" | "encore" | "calme";
type Feeling = "serre" | "agite" | "lourd" | "flou" | "vide" | "bloque" | "je-ne-sais-pas";
type BodyZone = "poitrine" | "ventre" | "gorge" | "tete" | "epaules" | "partout" | "je-ne-sais-pas";
type AnchorMethod = "appuis" | "autour" | "souffle";
type AnchorEffect = "un-peu" | "pareil" | "plus-agite" | "je-ne-sais-pas";

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
  "appuis": "sentir mes pieds",
  "autour": "regarder autour",
  "souffle": "respirer",
};

// Actions émerger — pool complet
const EMERGE_ACTIONS = [
  "relâcher les épaules",
  "poser mes pieds au sol un moment",
  "regarder au loin 10 secondes",
  "m'asseoir 2 minutes",
  "enlever une stimulation",
  "boire un verre d'eau",
  "ouvrir une fenêtre",
] as const;


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
  const { user } = useAuth();

  // ── Detect if entered via soft-switch (skip entry screen) ──
  const skipEntree = searchParams.get("skip") === "entree";
  const onboardingSeen = typeof window !== "undefined" && localStorage.getItem("tracea_onboarding_seen") === "true";

  // ── State ──
  const [screen, setScreen] = useState<Screen>(skipEntree ? "ressenti" : onboardingSeen ? "entree" : "onboarding");
  const [transitionOpacity, setTransitionOpacity] = useState(0);
  const [exitOpacity, setExitOpacity] = useState(0);
  const [activationLevel, setActivationLevel] = useState<ActivationLevel | null>(null);
  const [currentFeeling, setCurrentFeeling] = useState<Feeling | null>(null);
  const [bodyZone, setBodyZone] = useState<BodyZone | null>(null);
  const [anchorMethod, setAnchorMethod] = useState<AnchorMethod | null>(null);
  const [anchorEffect, setAnchorEffect] = useState<AnchorEffect | null>(null);
  const [nextAction, setNextAction] = useState<string | null>(null);
  const [showMoreFeelings, setShowMoreFeelings] = useState(false);
  const [emergeOffset, setEmergeOffset] = useState(0);

  // Méthodes déjà essayées (pour ne jamais reproposer)
  const [triedMethods, setTriedMethods] = useState<AnchorMethod[]>([]);
  // Branche pareil: méthode alternative
  const [altMethod, setAltMethod] = useState<AnchorMethod | null>(null);

  const [emergePool] = useState(() => [...EMERGE_ACTIONS]);

  // ── Helpers ──
  // ── Transition animation (onboarding → entree) ──
  useEffect(() => {
    if (screen !== "transition") return;
    setTransitionOpacity(0);
    const fadeIn = setTimeout(() => setTransitionOpacity(1), 16);
    const fadeOut = setTimeout(() => setTransitionOpacity(0), 1000);
    const done = setTimeout(() => setScreen("entree"), 1200);
    return () => {
      clearTimeout(fadeIn);
      clearTimeout(fadeOut);
      clearTimeout(done);
    };
  }, [screen]);

  // ── Exit transition animation (synthese → post-session ou accueil) ──
  useEffect(() => {
    if (screen !== "exit-transition") return;
    setExitOpacity(0);
    const fadeIn = setTimeout(() => setExitOpacity(1), 16);
    const fadeOut = setTimeout(() => setExitOpacity(0), 1050);
    const done = setTimeout(() => {
      const seen = localStorage.getItem("tracea_post_session_seen") === "true";
      router.push(seen ? "/app" : "/app/post-session");
    }, 1200);
    return () => {
      clearTimeout(fadeIn);
      clearTimeout(fadeOut);
      clearTimeout(done);
    };
  }, [screen, router]);

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

  // ── Rendu par écran ──────────────────────────────────────

  const renderScreen = () => {
    switch (screen) {
      // ════════════════════════════════════════════════════
      // ONBOARDING — Écran d'accueil
      // ════════════════════════════════════════════════════
      case "onboarding":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10">
            <div className="text-center space-y-6">
              <p className="font-serif text-2xl text-t-beige leading-relaxed">
                Tu ne vas pas mal.
              </p>
              <p className="font-serif text-2xl text-t-beige leading-relaxed">
                Tu es en surcharge.
              </p>
              <p className="font-body text-lg text-t-creme/70 leading-relaxed">
                On va juste revenir au corps.
              </p>
              <p className="font-body text-lg text-t-creme/70 leading-relaxed">
                Quelques minutes suffisent.
              </p>
            </div>
            <PrimaryButton onClick={() => {
              localStorage.setItem("tracea_onboarding_seen", "true");
              setScreen("transition");
            }}>
              Commencer
            </PrimaryButton>
          </div>
        );

      // ════════════════════════════════════════════════════
      // ════════════════════════════════════════════════════
      // TRANSITION — Micro-pause sensorielle
      // ════════════════════════════════════════════════════
      case "transition":
        return (
          <div
            className="flex items-center justify-center min-h-[80vh]"
            style={{ opacity: transitionOpacity, transition: "opacity 200ms ease" }}
          >
            <p className="font-serif text-2xl text-t-beige">On ralentit.</p>
          </div>
        );

      // ════════════════════════════════════════════════════
      // EXIT TRANSITION — Micro-pause de sortie
      // ════════════════════════════════════════════════════
      case "exit-transition":
        return (
          <div
            className="flex items-center justify-center min-h-[80vh]"
            style={{ opacity: exitOpacity, transition: "opacity 150ms ease" }}
          >
            <p className="font-serif text-2xl text-t-beige">C&apos;est suffisant pour maintenant.</p>
          </div>
        );

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
                ["deborde", "Très chargé"],
                ["charge", "Assez chargé"],
                ["encore", "Un peu chargé"],
                ["calme", "Plutôt calme"],
              ] as [ActivationLevel, string][]).map(([value, label]) => (
                <AutoChip
                  key={value}
                  label={label}
                  onClick={() => {
                    setActivationLevel(value);
                    trackEvent(user?.id ?? null, "session_start", {
                      mode: "court",
                      intensity: value,
                      context: null,
                    });
                    if (ACTIVATION_FLOW_MAP[value] === LONG_FLOW) {
                      setScreen("propose-long");
                    } else {
                      setScreen("ressenti");
                    }
                  }}
                />
              ))}
            </div>
            <p className="font-inter text-xs text-t-creme/40 text-center">
              Choisis le plus proche maintenant.
            </p>
            <div className="mt-4">
              <ExitLink label="Quitter" href="/app" />
            </div>
          </div>
        );

      // ════════════════════════════════════════════════════
      // TRANSITION COURT → LONG
      // ════════════════════════════════════════════════════
      case "propose-long":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-4">
              <p className="font-body text-lg text-t-creme/70 leading-relaxed">
                On peut prendre un peu plus de temps pour aller plus loin.
              </p>
              <p className="font-body text-base text-t-creme/50">
                Environ 5 à 6 minutes.
              </p>
            </div>
            <PrimaryButton onClick={() => router.push(`/app/session?activation=${activationLevel}`)}>
              Continuer
            </PrimaryButton>
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
                Là
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
                    trackEvent(user?.id ?? null, "step_complete", { step: "ressenti", mode: "court", value: f });
                    setScreen("corps");
                  }}
                />
              ))}
              {showMoreFeelings &&
                (["vide", "bloque"] as Feeling[]).map((f) => (
                  <AutoChip
                    key={f}
                    label={FEELING_LABELS[f]}
                    onClick={() => {
                      setCurrentFeeling(f);
                      trackEvent(user?.id ?? null, "step_complete", { step: "ressenti", mode: "court", value: f });
                      setScreen("corps");
                    }}
                  />
                ))}
              <AutoChip
                label="je ne sais pas"
                onClick={() => {
                  setCurrentFeeling("je-ne-sais-pas");
                  trackEvent(user?.id ?? null, "step_complete", { step: "ressenti", mode: "court", value: "je-ne-sais-pas" });
                  setScreen("corps");
                }}
              />
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
              {(["poitrine", "ventre", "tete", "epaules"] as BodyZone[]).map((z) => (
                <AutoChip
                  key={z}
                  label={BODY_LABELS[z]}
                  onClick={() => {
                    setBodyZone(z);
                    trackEvent(user?.id ?? null, "step_complete", { step: "corps", mode: "court", value: z });
                    setScreen("ancrer");
                  }}
                />
              ))}
              <AutoChip
                label="autre / je ne sais pas"
                onClick={() => {
                  setBodyZone("je-ne-sais-pas");
                  trackEvent(user?.id ?? null, "step_complete", { step: "corps", mode: "court", value: "je-ne-sais-pas" });
                  setScreen("ancrer");
                }}
              />
            </div>
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
                    trackEvent(user?.id ?? null, "step_complete", { step: "ancrer", mode: "court", value: m });
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
              <p className="font-body text-sm text-t-creme/40">
                Prends juste une seconde.
              </p>
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
                      setScreen("branche-pareil");
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
      case "branche-pareil":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-4">
              <h1 className="font-serif text-2xl text-t-beige">
                On essaie autrement
              </h1>
            </div>
            <PrimaryButton onClick={() => setScreen("branche-pareil-exercice")}>
              Continuer
            </PrimaryButton>
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
                    setScreen("emerger");
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
        const visibleActions = emergePool.slice(emergeOffset, emergeOffset + 3);
        const hasMore = emergeOffset + 3 < emergePool.length;
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-3">
              <h1 className="font-serif text-2xl text-t-beige">
                Maintenant
              </h1>
              <p className="font-body text-lg text-t-creme/70">
                À partir de ce qui s&apos;est éclairci…
              </p>
              <p className="font-body text-lg text-t-creme/70">
                Qu&apos;est-ce qui est le plus simple maintenant ?
              </p>
            </div>
            <div className="w-full space-y-3">
              {visibleActions.map((action) => (
                <AutoChip
                  key={action}
                  label={action}
                  onClick={() => {
                    setNextAction(action);
                    trackEvent(user?.id ?? null, "step_complete", { step: "emerger", mode: "court", value: action });
                    trackEvent(user?.id ?? null, "session_end", { mode: "court" });
                    setScreen("synthese");
                  }}
                />
              ))}
            </div>
            {hasMore && (
              <button
                type="button"
                onClick={() => setEmergeOffset((o) => o + 3)}
                className="font-inter text-[13px] text-t-creme/50 underline underline-offset-[3px]"
              >
                Autre idée
              </button>
            )}
          </div>
        );
      }

      // ════════════════════════════════════════════════════
      // ÉCRAN — SYNTHÈSE
      // ════════════════════════════════════════════════════
      case "synthese":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <h1 className="font-serif text-2xl text-t-beige text-center">
              Ta traversée
            </h1>

            <div className="t-card p-6 w-full space-y-4">
              <SynthRow
                label="Ce qui était là"
                value={currentFeeling === "je-ne-sais-pas" ? "quelque chose de flou" : (currentFeeling ? FEELING_LABELS[currentFeeling] : "\—")}
              />
              <SynthRow
                label="Dans le corps"
                value={bodyZone === "je-ne-sais-pas" ? "pas clairement localisé" : (bodyZone ? BODY_LABELS[bodyZone] : "\—")}
              />
              <SynthRow
                label="Ce qui a aidé"
                value={triedMethods.length > 0 ? triedMethods.map(m => ANCHOR_LABELS[m]).join(", puis ") : (anchorMethod ? ANCHOR_LABELS[anchorMethod] : "—")}
              />
              <SynthRow
                label="Le prochain pas"
                value={nextAction || "\—"}
              />
            </div>

            <p className="font-body text-base text-t-creme/50 text-center">
              C&apos;est suffisant pour maintenant.
            </p>
            <PrimaryButton onClick={() => setScreen("exit-transition")}>
              Retour à l&apos;accueil
            </PrimaryButton>
            <button
              type="button"
              onClick={() => router.push("/app/session")}
              className="font-inter text-[13px] text-t-creme/50 underline underline-offset-[3px]"
            >
              Aller plus loin
            </button>
          </div>
        );
    }
  };

  // ── Exercice conditionnel ────────────────────────────────
  function renderExercise(method: AnchorMethod, onDone: () => void) {
    switch (method) {
      case "appuis":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <h1 className="font-serif text-2xl text-t-beige">Appuis</h1>
            <GroundingGuide onComplete={onDone} />
          </div>
        );

      case "autour":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <h1 className="font-serif text-2xl text-t-beige">Autour</h1>
            <GazeGuide onComplete={onDone} />
          </div>
        );

      case "souffle":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <h1 className="font-serif text-2xl text-t-beige">Souffle</h1>
            <BreathingGuide onComplete={onDone} />
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
