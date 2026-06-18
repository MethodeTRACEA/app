"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { useAuth } from "@/lib/auth-context";
import {
  createSessionDb,
  updateSessionDb,
  trackEvent,
  getApprofondiSessionEndCount,
} from "@/lib/supabase-store";
import { Paywall } from "@/components/Paywall";
import { ConsentGate } from "@/components/ConsentGate";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { InstallPrompt } from "@/components/InstallPrompt";
import { SafetyResources } from "@/components/SafetyResources";
import { StepIndicator } from "@/components/StepIndicator";

// ════════════════════════════════════════════════════════════
// TRACÉA — Traversée approfondie V2
// Route : /app/session
// Distinct du flow court : comprendre + intégrer, pas réguler.
// Phases : intro → situation → emotion → besoin →
//          alignement → action → synthese → complete
// ════════════════════════════════════════════════════════════

type Phase =
  | "intro"
  | "situation"
  | "emotion"
  | "ancrage"
  | "besoin"
  | "alignement"
  | "action"
  | "synthese"
  | "complete";

// ── Chips ──────────────────────────────────────────────────────

const SAFE_ENDING_PHRASES = [
  "Tu viens de poser quelque chose.",
  "Tu as pris un moment pour traverser.",
  "Tu peux rester avec ça un instant.",
  "Quelque chose a été déposé.",
  "Tu n'as pas laissé ça passer sans t'arrêter.",
  "Tu peux revenir à ça si ça revient.",
  "Ça peut rester simple comme ça pour l'instant.",
];

function getSafeEnding() {
  return SAFE_ENDING_PHRASES[
    Math.floor(Math.random() * SAFE_ENDING_PHRASES.length)
  ];
}

const TRACEA_TRUTHS = [
  "Quand c'est trop intense…\ntu fais comme tu peux,\npas comme tu veux.",
  "Ce que tu ressens est fort.\nMais ça ne dit pas\nqui tu es.",
  "Dans cet état…\nle corps passe devant.\nLa clarté revient après.",
  "Tu n'es pas en train d'échouer.\nTu es en train de traverser.",
  "Ce moment ne te définit pas.\nC'est quelque chose\nqui te traverse.",
  "L'intensité est dans le corps.\nPas dans ce que tu es.",
  "Quand tout s'accélère à l'intérieur…\nc'est normal\nque tout devienne flou.",
  "Tu es encore là.\nEt ça compte.",
  "Tu n'es pas obligé(e) d'avoir tout compris.\nTu as déjà posé quelque chose.",
];

function getTraceaTruth() {
  return TRACEA_TRUTHS[
    Math.floor(Math.random() * TRACEA_TRUTHS.length)
  ];
}

const SITUATION_CHIPS = [
  "une tension avec quelqu'un",
  "une décision qui me pèse",
  "quelque chose m'a blessé",
  "je me suis senti(e) incompris(e)",
  "une situation m'a dépassé(e)",
  "je me sens trop chargé(e)",
  "je ne sais pas",
];

const SITUATION_DETAIL_PLACEHOLDERS: Record<string, string> = {
  "une tension avec quelqu'un":
    "ex : quelqu'un n'a pas répondu…",
  "une décision qui me pèse":
    "ex : j'ai dû choisir seul(e)…",
  "quelque chose m'a blessé":
    "ex : une phrase m'est restée…",
  "je me suis senti(e) incompris(e)":
    "ex : mes mots n'ont pas été reçus…",
  "une situation m'a dépassé(e)":
    "ex : tout est arrivé en même temps…",
  "je me sens trop chargé(e)":
    "ex : c'est lourd depuis ce matin…",
  "je ne sais pas":
    "ex : c'est flou mais ça me travaille…",
};

const EMOTION_CHIPS = [
  "colère",
  "tristesse",
  "peur",
  "honte",
  "frustration",
  "solitude",
  "épuisement",
  "confusion",
];

const BESOIN_CHIPS = [
  "qu'on me comprenne",
  "me rapprocher de quelqu'un",
  "qu'on me soutienne",
  "poser une limite",
  "y voir plus clair",
  "mettre des mots dessus",
  "juste poser ça",
  "me sentir en sécurité",
];

// ── Suggestions d'action par besoin (flow long uniquement) ─────
// Interdit : gestes du flow court (respirer, boire, pause, ancrer…)
// Autorisé : clarification, communication, introspection, ajustement relationnel

type ActionItem = { text: string; kind: "write" | "world" };
type ActionEntry = { default: ActionItem[]; [emotion: string]: ActionItem[] };

