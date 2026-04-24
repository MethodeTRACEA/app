"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { trackEvent } from "@/lib/supabase-store";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { ExitLink } from "@/components/ui/ExitLink";
import { MiniDepot } from "@/components/MiniDepot";
import { InstallPrompt } from "@/components/InstallPrompt";
import { BreathingGuide } from "@/components/BreathingGuide";
import { GroundingGuide } from "@/components/GroundingGuide";
import { GazeGuide } from "@/components/GazeGuide";
import { getTopAnchorMethod } from "@/lib/supabase-store";

// ── Flow routing constants ─────────────────────────────────
const SHORT_FLOW_V2 = "short" as const;
const LONG_FLOW = "long" as const;

type FlowRoute = typeof SHORT_FLOW_V2 | typeof LONG_FLOW;

const ACTIVATION_FLOW_MAP: Record<string, FlowRoute> = {
  deborde: SHORT_FLOW_V2,
  charge: SHORT_FLOW_V2,
  encore: LONG_FLOW,
  calme: LONG_FLOW,
  stop: SHORT_FLOW_V2,
};

const ENTRY_MESSAGES: Record<ActivationLevel, string> = {
  deborde: "Ok. On va ralentir ça ensemble.",
  charge: "Ok. On va ralentir avant de répondre.",
  encore: "Ok. On va se poser un instant avant d'y aller.",
  calme: "Ok. On va laisser redescendre un peu.",
  stop: "Ok. On ralentit juste un instant.",
};

const RESSENTI_INTRO: Record<ActivationLevel, string> = {
  deborde: "On ralentit juste un instant.",
  charge: "Avant de répondre, on ralentit juste un instant.",
  encore: "Reviens d'abord dans tes appuis.",
  calme: "On va laisser un peu d'espace.",
  stop: "On ralentit juste un instant.",
};

// ═══════════════════════════════════════════════════════════
// TRACÉA — Traversée courte V2 (3 étapes, ultra-optimisée)
// Flow : Entrée → Ressenti → Corps → Bascule → Ancrer →
//        Exercice → Feedback → (branche) → Émerger →
//        Aligner → Check final → Synthèse
// ═══════════════════════════════════════════════════════════

type Screen =
  | "depot"
  | "onboarding"
  | "transition"
  | "exit-transition"
  | "entree"
  | "propose-long"
  | "ressenti"
  | "corps"
  | "ancrer"
  | "ancrer-suggest"
  | "exercice"
  | "feedback"
  | "branche-pareil"
  | "branche-pareil-exercice"
  | "branche-pareil-feedback"
  | "branche-agite"
  | "branche-agite-exercice"
  | "emerger"
  | "choix-geste"
  | "geste-display"
  | "synthese";

type ActivationLevel = "deborde" | "charge" | "encore" | "calme" | "stop";
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
  "appuis": "Revenir au corps",
  "autour": "Se poser un moment",
  "souffle": "Respirer lentement",
};

const ANCHOR_SUBTEXTS: Record<AnchorMethod, string> = {
  "appuis": "revenir aux appuis",
  "autour": "laisser de l'espace",
  "souffle": "ralentir un peu",
};

const ANCHOR_ORDER_BY_FEELING: Partial<Record<Feeling, AnchorMethod[]>> = {
  "agite":          ["souffle", "appuis", "autour"],
  "serre":          ["souffle", "appuis", "autour"],
  "lourd":          ["appuis", "autour", "souffle"],
  "flou":           ["appuis", "autour", "souffle"],
  "je-ne-sais-pas": ["autour", "appuis", "souffle"],
};

// ── ÉMERGER — Mapping ressenti → besoins → geste ────────────

const ZONE_PREPOSITION: Record<BodyZone, string> = {
  poitrine: "dans la poitrine",
  ventre:   "dans le ventre",
  gorge:    "dans la gorge",
  tete:     "dans la tête",
  epaules:  "dans les épaules",
  partout:  "partout",
  "je-ne-sais-pas": "",
};

