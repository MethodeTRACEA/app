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
  | "soft-limit"
  | "entree"
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

type Gesture = { label: string; description: string; action: string };

// ── GESTES PAR NIVEAU D'ACTIVATION ──────────────────────────

type ActivationGeste = { id: string; label: string; summaryLabel?: string; text: string };

const GESTES_BY_ACTIVATION: Record<ActivationLevel, ActivationGeste[]> = {
  charge: [
    { id: "charge-1", label: "ne pas envoyer",      summaryLabel: "ne rien envoyer pour l'instant",    text: "Attends.\n\nN'envoie rien.\n\nPose ton téléphone." },
    { id: "charge-2", label: "écrire sans envoyer",  summaryLabel: "écrire sans envoyer",               text: "Écris ton message.\n\nMais ne l'envoie pas.\n\nGarde-le pour toi." },
    { id: "charge-3", label: "attendre 10 minutes",  summaryLabel: "attendre dix minutes",              text: "Attends 10 minutes.\n\nJuste 10.\n\nTu verras après." },
    { id: "charge-4", label: "changer de pièce",     summaryLabel: "changer de pièce quelques instants", text: "Éloigne-toi.\n\nChange de pièce.\n\nJuste un moment." },
  ],
  deborde: [
    { id: "deborde-1", label: "poser les pieds",     summaryLabel: "poser les pieds au sol",            text: "Pose tes pieds.\n\nAppuie fort.\n\nSens le sol." },
    { id: "deborde-2", label: "rester immobile",     summaryLabel: "rester immobile quelques secondes", text: "Ne bouge plus.\n\nJuste quelques secondes.\n\nLaisse passer." },
    { id: "deborde-3", label: "prendre distance",    summaryLabel: "prendre un peu de distance",        text: "Recule.\n\nPrends de la distance.\n\nTu reviendras après." },
    { id: "deborde-4", label: "eau sur les mains",   summaryLabel: "passer de l'eau sur mes mains",     text: "Passe de l'eau sur tes mains.\n\nSens le froid.\n\nReste là." },
  ],
  stop: [
    { id: "stop-1", label: "rester là",              summaryLabel: "rester là, sans rien faire de plus", text: "Reste là.\n\nÇa va passer.\n\nTu n'as rien à faire." },
    { id: "stop-2", label: "serrer relâcher",        summaryLabel: "serrer puis relâcher les poings",    text: "Serre les poings.\n\nRelâche.\n\nEncore 5 fois." },
    { id: "stop-3", label: "boire de l'eau",         summaryLabel: "boire un verre d'eau lentement",     text: "Bois un verre d'eau.\n\nLentement.\n\nJuste ça." },
    { id: "stop-4", label: "faire 10 pas",           summaryLabel: "faire dix pas lentement",            text: "Fais 10 pas.\n\nTrès lentement.\n\nReste présent." },
  ],
  calme: [
    { id: "calme-1", label: "écrire tout",           summaryLabel: "écrire ce qui déborde",             text: "Écris tout.\n\nSans trier.\n\nJuste sortir." },
    { id: "calme-2", label: "une seule chose",       summaryLabel: "choisir une seule chose",           text: "Choisis une seule chose.\n\nUne.\n\nLe reste attend." },
    { id: "calme-3", label: "couper les écrans",     summaryLabel: "couper les écrans deux minutes",    text: "Coupe les écrans.\n\nJuste 2 minutes.\n\nRien d'autre." },
    { id: "calme-4", label: "relâcher épaules",      summaryLabel: "relâcher les épaules",              text: "Relâche tes épaules.\n\nLaisse tomber.\n\nEncore." },
  ],
  encore: [
    { id: "encore-1", label: "main sur soi",         summaryLabel: "poser une main sur moi",            text: "Pose une main sur toi.\n\nReste là.\n\nRespire normalement." },
    { id: "encore-2", label: "poser une intention",  summaryLabel: "poser une intention simple",        text: "Choisis une intention.\n\nUne seule.\n\nGarde-la." },
    { id: "encore-3", label: "ralentir gestes",      summaryLabel: "ralentir mes gestes",               text: "Ralentis tes gestes.\n\nJuste un peu.\n\nAvant d'y aller." },
    { id: "encore-4", label: "nommer le ressenti",   summaryLabel: "nommer simplement ce que je ressens", text: "Qu'est-ce que tu ressens ?\n\nJuste ça.\n\nSans changer." },
  ],
};