const ACTION_SUGGESTIONS: Record<string, ActionEntry> = {
  "qu'on me comprenne": {
    default: [
      { text: "écrire la première phrase que je pourrais dire", kind: "write" },
      { text: "écrire ce que j'aurais voulu dire", kind: "write" },
      { text: "choisir à qui en parler", kind: "world" },
    ],
    "solitude": [
      { text: "envoyer un message simple à quelqu'un", kind: "world" },
      { text: "choisir une personne à qui parler", kind: "world" },
      { text: "écrire ce que j'aurais besoin qu'on entende", kind: "write" },
    ],
    "tristesse": [
      { text: "choisir à qui en parler", kind: "world" },
      { text: "écrire ce que j'aurais aimé entendre", kind: "write" },
      { text: "demander une présence simple", kind: "world" },
    ],
  },
  "poser une limite": {
    default: [
      { text: "dire ce que je n'accepte plus", kind: "world" },
      { text: "écrire ma limite avant de la dire", kind: "write" },
      { text: "décider ce que je vais dire et quand", kind: "world" },
    ],
    "colère": [
      { text: "dire ce que je n'accepte plus", kind: "world" },
      { text: "dire ce que je ne veux plus", kind: "world" },
      { text: "écrire ma limite avant de la poser", kind: "write" },
    ],
    "peur": [
      { text: "choisir la limite la plus simple à poser", kind: "world" },
      { text: "écrire ce que je peux dire sans me justifier", kind: "write" },
      { text: "attendre un moment plus calme avant d'en parler", kind: "world" },
    ],
  },
  "y voir plus clair": {
    default: [
      { text: "me demander ce que je dirais à un proche dans la même situation", kind: "world" },
      { text: "écrire les deux côtés de la situation", kind: "write" },
      { text: "mettre au clair ce que je veux vraiment", kind: "world" },
    ],
    "confusion": [
      { text: "me demander ce que je dirais à quelqu'un d'autre dans cette situation", kind: "world" },
      { text: "écrire les deux côtés de la situation", kind: "write" },
      { text: "noter ce qui est clair et ce qui ne l'est pas", kind: "write" },
    ],
    "peur": [
      { text: "noter ce que je sais et ce que j'ignore encore", kind: "write" },
      { text: "écrire ce qui dépend de moi", kind: "write" },
      { text: "attendre avant de conclure", kind: "world" },
    ],
  },
  "mettre des mots dessus": {
    default: [
      { text: "trouver le mot le plus juste pour ce que je ressens", kind: "world" },
      { text: "écrire les premiers mots qui me viennent", kind: "write" },
      { text: "dire ce que j'ai gardé pour moi", kind: "world" },
    ],
    "colère": [
      { text: "mettre un mot juste sur ce que je ressens", kind: "world" },
      { text: "écrire ce qui m'a touché avant d'en parler", kind: "write" },
      { text: "poser les mots avant de parler", kind: "world" },
    ],
    "honte": [
      { text: "écrire ça juste pour moi", kind: "write" },
      { text: "noter ce que je ressens, simplement", kind: "write" },
      { text: "garder ça pour moi le temps d'y voir clair", kind: "world" },
    ],
  },
  "me rapprocher de quelqu'un": {
    default: [
      { text: "envoyer un message simple", kind: "world" },
      { text: "choisir le bon moment pour en parler", kind: "world" },
      { text: "écrire ce que j'ai envie de partager", kind: "write" },
    ],
    "solitude": [
      { text: "envoyer un message simple", kind: "world" },
      { text: "proposer un moment sans trop expliquer", kind: "world" },
      { text: "dire que j'aimerais ne pas être seul avec ça", kind: "world" },
    ],
  },
  "juste poser ça": {
    default: [
      { text: "laisser ça là pour aujourd'hui", kind: "world" },
      { text: "ne rien faire de plus maintenant", kind: "world" },
      { text: "y revenir plus tard si besoin", kind: "world" },
    ],
    "épuisement": [
      { text: "laisser ça là pour aujourd'hui", kind: "world" },
      { text: "me reposer un moment", kind: "world" },
      { text: "y revenir quand j'aurai un peu d'énergie", kind: "world" },
    ],
    "tristesse": [
      { text: "laisser ça là un moment", kind: "world" },
      { text: "écrire juste ce qui est là", kind: "write" },
      { text: "y revenir une autre fois", kind: "world" },
    ],
  },
  "qu'on me soutienne": {
    default: [
      { text: "demander une chose précise à une personne", kind: "world" },
      { text: "dire de quel soutien j'ai besoin : qu'on m'écoute, qu'on m'aide, ou juste qu'on soit là", kind: "world" },
      { text: "choisir une personne à qui je peux demander", kind: "world" },
    ],
    "solitude": [
      { text: "envoyer un message à une personne de confiance", kind: "world" },
      { text: "demander juste une présence", kind: "world" },
      { text: "dire à quelqu'un que j'aurais besoin d'un coup de main", kind: "world" },
    ],
    "épuisement": [
      { text: "demander de l'aide pour une seule chose, la plus lourde", kind: "world" },
      { text: "accepter qu'on m'aide, même un peu", kind: "world" },
      { text: "dire à quelqu'un ce qui pèse le plus", kind: "world" },
    ],
    "tristesse": [
      { text: "demander une présence, sans avoir à expliquer", kind: "world" },
      { text: "dire à quelqu'un que ça ne va pas", kind: "world" },
      { text: "choisir une personne douce à qui parler", kind: "world" },
    ],
  },
  "me sentir en sécurité": {
    default: [
      { text: "nommer 5 choses que je vois autour de moi", kind: "world" },
      { text: "sentir mes pieds au sol, le contact du siège", kind: "world" },
      { text: "poser une main sur quelque chose de stable", kind: "world" },
    ],
    "peur": [
      { text: "nommer 3 choses que j'entends maintenant", kind: "world" },
      { text: "sentir mes appuis : pieds, dos, mains", kind: "world" },
      { text: "regarder un point fixe et le décrire", kind: "world" },
    ],
  },
};