function getNeedsForState(feeling: Feeling | null, zone: BodyZone | null): string[] {
  if (feeling === "agite")
    return ["ralentir", "revenir au corps", "faire une pause", "clarifier"];
  if (feeling === "serre") {
    if (zone === "tete" || zone === "epaules")
      return ["ralentir", "revenir au corps", "faire une pause", "relâcher la tension"];
    return ["ralentir", "me sentir en sécurité", "relâcher la pression", "prendre de l'espace"];
  }
  if (feeling === "lourd")
    return ["être soutenu", "me reposer", "être tranquille", "me rapprocher de quelque chose de sûr"];
  if (feeling === "vide")
    return ["me reposer", "être tranquille", "être soutenu", "me rapprocher de quelque chose de sûr"];
  if (feeling === "flou")
    return ["ralentir", "revenir au simple", "me stabiliser", "y voir plus clair"];
  if (feeling === "bloque")
    return ["me dégager", "prendre de l'espace", "me stabiliser", "relâcher la tension"];
  return ["ralentir", "faire une pause", "revenir au corps", "me stabiliser"];
}

type Gesture = { label: string; description: string; action: string };

const NEED_GESTURE: Record<string, Gesture> = {
  "ralentir":                              { label: "Maintenant",  description: "Ralentis ce que tu es en train de faire.", action: "ralentir ce que je fais" },
  "revenir au corps":                      { label: "Maintenant",  description: "Assieds-toi ou pose-toi quelque part. 2 minutes.", action: "m'asseoir 2 minutes" },
  "faire une pause":                       { label: "Maintenant",  description: "Pose ce que tu fais. Bois un verre d'eau.", action: "faire une vraie pause" },
  "clarifier":                             { label: "Maintenant",  description: "Note une seule phrase. Choisis une seule chose.", action: "noter une phrase" },
  "me sentir en sécurité":               { label: "Maintenant",  description: "Va dans une autre pièce ou coupe une stimulation.", action: "changer d'espace" },
  "relâcher la pression":                { label: "Maintenant",  description: "Remets une chose à plus tard. Juste une.", action: "remettre une chose à plus tard" },
  "prendre de l'espace":                 { label: "Maintenant",  description: "Ouvre une fenêtre ou sors 2 minutes.", action: "prendre de l'air" },
  "être soutenu":                          { label: "Maintenant",  description: "Envoie un message à quelqu'un de sûr.", action: "contacter quelqu'un de sûr" },
  "me reposer":                            { label: "Maintenant",  description: "Allonge-toi ou assieds-toi sans rien faire. 5 minutes.", action: "me poser 5 minutes" },
  "être tranquille":                       { label: "Maintenant",  description: "Coupe le bruit ou mets-toi à l'écart.", action: "trouver le calme" },
  "me rapprocher de quelque chose de sûr":{ label: "Maintenant", description: "Rapproche-toi d'un endroit ou d'une chose calme.", action: "me rapprocher de quelque chose de sûr" },
  "revenir au simple":                     { label: "Maintenant",  description: "Choisis une seule chose. Laisse le reste.", action: "choisir une seule chose" },
  "me stabiliser":                         { label: "Maintenant",  description: "Assieds-toi. Ne fais rien pendant 2 minutes.", action: "m'asseoir sans rien faire" },
  "y voir plus clair":                     { label: "Maintenant",  description: "Note ce qui est flou. Une phrase suffit.", action: "noter ce qui est flou" },
  "me dégager":                            { label: "Maintenant",  description: "Éloigne-toi de ce qui te tend. Physiquement si possible.", action: "m'éloigner de ce qui me tend" },
  "me protéger":                           { label: "Maintenant",  description: "Ne réponds pas tout de suite. Tu peux attendre.", action: "ne pas répondre tout de suite" },
  "poser une limite":                      { label: "Maintenant",  description: "Dis \"pas maintenant\" ou reporte la discussion.", action: "reporter la discussion" },
  "relâcher la tension":                   { label: "Maintenant",  description: "Recule un peu. Bois quelque chose de chaud.", action: "prendre un moment pour moi" },
};

