"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { trackEvent } from "@/lib/supabase-store";
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

// ── Timer circulaire (10s) ─────────────────────────────────
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
      <PrimaryButton onClick={onComplete}>
        C&apos;est fait
      </PrimaryButton>
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

  // ── Exit transition animation (synthese → accueil) ──
  useEffect(() => {
    if (screen !== "exit-transition") return;
    setExitOpacity(0);
    const fadeIn = setTimeout(() => setExitOpacity(1), 16);
    const fadeOut = setTimeout(() => setExitOpacity(0), 1050);
    const done = setTimeout(() => router.push("/app"), 1200);
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
                      router.push(`/app/session?activation=${value}`);
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
                Tu peux rester sur la version simple ou choisir le parcours complet.
              </p>
            </div>
            <div className="w-full space-y-3">
              <div>
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
                  Version simple (2–3 min)
                </PrimaryButton>
                <p className="font-inter text-xs text-t-creme/40 text-center mt-1">le plus rapide</p>
              </div>
              <div>
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
                  Parcours complet (5–10 min)
                </SecondaryButton>
                <p className="font-inter text-xs text-t-creme/40 text-center mt-1">le plus guidé</p>
              </div>
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
                À partir de ce que tu as posé :
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
                Regarde 3 choses autour de toi.
              </p>
            </div>
            <p className="font-inter text-xs text-t-creme/40">
              Juste quelques secondes.
            </p>
            <PrimaryButton onClick={onDone}>
              C&apos;est fait
            </PrimaryButton>
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