const GESTES_FALLBACK: ActivationGeste[] = [
  { id: "fallback-1", label: "ne pas envoyer",       summaryLabel: "ne rien envoyer pour l'instant",   text: "Attends.\n\nN'envoie rien.\n\nPose ton téléphone." },
  { id: "fallback-2", label: "poser les pieds",      summaryLabel: "poser les pieds au sol",            text: "Pose tes pieds.\n\nAppuie fort.\n\nSens le sol." },
  { id: "fallback-3", label: "boire de l'eau",       summaryLabel: "boire un verre d'eau lentement",    text: "Bois un verre d'eau.\n\nLentement.\n\nJuste ça." },
];

function getActivationGestes(level: ActivationLevel | null): ActivationGeste[] {
  if (!level) return GESTES_FALLBACK;
  return GESTES_BY_ACTIVATION[level];
}

function getGesteById(id: string): ActivationGeste | null {
  for (const gestes of Object.values(GESTES_BY_ACTIVATION)) {
    const found = gestes.find((g) => g.id === id);
    if (found) return found;
  }
  return GESTES_FALLBACK.find((g) => g.id === id) ?? null;
}

// ── Intro choix-geste selon activationLevel ──────────────────
// [hook situationnel, ...instructions, soft-close]
const GESTURE_INTRO_BY_ACTIVATION: Record<ActivationLevel, string[]> = {
  charge:  ["Avant d'agir,", "choisis un geste simple.", "Celui qui te ferait du bien.", "Sans trop réfléchir."],
  deborde: ["Là,", "reste simple.", "Choisis un geste.", "Celui qui te ferait du bien.", "Sans trop réfléchir."],
  stop:    ["Là,", "juste un petit pas.", "Choisis un geste simple.", "Sans trop réfléchir."],
  calme:   ["Pour continuer,", "choisis un geste simple.", "Celui qui te ferait du bien.", "Sans trop réfléchir."],
  encore:  ["Avant d'y aller,", "choisis un geste simple.", "Celui qui te ferait du bien.", "Sans trop réfléchir."],
};