function getGestureForNeed(need: string): Gesture {
  return NEED_GESTURE[need] ?? { label: "Maintenant", description: "Assieds-toi 2 minutes. C'est suffisant.", action: "m'asseoir 2 minutes" };
}


// ── Chip auto-advance ──────────────────────────────────────
function AutoChip({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`t-chip w-full text-center${className ? ` ${className}` : ""}`}
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
  const { user, hasPremiumAccess } = useAuth();

  // ── Detect if entered via soft-switch (skip entry screen) ──
  const skipEntree = searchParams.get("skip") === "entree";
  const onboardingSeen = typeof window !== "undefined" && localStorage.getItem("tracea_onboarding_seen") === "true";

  // ── State ──
  const [screen, setScreen] = useState<Screen>(skipEntree ? "ressenti" : "depot");
  const [transitionOpacity, setTransitionOpacity] = useState(0);
  const [exitOpacity, setExitOpacity] = useState(0);
  const [activationLevel, setActivationLevel] = useState<ActivationLevel | null>(null);
  const [currentFeeling, setCurrentFeeling] = useState<Feeling | null>(null);
  const [bodyZone, setBodyZone] = useState<BodyZone | null>(null);
  const [anchorMethod, setAnchorMethod] = useState<AnchorMethod | null>(null);
  const [anchorEffect, setAnchorEffect] = useState<AnchorEffect | null>(null);
  const [nextAction, setNextAction] = useState<string | null>(null);
  const [showMoreFeelings, setShowMoreFeelings] = useState(false);
  const [emergerStep, setEmergerStep] = useState<"besoin" | "transition" | "geste">("besoin");
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);

  // Méthodes déjà essayées (pour ne jamais reproposer)
  const [triedMethods, setTriedMethods] = useState<AnchorMethod[]>([]);
  const [selectedEntryMessage, setSelectedEntryMessage] = useState<string | null>(null);
  const [suggestedEntry, setSuggestedEntry] = useState<ActivationLevel | null>(null);
  // Branche pareil: méthode alternative
  const [altMethod, setAltMethod] = useState<AnchorMethod | null>(null);
  // Personalisation abonné — méthode dominante
  const [topMethod, setTopMethod] = useState<AnchorMethod | null>(null);

  // Réinitialiser émerger à chaque entrée dans l'écran
  useEffect(() => {
    if (screen === "emerger") {
      setEmergerStep("besoin");
      setSelectedNeed(null);
    }
  }, [screen]);

  // Timer : transition → geste (1.5 s)
  useEffect(() => {
    if (emergerStep !== "transition") return;
    const t = setTimeout(() => setEmergerStep("geste"), 1500);
    return () => clearTimeout(t);
  }, [emergerStep]);

  // ── Charger méthode dominante pour abonnés ──
  useEffect(() => {
    if (!hasPremiumAccess || !user?.id) return;
    getTopAnchorMethod(user.id).then((m) => {
      if (m === "appuis" || m === "autour" || m === "souffle") setTopMethod(m);
    });
  }, [hasPremiumAccess, user?.id]);

  // ── Helper : aller à ancrer (ou suggestion si accès premium + méthode dominante) ──
  function goToAncrer() {
    if (hasPremiumAccess && topMethod) {
      setScreen("ancrer-suggest");
    } else {
      setScreen("ancrer");
    }
  }

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

  // ── Matching dépôt → entrée (mots-clés, sans IA) ─────────
  function matchDepotToEntry(text: string): ActivationLevel | null {
    const t = text.toLowerCase();
    if (/colère|énerver|exploser|réagir trop fort|m.emporter/.test(t)) return "deborde";
    if (/répondre|message|sms|mail|regretter/.test(t)) return "charge";
    if (/voir|rendez-vous|rencontrer|tendu|stressé avant/.test(t)) return "encore";
    if (/stop|s.arrête|craquer|boire|consommer|fuite|anesthésier|tiens plus/.test(t)) return "stop";
    if (/trop|submergé|chargé|épuisé|j.en peux plus|débordé/.test(t)) return "calme";
    return null;
  }

  // ── Rendu par écran ──────────────────────────────────────

  const renderScreen = () => {
    switch (screen) {
      // ════════════════════════════════════════════════════
      // DÉPÔT — Micro-dépôt facultatif avant le flow
      // ════════════════════════════════════════════════════
      case "depot":
        return (
          <MiniDepot
            onContinue={(text) => {
              setSuggestedEntry(matchDepotToEntry(text));
              setScreen(onboardingSeen ? "entree" : "onboarding");
            }}
          />
        );

      // ONBOARDING — Écran d'accueil
      // ════════════════════════════════════════════════════
      case "onboarding":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10">
            <div className="text-center space-y-8">
              {/* Reframe émotionnel — les deux lignes forment une paire */}
              <div className="space-y-1">
                <p className="font-serif text-2xl text-t-beige leading-relaxed">
                  Tu ne vas pas mal.
                </p>
                <p className="font-serif text-2xl text-t-beige leading-relaxed">
                  Tu es en surcharge.
                </p>
              </div>
              {/* Promesse — plus douce, suit naturellement */}
              <div className="space-y-1">
                <p className="font-body text-lg t-text-secondary leading-relaxed">
                  On va juste revenir au corps.
                </p>
                <p className="font-body text-lg t-text-secondary leading-relaxed">
                  Quelques minutes suffisent.
                </p>
              </div>
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
        if (selectedEntryMessage) {
          return (
            <div className="flex flex-col items-center justify-center min-h-[80vh]">
              <p className="font-serif text-2xl text-t-beige text-center">
                {selectedEntryMessage}
              </p>
            </div>
          );
        }
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-2">
              <p className="font-serif text-2xl text-t-beige">
                Qu&apos;est-ce qui se passe pour toi ?
              </p>
            </div>
            <div className="w-full space-y-3">
              {([
                ["deborde", "Je sens que je vais réagir trop fort"],
                ["charge", "Je vais répondre à quelqu'un et je pourrais le regretter"],
                ["encore", "Je vais voir quelqu'un et je me sens tendu(e)"],
                ["calme", "Je me sens trop chargé(e)"],
                ["stop", "J'ai besoin que ça s'arrête"],
              ] as [ActivationLevel, string][]).map(([value, label], index) => (
                <AutoChip
                  key={value}
                  label={label}
                  className={
                    suggestedEntry
                      ? value === suggestedEntry ? "ring-1 ring-t-beige/60 bg-white/8" : undefined
                      : index === 0 ? "ring-1 ring-t-beige/40" : undefined
                  }
                  onClick={() => {
                    setActivationLevel(value);
                    setSelectedEntryMessage(ENTRY_MESSAGES[value]);
                    trackEvent(user?.id ?? null, "session_start", {
                      mode: "court",
                      context: null,
                    });
                    setTimeout(() => {
                      if (ACTIVATION_FLOW_MAP[value] === LONG_FLOW) {
                        setScreen("propose-long");
                      } else {
                        setScreen("ressenti");
                      }
                    }, 1000);
                  }}
                />
              ))}
            </div>
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
              <p className="font-body text-lg t-text-secondary leading-relaxed">
                On peut prendre un peu plus de temps pour aller plus loin.
              </p>
              <p className="font-body text-base t-text-secondary">
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
              <p className="font-body text-lg t-text-secondary">
                {activationLevel ? RESSENTI_INTRO[activationLevel] : "Là, c'est surtout :"}
              </p>
              <p className="font-inter text-sm t-text-ghost">
                Là, dans ton corps, c&apos;est plutôt :
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
                className="font-inter text-[13px] t-text-secondary underline underline-offset-[3px]"
              >
                Autre mot
              </button>
            )}
            <p className="font-inter text-xs t-text-secondary text-center">
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
              <p className="font-body text-lg t-text-secondary">
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
                    goToAncrer();
                  }}
                />
              ))}
              <AutoChip
                label="autre / je ne sais pas"
                onClick={() => {
                  setBodyZone("je-ne-sais-pas");
                  trackEvent(user?.id ?? null, "step_complete", { step: "corps", mode: "court", value: "je-ne-sais-pas" });
                  goToAncrer();
                }}
              />
            </div>
          </div>
        );

      // ════════════════════════════════════════════════════
      // ÉCRAN 3b — ANCRER SUGGEST (abonnés, méthode dominante)
      // ════════════════════════════════════════════════════
      case "ancrer-suggest": {
        const suggestLabels: Record<AnchorMethod, string> = {
          appuis: "Sentir tes pieds t'aide souvent.",
          autour: "Regarder autour t'aide souvent.",
          souffle: "Respirer t'aide souvent.",
        };
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-3">
              <p className="font-body text-lg t-text-primary">
                {topMethod ? suggestLabels[topMethod] : ""}
              </p>
              <p className="font-inter text-sm t-text-secondary">
                Tu veux commencer par là ?
              </p>
            </div>
            <div className="w-full space-y-3">
              <button
                type="button"
                onClick={() => {
                  setAnchorMethod(topMethod!);
                  setTriedMethods([topMethod!]);
                  trackEvent(user?.id ?? null, "step_complete", { step: "ancrer", mode: "court", value: topMethod });
                  setScreen("exercice");
                }}
                className="w-full text-center rounded-full font-inter text-sm font-medium px-5 py-3 cursor-pointer transition-all duration-200 bg-t-brume/30 text-t-beige border border-[rgba(232,216,199,0.45)] hover:bg-t-brume/55 hover:border-[rgba(232,216,199,0.70)] hover:text-white"
              >
                Oui
              </button>
              <button
                type="button"
                onClick={() => setScreen("ancrer")}
                className="w-full text-center rounded-full font-inter text-sm font-medium px-5 py-3 cursor-pointer transition-all duration-200 bg-transparent t-text-secondary border border-[rgba(232,216,199,0.20)] hover:text-t-beige"
              >
                Autre chose
              </button>
            </div>
          </div>
        );
      }

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
              <p className="font-body text-lg t-text-secondary">
                On ralentit un peu, simplement.
              </p>
            </div>
            <div className="w-full space-y-3">
              {(currentFeeling && ANCHOR_ORDER_BY_FEELING[currentFeeling] ? ANCHOR_ORDER_BY_FEELING[currentFeeling]! : (["appuis", "autour", "souffle"] as AnchorMethod[])).map((m) => (
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
                  <span className="block">{ANCHOR_LABELS[m]}</span>
                  <span className="block font-inter text-xs t-text-ghost opacity-70 mt-0.5">{ANCHOR_SUBTEXTS[m]}</span>
                </button>
              ))}
            </div>
            <p className="font-inter text-xs t-text-secondary text-center">
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
              <p className="font-body text-lg text-t-beige">
                Là, c&apos;est comment ?
              </p>
              <p className="font-inter text-sm t-text-ghost">
                Dans ton corps, surtout.
              </p>
            </div>
            <div className="w-full space-y-3">
              {([
                ["pareil", "pareil"],
                ["un-peu", "un peu mieux"],
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
            <p className="font-inter text-xs t-text-ghost text-center">
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
              <p className="font-body text-lg text-t-beige">
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
            <p className="font-inter text-xs t-text-ghost text-center">
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
              <p className="font-body text-lg t-text-secondary">
                On ne force pas.
              </p>
              <p className="font-body text-lg t-text-secondary">
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
      // ÉCRAN 7 — ÉMERGER  ressenti → besoin → geste
      // ════════════════════════════════════════════════════
      case "emerger": {
        // ── Sous-étape : BESOIN ──────────────────────────
        if (emergerStep === "besoin") {
          const needs = getNeedsForState(currentFeeling, bodyZone);
          const feelingLabel =
            currentFeeling && currentFeeling !== "je-ne-sais-pas"
              ? FEELING_LABELS[currentFeeling]
              : null;
          const zoneLabel = bodyZone ? ZONE_PREPOSITION[bodyZone] : "";
          return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
              {/* Rappel contextuel discret */}
              {feelingLabel && (
                <p className="font-inter text-xs t-text-ghost text-center italic">
                  {zoneLabel
                    ? `Tout à l'heure, c'était surtout ${feelingLabel} ${zoneLabel}`
                    : `Tout à l'heure, c'était surtout ${feelingLabel}`}
                </p>
              )}
              <div className="text-center space-y-2">
                <p className="font-body text-lg text-t-beige leading-relaxed">
                  Là, pour continuer, ce qui te ferait du bien :
                </p>
                <p className="font-inter text-sm t-text-ghost">
                  Sans trop réfléchir.
                </p>
              </div>
              <div className="w-full space-y-3">
                {needs.map((need) => (
                  <AutoChip
                    key={need}
                    label={need}
                    onClick={() => {
                      setSelectedNeed(need);
                      trackEvent(user?.id ?? null, "step_complete", { step: "emerger", mode: "court", value: need });
                      setScreen("choix-geste");
                    }}
                  />
                ))}
              </div>
            </div>
          );
        }

        return null;
      }

      // ════════════════════════════════════════════════════
      // ÉCRAN — CHOIX GESTE
      // ════════════════════════════════════════════════════
      case "choix-geste": {
        const GESTE_CHIPS: { label: string; need: string }[] = [
          { label: "ralentir ce que je fais",  need: "ralentir" },
          { label: "revenir dans mon corps",   need: "revenir au corps" },
          { label: "faire une pause",          need: "faire une pause" },
          { label: "clarifier",                need: "clarifier" },
        ];
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-2">
              <p className="font-body text-lg text-t-beige">
                Choisis un geste simple.
              </p>
              <p className="font-inter text-sm t-text-ghost">
                Celui qui te parle le plus.
              </p>
            </div>
            <div className="w-full space-y-3">
              {GESTE_CHIPS.map(({ label, need }) => (
                <AutoChip
                  key={need}
                  label={label}
                  onClick={() => {
                    setSelectedNeed(need);
                    trackEvent(user?.id ?? null, "session_end", { mode: "court" });
                    setScreen("geste-display");
                  }}
                />
              ))}
            </div>
          </div>
        );
      }

      // ════════════════════════════════════════════════════
      // ÉCRAN — GESTE
      // ════════════════════════════════════════════════════
      case "geste-display": {
        const gesture = selectedNeed ? getGestureForNeed(selectedNeed) : null;
        if (!gesture) return null;
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 animate-fade-up">
            <div className="text-center space-y-4">
              <p className="font-inter text-[10px] t-text-ghost uppercase tracking-widest">
                {gesture.label}
              </p>
              <p className="font-serif text-2xl text-t-beige leading-relaxed">
                {gesture.description}
              </p>
            </div>
            <PrimaryButton
              onClick={() => {
                setNextAction(gesture.action);
                setScreen("synthese");
              }}
            >
              C&apos;est noté
            </PrimaryButton>
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

            {/* Clôture émotionnelle — doit être lue, pas effacée */}
            <p className="font-body text-lg text-t-beige text-center">
              C&apos;est suffisant pour maintenant.
            </p>
            <p className="font-inter text-xs t-text-ghost text-center">
              Tu peux revenir ici à chaque fois.
            </p>
            <InstallPrompt />
            <PrimaryButton onClick={() => setScreen("exit-transition")}>
              Retour à l&apos;accueil
            </PrimaryButton>
            <button
              type="button"
              onClick={() => router.push("/app/session")}
              className="font-inter text-[13px] t-text-secondary underline underline-offset-[3px]"
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
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-5">
            <p className="font-inter text-[10px] t-text-ghost uppercase tracking-widest">Appuis</p>
            <GroundingGuide onComplete={onDone} />
          </div>
        );

      case "autour":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-5">
            <p className="font-inter text-[10px] t-text-ghost uppercase tracking-widest">Autour</p>
            <GazeGuide onComplete={onDone} />
          </div>
        );

      case "souffle":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-5">
            <p className="font-inter text-[10px] t-text-ghost uppercase tracking-widest">Souffle</p>
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
      <span className="font-inter text-sm t-text-secondary shrink-0">
        {label}
      </span>
      <span className="font-body text-lg t-text-primary text-right italic">
        {value}
      </span>
    </div>
  );
}