const ACTION_FALLBACK: ActionItem[] = [
  { text: "écrire ce qui compte pour moi", kind: "write" },
  { text: "laisser passer avant de répondre", kind: "world" },
  { text: "écrire ce que je veux garder en tête", kind: "write" },
];

function getActionSuggestions(besoin: string, emotion?: string): ActionItem[] {
  const entry = ACTION_SUGGESTIONS[besoin];
  if (!entry) return ACTION_FALLBACK;
  if (emotion && entry[emotion]) return entry[emotion];
  return entry.default;
}

// ── Chip interne ───────────────────────────────────────────────

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-[18px] px-5 py-3.5 font-body text-base transition-all duration-200 border ${
        selected
          ? "bg-t-brume/40 border-[rgba(232,216,199,0.50)] text-t-beige"
          : "bg-t-brume/15 border-[rgba(232,216,199,0.18)] t-text-secondary hover:bg-t-brume/30 hover:border-[rgba(232,216,199,0.30)]"
      }`}
    >
      {label}
    </button>
  );
}

// ── Bouton retour discret ──────────────────────────────────────

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-inter text-xs t-text-ghost hover:t-text-secondary transition-colors"
    >
      ← Retour
    </button>
  );
}

// ════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════

export default function SessionPage() {
  return (
    <Suspense>
      <SessionPageInner />
    </Suspense>
  );
}

function SessionPageInner() {
  const {
    user,
    loading,
    hasPremiumAccess,
    isSubscribed,
    isBetaTester,
    isTrialActive,
    trialDeepSessionsUsed,
  } = useAuth();
  const [sessionCount, setSessionCount] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    getApprofondiSessionEndCount(user.id).then(setSessionCount);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="font-serif text-2xl text-terra animate-pulse-gentle">
          Chargement...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="flex flex-col items-center justify-center px-5"
        style={{ minHeight: "80vh", background: "#1A120D" }}
      >
        <div className="w-full max-w-md flex flex-col items-center text-center gap-6 py-12">
          <h2
            className="font-light text-[28px] leading-[34px] tracking-[-0.01em]"
            style={{
              fontFamily: "'Cormorant Garamond', 'EB Garamond', serif",
              color: "#F0E6D6",
            }}
          >
            Crée un compte pour continuer.
          </h2>

          <p
            className="font-sans text-[14px] leading-[20px]"
            style={{ color: "rgba(240,230,214,0.62)" }}
          >
            Crée un compte pour retrouver tes traversées.
          </p>

          <div className="w-full flex flex-col items-center gap-2">
            <PrimaryButton onClick={() => router.push("/app/connexion")}>
              Créer un compte gratuit
            </PrimaryButton>
            <p
              className="font-sans text-[12px]"
              style={{ color: "rgba(240,230,214,0.50)" }}
            >
              Gratuit. Sans engagement.
            </p>
          </div>

          <Link
            href="/app/traversee-courte"
            className="font-sans text-[13px] underline underline-offset-[3px] transition-colors"
            style={{ color: "rgba(240,230,214,0.50)" }}
          >
            Faire une traversée courte sans compte
          </Link>
        </div>
      </div>
    );
  }

  // Trial Premium 7 jours actif mais cap 5/5 atteint :
  // bloquer en amont pour éviter d'investir 5-8 min puis tomber sur ai_limited
  // côté serveur. Gate local — n'inclut volontairement pas le cap dans
  // hasPremiumAccess global pour ne pas casser les autres pages premium.
  if (
    isSubscribed !== true &&
    isBetaTester !== true &&
    isTrialActive === true &&
    (trialDeepSessionsUsed ?? 0) >= 5
  ) {
    return (
      <ScreenContainer overlayOpacity={45}>
        <div className="py-12">
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10">
            <div className="text-center space-y-4">
              <p className="font-inter text-[10px] t-text-ghost uppercase tracking-widest">
                Traversée approfondie
              </p>
              <h1 className="font-serif text-2xl text-t-beige leading-relaxed">
                Ton essai approfondi est complet pour ces 14 jours.
              </h1>
              <p className="font-body text-base t-text-secondary leading-relaxed">
                Tu peux toujours utiliser les traversées courtes et l&apos;urgence.
              </p>
              <p className="font-inter text-xs t-text-ghost">
                Pour continuer les traversées approfondies, tu peux découvrir Premium.
              </p>
            </div>

            <PrimaryButton onClick={() => router.push("/app")}>
              Retour à l&apos;accueil
            </PrimaryButton>

            <SecondaryButton onClick={() => router.push("/app/subscribe")}>
              Découvrir Premium
            </SecondaryButton>
          </div>
        </div>
      </ScreenContainer>
    );
  }

  if (!hasPremiumAccess && sessionCount === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="font-serif text-2xl text-terra animate-pulse-gentle">
          Chargement...
        </div>
      </div>
    );
  }

  if (!hasPremiumAccess && sessionCount !== null && sessionCount >= 1) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Paywall onContinue={() => router.push("/app")} />
      </div>
    );
  }

  return (
    <ConsentGate>
      <SessionContent
        userId={user.id}
        isFirstSession={!hasPremiumAccess && sessionCount === 0}
      />
    </ConsentGate>
  );
}

// ════════════════════════════════════════════════════════════
// CONTENU PRINCIPAL
// ════════════════════════════════════════════════════════════

const ALLOWED_SESSION_ORIGINS = ["start", "urgence", "traversee_courte", "entrainement"] as const;
type SessionOrigin = (typeof ALLOWED_SESSION_ORIGINS)[number] | "direct";

function SessionContent({ userId, isFirstSession }: { userId: string; isFirstSession: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session: authSession, hasPremiumAccess } = useAuth();

  const fromParam = searchParams.get("from");
  const sessionFrom: SessionOrigin =
    fromParam && (ALLOWED_SESSION_ORIGINS as readonly string[]).includes(fromParam)
      ? (fromParam as SessionOrigin)
      : "direct";

  const [phase, setPhase] = useState<Phase>("intro");
  const [paywallDismissed, setPaywallDismissed] = useState(false);
  const [ancrageUnlocked, setAncrageUnlocked] = useState(false);
  const [ancrageProgress, setAncrageProgress] = useState(false);

  // Données collectées
  const [situation, setSituation] = useState("");
  const [situationOther, setSituationOther] = useState("");
  const [situationComplement, setSituationComplement] = useState("");
  const [emotion, setEmotion] = useState("");
  const [emotionOther, setEmotionOther] = useState("");
  const [besoin, setBesoin] = useState("");
  const [besoinOther, setBesoinOther] = useState("");
  const [action, setAction] = useState("");
  const [actionSource, setActionSource] = useState<"suggestion" | "free_text" | null>(null);
  // Capturé au choix de l'action (étape 35-A.2) ; consommé par les écrans
  // « aide à poser » à l'étape 3. Non lu pour l'instant.
  const [actionKind, setActionKind] = useState<"write" | "world" | null>(null);

  // IA
  const [analysis, setAnalysis] = useState("");

  // Session DB
  const [sessionId, setSessionId] = useState<string | null>(null);

  // ── Labels affichés ─────────────────────────────────────────
  const situationLabel =
    situation === "autre"
      ? situationOther.trim()
      : situationComplement.trim()
      ? `${situation} — ${situationComplement.trim()}`
      : situation;
  const emotionLabel = emotion === "autre" && emotionOther.trim()
    ? emotionOther.trim() : emotion;
  const besoinLabel = besoin === "autre" && besoinOther.trim()
    ? besoinOther.trim() : besoin;
  const suggestions = getActionSuggestions(besoinLabel, emotionLabel);

  // ── Déverrouillage 8 s sur la phase Ancrer ───────────────────
  useEffect(() => {
    if (phase !== "ancrage") {
      setAncrageUnlocked(false);
      setAncrageProgress(false);
      return;
    }
    setAncrageUnlocked(false);
    setAncrageProgress(false);
    const raf = requestAnimationFrame(() => setAncrageProgress(true));
    const timer = setTimeout(() => setAncrageUnlocked(true), 8000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [phase]);

  // ── Démarrer session en DB ───────────────────────────────────
  async function startSession() {
    const s = await createSessionDb(userId, null, "autre");
    if (s) {
      setSessionId(s.id);
      trackEvent(userId, "session_start", { mode: "approfondi", from: sessionFrom });
    }
    setPhase("situation");
  }

  // ── Générer analyse IA ───────────────────────────────────────
  async function generateAnalysis() {
    const steps: Record<import("@/lib/types").StepId, string> = {
      traverser: situationLabel,
      reconnaitre: emotionLabel,
      ancrer: "",
      conscientiser: besoinLabel,
      emerger: action,
      aligner: "",
    };

    let analysisText = "";
    try {
      const res = await fetch("/api/tracea", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authSession?.access_token
            ? { Authorization: `Bearer ${authSession.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          type: "final-analysis",
          steps,
          context: "approfondi",
          userId,
        }),
      });
      const data = await res.json();
      analysisText = data.text || generateFallbackAnalysis();
      setAnalysis(analysisText);
    } catch {
      analysisText = generateFallbackAnalysis();
      setAnalysis(analysisText);
    }

    // ── Fire-and-forget : alimenter la mémoire évolutive ────────────
    // Appelé AVANT updateSessionDb(completed:true) : la route summarize
    // utilise checkAiLimit qui compte les sessions déjà completed. En
    // déclenchant summarize ici, la 1re session gratuite peut bien créer
    // un résumé mémoire avant que le compteur ne la voie.
    try {
      if (sessionId && authSession?.access_token) {
        console.log("[TRACEA summarize] start");
        fetch("/api/tracea/summarize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authSession.access_token}`,
          },
          body: JSON.stringify({
            sessionId,
            steps,
            context: "approfondi",
            hadDoNotStore: false,
            actionSource,
          }),
        })
          .then((res) => {
            if (res.ok) {
              console.log("[TRACEA summarize] success");
            } else {
              console.warn("[TRACEA summarize] error", res.status);
            }
          })
          .catch((err) => {
            Sentry.captureException(err, { tags: { feature: "summarize" } });
          });
      } else {
        console.log("[TRACEA summarize] skipped");
      }
    } catch {
      console.warn("[TRACEA summarize] error");
    }

    if (sessionId) {
      await updateSessionDb(sessionId, {
        steps,
        emotion_primaire: emotionLabel.slice(0, 100),
        verite_interieure: besoinLabel.slice(0, 200),
        action_alignee: action.slice(0, 200),
        analysis: analysisText,
        completed: true,
      });
    }

    trackEvent(userId, "session_end", { mode: "approfondi" });
    setPhase("complete");
  }

  function generateFallbackAnalysis(): string {
    return "Tu as pris le temps de mettre des mots sur ce qui se passe.\nC'est déjà quelque chose.";
  }

  // ── Champ texte partagé ──────────────────────────────────────
  const textareaClass =
    "w-full rounded-[18px] bg-t-brume/15 border border-[rgba(232,216,199,0.18)] px-5 py-3.5 font-body text-base t-text-secondary placeholder:opacity-40 resize-none outline-none focus:border-[rgba(232,216,199,0.35)] transition-colors";

  // ════════════════════════════════════════════════════════
  // INTRO
  // ════════════════════════════════════════════════════════
  if (phase === "intro") {
    return (
      <ScreenContainer overlayOpacity={45}>
        <div className="py-12">
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10">

            <div className="text-center space-y-4">
              <p className="font-inter text-[10px] t-text-ghost uppercase tracking-widest">
                Traversée approfondie
              </p>
              <h1 className="font-serif text-2xl text-t-beige leading-relaxed">
                Comprendre ce qui s&apos;est passé.
              </h1>
              <p className="font-body text-base t-text-secondary leading-relaxed">
                Un espace pour mettre des mots sur ce que tu vis,<br />
                et repartir plus clairement.
              </p>
              <p className="font-inter text-xs t-text-ghost">
                Environ 5 à 8 minutes.
              </p>
            </div>

            <PrimaryButton onClick={startSession}>
              Commencer
            </PrimaryButton>

            <button
              type="button"
              onClick={() => router.push("/app")}
              className="font-inter text-xs t-text-ghost hover:t-text-secondary transition-colors"
            >
              Retour
            </button>

          </div>
        </div>
      </ScreenContainer>
    );
  }

  // ════════════════════════════════════════════════════════
  // SITUATION — 1 / 6 (T - Traverser)
  // ════════════════════════════════════════════════════════
  if (phase === "situation") {
    return (
      <ScreenContainer overlayOpacity={45}>
        <div className="py-12">
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">

            <StepIndicator currentStep={0} completedSteps={[]} />

            <div className="text-center space-y-2">
              <p className="font-inter text-[10px] t-text-ghost uppercase tracking-widest">
                1 / 6
              </p>
              <p className="font-body text-lg t-text-secondary">
                Qu&apos;est-ce qui s&apos;est passé ?
              </p>
              <p className="font-inter text-xs t-text-ghost">
                Même une phrase suffit.
              </p>
            </div>

            <div className="w-full space-y-2.5">
              {SITUATION_CHIPS.map((chip) => (
                <Chip
                  key={chip}
                  label={chip}
                  selected={situation === chip}
                  onClick={() => { setSituation(chip); setSituationOther(""); setSituationComplement(""); }}
                />
              ))}
              <Chip
                label="autre"
                selected={situation === "autre"}
                onClick={() => { setSituation("autre"); setSituationComplement(""); }}
              />
              {situation === "autre" && (
                <textarea
                  value={situationOther}
                  onChange={(e) => setSituationOther(e.target.value)}
                  placeholder="ex : ce qui me reste de cette journée…"
                  className={textareaClass}
                  rows={2}
                  autoFocus
                />
              )}
              {situation && situation !== "autre" && (
                <div className="space-y-1.5">
                  <p className="font-inter text-xs t-text-ghost px-1">
                    Qu&apos;est-ce qui s&apos;est passé exactement ?
                  </p>
                  <textarea
                    value={situationComplement}
                    onChange={(e) => setSituationComplement(e.target.value)}
                    placeholder={SITUATION_DETAIL_PLACEHOLDERS[situation] ?? "ex : ce qui t'a marqué en une phrase…"}
                    className={textareaClass}
                    rows={2}
                    autoFocus
                  />
                  <p className="font-inter text-[10px] t-text-ghost px-1">
                    (ce qui t&apos;a marqué)
                  </p>
                </div>
              )}
            </div>

            <PrimaryButton
              disabled={!situation || (situation === "autre" && !situationOther.trim())}
              onClick={() => {
                trackEvent(userId, "step_complete", { step: "situation", mode: "approfondi", value: situationLabel });
                setPhase("emotion");
              }}
            >
              Continuer
            </PrimaryButton>

          </div>
        </div>
      </ScreenContainer>
    );
  }

  // ════════════════════════════════════════════════════════
  // ÉMOTION — 2 / 6 (R - Reconnaître)
  // ════════════════════════════════════════════════════════
  if (phase === "emotion") {
    return (
      <ScreenContainer overlayOpacity={45}>
        <div className="py-12">
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">

            <StepIndicator currentStep={1} completedSteps={[0]} />

            <div className="text-center space-y-2">
              <p className="font-inter text-[10px] t-text-ghost uppercase tracking-widest">
                2 / 6
              </p>
              <p className="font-body text-lg t-text-secondary">
                Qu&apos;est-ce que tu as ressenti ?
              </p>
              <p className="font-inter text-xs t-text-ghost">
                Choisis ce qui prend le plus de place maintenant, même si ce n&rsquo;est pas exact.
              </p>
            </div>

            <div className="w-full space-y-2.5">
              {EMOTION_CHIPS.map((chip) => (
                <Chip
                  key={chip}
                  label={chip}
                  selected={emotion === chip}
                  onClick={() => { setEmotion(chip); setEmotionOther(""); }}
                />
              ))}
              <Chip
                label="autre"
                selected={emotion === "autre"}
                onClick={() => setEmotion("autre")}
              />
              {emotion === "autre" && (
                <textarea
                  value={emotionOther}
                  onChange={(e) => setEmotionOther(e.target.value)}
                  placeholder="ex : un mot qui te vient pour le décrire…"
                  className={textareaClass}
                  rows={2}
                  autoFocus
                />
              )}
            </div>

            <PrimaryButton
              disabled={!emotion || (emotion === "autre" && !emotionOther.trim())}
              onClick={() => {
                trackEvent(userId, "step_complete", { step: "emotion", mode: "approfondi", value: emotionLabel });
                setPhase("ancrage");
              }}
            >
              Continuer
            </PrimaryButton>

            <BackButton onClick={() => setPhase("situation")} />

          </div>
        </div>
      </ScreenContainer>
    );
  }

  // ════════════════════════════════════════════════════════
  // ANCRAGE — 3 / 6 (A - Ancrer) — Pause corporelle
  // ════════════════════════════════════════════════════════
  if (phase === "ancrage") {
    return (
      <ScreenContainer overlayOpacity={45}>
        <div className="py-12">
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">

            <StepIndicator currentStep={2} completedSteps={[0, 1]} />

            <div className="text-center space-y-2">
              <p className="font-inter text-[10px] t-text-ghost uppercase tracking-widest">
                3 / 6
              </p>
              <h2 className="font-serif text-2xl text-t-beige leading-relaxed">
                Un instant dans le corps
              </h2>
              <p className="font-body text-base t-text-secondary leading-relaxed">
                Vois si tu peux sentir un appui. Tes pieds, ton dos, ce qui est là.
              </p>
              <p className="font-inter text-xs t-text-ghost">
                Même si c&apos;est flou, c&apos;est suffisant.
              </p>
            </div>

            <div
              className="w-40 h-px bg-t-creme/15 overflow-hidden"
              aria-hidden="true"
            >
              <div
                className="h-full bg-t-dore/50 ease-linear"
                style={{
                  width: ancrageProgress ? "100%" : "0%",
                  transitionProperty: "width",
                  transitionDuration: "8000ms",
                  transitionTimingFunction: "linear",
                }}
              />
            </div>

            <PrimaryButton
              disabled={!ancrageUnlocked}
              onClick={() => setPhase("besoin")}
            >
              J&apos;ai posé mes appuis
            </PrimaryButton>

            <BackButton onClick={() => setPhase("emotion")} />

          </div>
        </div>
      </ScreenContainer>
    );
  }

  // ════════════════════════════════════════════════════════
  // BESOIN — 4 / 6 (C - Comprendre)
  // ════════════════════════════════════════════════════════
  if (phase === "besoin") {
    return (
      <ScreenContainer overlayOpacity={45}>
        <div className="py-12">
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">

            <StepIndicator currentStep={3} completedSteps={[0, 1, 2]} />

            <div className="text-center space-y-2">
              <p className="font-inter text-[10px] t-text-ghost uppercase tracking-widest">
                4 / 6
              </p>
              <p className="font-body text-lg t-text-secondary">
                Ce dont tu aurais besoin :
              </p>
              <p className="font-inter text-xs t-text-ghost">
                Sans trop réfléchir.
              </p>
            </div>

            <div className="w-full space-y-2.5">
              {BESOIN_CHIPS.map((chip) => (
                <Chip
                  key={chip}
                  label={chip}
                  selected={besoin === chip}
                  onClick={() => { setBesoin(chip); setBesoinOther(""); }}
                />
              ))}
              <Chip
                label="autre"
                selected={besoin === "autre"}
                onClick={() => setBesoin("autre")}
              />
              {besoin === "autre" && (
                <textarea
                  value={besoinOther}
                  onChange={(e) => setBesoinOther(e.target.value)}
                  placeholder="ex : ce qui me ferait du bien là maintenant…"
                  className={textareaClass}
                  rows={2}
                  autoFocus
                />
              )}
            </div>

            <PrimaryButton
              disabled={!besoin || (besoin === "autre" && !besoinOther.trim())}
              onClick={() => {
                trackEvent(userId, "step_complete", { step: "besoin", mode: "approfondi", value: besoinLabel });
                setPhase("alignement");
              }}
            >
              Continuer
            </PrimaryButton>

            <BackButton onClick={() => setPhase("ancrage")} />

          </div>
        </div>
      </ScreenContainer>
    );
  }

  // ════════════════════════════════════════════════════════
  // ALIGNEMENT — 5 / 6 (E - Émerger) — Miroir de clarification
  // ════════════════════════════════════════════════════════
  if (phase === "alignement") {
    return (
      <ScreenContainer overlayOpacity={45}>
        <div className="py-12">
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10">

            <StepIndicator currentStep={4} completedSteps={[0, 1, 2, 3]} />

            <div className="text-center space-y-2">
              <p className="font-inter text-[10px] t-text-ghost uppercase tracking-widest">
                5 / 6
              </p>
              <p className="font-body text-base t-text-secondary leading-relaxed">
                Tu peux laisser ce que tu viens de poser se déposer un instant.
              </p>
            </div>

            {/* Miroir contextuel */}
            <div className="w-full rounded-[20px] border border-[rgba(232,216,199,0.15)] bg-white/5 px-5 py-5 space-y-3">
              {situationLabel && (
                <div className="space-y-0.5">
                  <p className="font-inter text-[10px] t-text-ghost uppercase tracking-widest opacity-60">
                    Ce qui s&apos;est passé
                  </p>
                  <p className="font-body text-base t-text-secondary italic">
                    {situationLabel}
                  </p>
                </div>
              )}
              {emotionLabel && (
                <div className="space-y-0.5">
                  <p className="font-inter text-[10px] t-text-ghost uppercase tracking-widest opacity-60">
                    Ce que j&apos;ai ressenti
                  </p>
                  <p className="font-body text-base t-text-secondary italic">
                    {emotionLabel}
                  </p>
                </div>
              )}
              {besoinLabel && (
                <div className="space-y-0.5">
                  <p className="font-inter text-[10px] t-text-ghost uppercase tracking-widest opacity-60">
                    Ce dont j&apos;aurais besoin
                  </p>
                  <p className="font-body text-base t-text-secondary italic">
                    {besoinLabel}
                  </p>
                </div>
              )}
            </div>

            <div className="text-center space-y-2">
              <p className="font-serif text-xl text-t-beige">
                Quelque chose commence peut-être à apparaître.
              </p>
            </div>

            <PrimaryButton onClick={() => setPhase("action")}>
              Continuer
            </PrimaryButton>

          </div>
        </div>
      </ScreenContainer>
    );
  }

  // ════════════════════════════════════════════════════════
  // ACTION — 6 / 6 (A - Aligner)
  // ════════════════════════════════════════════════════════
  if (phase === "action") {
    return (
      <ScreenContainer overlayOpacity={45}>
        <div className="py-12">
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">

            <StepIndicator currentStep={5} completedSteps={[0, 1, 2, 3, 4]} />

            <div className="text-center space-y-2">
              <p className="font-inter text-[10px] t-text-ghost uppercase tracking-widest">
                6 / 6
              </p>
              <p className="font-body text-lg t-text-secondary">
                Qu&apos;est-ce qui te semble juste maintenant ?
              </p>
              <p className="font-inter text-xs t-text-ghost">
                Une piste, même simple.
              </p>
            </div>

            {/* Suggestions contextuelles — cliquables, remplissent le champ */}
            <div className="w-full space-y-2.5">
              {suggestions.map((s) => (
                <button
                  key={s.text}
                  type="button"
                  onClick={() => { setAction(s.text); setActionSource("suggestion"); setActionKind(s.kind); }}
                  className={`w-full text-left rounded-[18px] px-5 py-3 font-inter text-sm transition-all duration-200 border ${
                    action === s.text
                      ? "bg-t-brume/35 border-[rgba(232,216,199,0.40)] t-text-secondary"
                      : "bg-transparent border-[rgba(232,216,199,0.15)] t-text-ghost hover:border-[rgba(232,216,199,0.28)] hover:t-text-secondary"
                  }`}
                >
                  {s.text}
                </button>
              ))}
            </div>

            {/* Champ libre — jamais pré-rempli automatiquement */}
            <div className="w-full space-y-2">
              <p className="font-inter text-xs t-text-ghost text-center">
                ou en tes propres mots :
              </p>
              <textarea
                value={action}
                onChange={(e) => {
                  const value = e.target.value;
                  setAction(value);
                  const trimmedValue = value.trim();
                  if (!trimmedValue) {
                    setActionSource(null);
                    setActionKind(null);
                    return;
                  }
                  const matched = suggestions.find((x) => x.text === trimmedValue);
                  setActionSource(matched ? "suggestion" : "free_text");
                  setActionKind(matched ? matched.kind : "world");
                }}
                placeholder="ex : ce qui me semble faisable maintenant…"
                className={textareaClass}
                rows={2}
              />
            </div>

            <PrimaryButton
              disabled={!action.trim()}
              onClick={() => {
                trackEvent(userId, "step_complete", { step: "action", mode: "approfondi", value: action });
                setPhase("synthese");
                generateAnalysis();
              }}
            >
              C&apos;est noté
            </PrimaryButton>

            <BackButton onClick={() => setPhase("besoin")} />

          </div>
        </div>
      </ScreenContainer>
    );
  }

  // ════════════════════════════════════════════════════════
  // SYNTHESE — Chargement IA
  // ════════════════════════════════════════════════════════
  if (phase === "synthese") {
    return (
      <ScreenContainer overlayOpacity={45}>
        <div className="py-12">
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
            <p className="font-serif text-xl text-t-beige animate-pulse-gentle text-center">
              On rassemble ta traversée…
            </p>
            <p className="font-inter text-xs t-text-ghost text-center">
              Un instant.
            </p>
          </div>
        </div>
      </ScreenContainer>
    );
  }

  // ════════════════════════════════════════════════════════
  // COMPLETE — Synthèse finale
  // ════════════════════════════════════════════════════════
  return (
    <ScreenContainer overlayOpacity={45}>
      <div className="py-12">
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 animate-fade-up">

          <h1 className="font-serif text-2xl text-t-beige text-center">
            Ta traversée
          </h1>

          {/* Miroir IA */}
          {analysis && (
            <div className="w-full rounded-[20px] border border-[rgba(232,216,199,0.12)] bg-white/5 px-5 py-4 space-y-2">
              <p className="font-inter text-[10px] t-text-ghost uppercase tracking-widest">
                Ce que tu viens de traverser
              </p>
              <p className="font-body text-base t-text-secondary leading-relaxed whitespace-pre-line">
                {analysis}
              </p>
            </div>
          )}

          {/* Clôture */}
          <div className="text-center space-y-2">
            <p className="font-body text-base text-t-beige">
              {getSafeEnding()}
            </p>
            <div
              style={{
                marginTop: "24px",
                color: "rgba(240,230,214,0.72)",
                fontSize: "15px",
                lineHeight: "1.6",
                whiteSpace: "pre-line",
              }}
            >
              {getTraceaTruth()}
            </div>
          </div>

          <p className="font-body text-sm t-text-secondary text-center">
            Cette traversée est gardée dans tes traces.
          </p>

          <InstallPrompt />

          {isFirstSession && !paywallDismissed && !hasPremiumAccess && (
            <PaywallSection onDismiss={() => setPaywallDismissed(true)} />
          )}

          <PrimaryButton onClick={() => router.push("/app")}>
            Terminer
          </PrimaryButton>

          <button
            type="button"
            onClick={() => router.push("/app/historique")}
            className="font-inter text-sm t-text-secondary hover:t-text-beige transition-colors"
          >
            Voir mes traces →
          </button>

          <SafetyResources />

        </div>
      </div>
    </ScreenContainer>
  );
}

// ── Paywall post-session ────────────────────────────────────────
function PaywallSection({ onDismiss }: { onDismiss: () => void }) {
  const router = useRouter();
  return (
    <div className="w-full space-y-5 text-center">
      <p className="font-serif text-xl text-t-beige leading-relaxed">
        Tu viens de poser quelque chose.
      </p>
      <div className="font-body text-base t-text-secondary leading-relaxed space-y-3">
        <p>Avec Premium, tes traversées restent reliées dans le temps.</p>
        <p>Tu peux retrouver tes traces, tes repères, et ce qui revient souvent.</p>
        <p>Sans analyse. Sans conclusion imposée.</p>
      </div>
      <PrimaryButton onClick={() => router.push("/app/subscribe")}>
        Découvrir Premium
      </PrimaryButton>
      <SecondaryButton onClick={onDismiss}>
        Continuer librement
      </SecondaryButton>
      <p className="font-inter text-[10px] t-text-ghost">
        Tu peux arrêter quand tu veux.
      </p>
    </div>
  );
}