function getToneContext(level: ActivationLevel | null): string | null {
  if (!level) return null;
  const map: Record<ActivationLevel, string> = {
    charge:  "Avant d'agir, on ralentit.",
    deborde: "Là, on évite de laisser l'émotion conduire.",
    stop:    "Là, on fait juste tenir ce moment.",
    calme:   "On enlève un peu de poids.",
    encore:  "Avant l'extérieur, on revient à toi.",
  };
  return map[level];
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
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);

  // Méthodes déjà essayées (pour ne jamais reproposer)
  const [triedMethods, setTriedMethods] = useState<AnchorMethod[]>([]);
  const [selectedEntryMessage, setSelectedEntryMessage] = useState<string | null>(null);
  const [suggestedEntry, setSuggestedEntry] = useState<ActivationLevel | null>(null);
  // Branche pareil: méthode alternative
  const [altMethod, setAltMethod] = useState<AnchorMethod | null>(null);
  // Personalisation abonné — méthode dominante
  const [topMethod, setTopMethod] = useState<AnchorMethod | null>(null);

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
                      setScreen("ressenti");
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
              {(["poitrine", "gorge", "ventre", "tete", "epaules"] as BodyZone[]).map((z) => (
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
            <p className="font-inter text-xs t-text-ghost text-center">
              Le plus proche suffit.
            </p>
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
                    trackEvent(user?.id ?? null, "step_complete", {
                      step: "feedback",
                      mode: "court",
                      value,
                      anchorMethod,
                    });
                    if (value === "un-peu" || value === "je-ne-sais-pas") {
                      setScreen("choix-geste");
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
                    trackEvent(user?.id ?? null, "step_complete", {
                      step: "feedback_alt",
                      mode: "court",
                      value,
                      anchorMethod: altMethod,
                    });
                    setScreen("choix-geste");
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
          () => setScreen("choix-geste")
        );

      // ════════════════════════════════════════════════════
      // ÉCRAN — CHOIX GESTE
      // ════════════════════════════════════════════════════
      case "choix-geste": {
        const gestes = getActivationGestes(activationLevel);
        const introLines = activationLevel
          ? GESTURE_INTRO_BY_ACTIVATION[activationLevel]
          : GESTURE_INTRO_BY_ACTIVATION.charge;
        const [hookLine, ...restLines] = introLines;
        const softClose = restLines[restLines.length - 1];
        const bodyLines = restLines.slice(0, -1);
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-2">
              <p className="font-serif text-xl text-t-beige">
                {hookLine}
              </p>
              {bodyLines.map((line, i) => (
                <p key={i} className="font-body text-lg t-text-secondary leading-relaxed">
                  {line}
                </p>
              ))}
              <p className="font-inter text-xs t-text-ghost opacity-70">
                {softClose}
              </p>
            </div>
            <div className="w-full space-y-3">
              {gestes.map(({ id, label }) => (
                <AutoChip
                  key={id}
                  label={label}
                  onClick={() => {
                    setSelectedNeed(id);
                    trackEvent(user?.id ?? null, "session_end", { mode: "court" });
                    // Incrémenter compteur sessions courtes gratuites
                    if (!user) {
                      const prev = parseInt(localStorage.getItem("tracea_free_short_sessions") ?? "0", 10);
                      localStorage.setItem("tracea_free_short_sessions", String(prev + 1));
                    }
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
        const geste = selectedNeed ? getGesteById(selectedNeed) : null;
        if (!geste) return null;
        const toneContext = getToneContext(activationLevel);
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 animate-fade-up">
            <div className="text-center space-y-4">
              {toneContext && (
                <p className="font-inter text-xs t-text-ghost opacity-70 italic">
                  {toneContext}
                </p>
              )}
              <p className="font-serif text-xl text-t-beige leading-relaxed whitespace-pre-line">
                {geste.text}
              </p>
            </div>
            <PrimaryButton
              onClick={() => {
                setNextAction(geste.label);
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
            <div className="text-center space-y-2">
              <p className="font-body text-lg text-t-beige">
                C&apos;est suffisant pour maintenant.
              </p>
              <p className="font-body text-base t-text-secondary">
                Tu peux t&apos;arrêter là.
              </p>
            </div>
            <p className="font-inter text-xs t-text-ghost text-center">
              Tu peux revenir ici à chaque fois.
            </p>
            <InstallPrompt />
            <PrimaryButton onClick={() => setScreen("exit-transition")}>
              Retour à l&apos;accueil
            </PrimaryButton>
            <div className="text-center space-y-1.5">
              <button
                type="button"
                onClick={() => router.push("/app/session?from=traversee_courte")}
                className="font-inter text-sm t-text-secondary underline underline-offset-[3px] hover:text-t-beige transition-colors"
              >
                Approfondir ce que tu viens de vivre
              </button>
              <p className="font-inter text-xs t-text-ghost opacity-70">
                Prendre un moment pour y voir plus clair et repartir autrement
              </p>
            </div>
          </div>
        );

      case "soft-limit":
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-6 text-center">
            <p className="font-body text-2xl" style={{ color: "#F0E6D6", fontWeight: 300 }}>
              Tu peux créer un compte gratuit
            </p>
            <p className="font-sans text-sm" style={{ color: "rgba(240,230,214,0.55)", lineHeight: 1.6 }}>
              Tu pourras retrouver tes traversées plus facilement.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <PrimaryButton onClick={() => router.push("/app/connexion")}>
                Créer un compte gratuit
              </PrimaryButton>
              <SecondaryButton onClick={() => setScreen("exit-transition")}>
                Continuer librement
              </SecondaryButton>
            </div>
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
