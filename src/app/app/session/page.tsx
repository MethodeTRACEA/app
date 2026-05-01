"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  | "besoin"
  | "alignement"
  | "action"
  | "synthese"
  | "complete";

// ── Chips ──────────────────────────────────────────────────────

const SAFE_ENDING_PHRASES = [
  "Tu peux t'appuyer là-dessus.",
  "C'est déjà un pas.",
  "Tu viens de poser quelque chose.",
  "Tu as pris un moment pour traverser.",
  "Tu peux rester avec ça un instant.",
  "Quelque chose a été déposé.",
  "Tu n'as pas laissé ça passer sans t'arrêter.",
  "Tu peux revenir à ça si ça revient.",
  "Tu viens de faire un mouvement.",
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
  "Quand ça déborde…\nton système cherche à te protéger.\nPas à te nuire.",
  "L'intensité est dans le corps.\nPas dans ce que tu es.",
  "Quand tout s'accélère à l'intérieur…\nc'est normal\nque tout devienne flou.",
  "Tu es encore là.\nEt ça compte.",
  "Même si c'est encore présent…\nquelque chose\na déjà bougé.",
];

function getTraceaTruth() {
  return TRACEA_TRUTHS[
    Math.floor(Math.random() * TRACEA_TRUTHS.length)
  ];
}

const SITUATION_CHIPS = [
  "une tension avec quelqu'un",
  "une décision difficile",
  "quelque chose m'a blessé",
  "je me suis senti(e) incompris(e)",
  "une situation m'a dépassé(e)",
  "je ne sais pas",
];

const SITUATION_DETAIL_PLACEHOLDERS: Record<string, string> = {
  "une tension avec quelqu'un":
    "ex : quelqu'un n'a pas répondu…",
  "une décision difficile":
    "ex : j'ai dû choisir seul(e)…",
  "quelque chose m'a blessé":
    "ex : une phrase m'est restée…",
  "je me suis senti(e) incompris(e)":
    "ex : mes mots n'ont pas été reçus…",
  "une situation m'a dépassé(e)":
    "ex : tout est arrivé en même temps…",
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
  "confusion",
];

const BESOIN_CHIPS = [
  "être compris(e)",
  "poser une limite",
  "clarifier quelque chose",
  "exprimer ce que j'ai ressenti",
  "prendre du recul",
  "me rapprocher de quelqu'un",
];

// ── Suggestions d'action par besoin (flow long uniquement) ─────
// Interdit : gestes du flow court (respirer, boire, pause, ancrer…)
// Autorisé : clarification, communication, introspection, ajustement relationnel

type ActionEntry = { default: string[]; [emotion: string]: string[] };

const ACTION_SUGGESTIONS: Record<string, ActionEntry> = {
  "être compris(e)": {
    default: [
      "écrire la première phrase que je pourrais dire",
      "écrire ce que j'aurais voulu dire",
      "choisir à qui en parler",
    ],
    "solitude": [
      "envoyer un message simple à quelqu'un",
      "choisir une personne à qui parler",
      "écrire ce que j'aurais besoin qu'on entende",
    ],
    "tristesse": [
      "choisir à qui en parler",
      "écrire ce que j'aurais aimé entendre",
      "demander une présence simple",
    ],
  },
  "poser une limite": {
    default: [
      "dire ce que je n'accepte plus",
      "écrire ma limite avant de la dire",
      "décider ce que je vais dire et quand",
    ],
    "colère": [
      "dire ce que je n'accepte plus",
      "dire ce que je ne veux plus",
      "écrire ma limite avant de la poser",
    ],
    "peur": [
      "choisir la limite la plus simple à poser",
      "écrire ce que je peux dire sans me justifier",
      "attendre un moment plus calme avant d'en parler",
    ],
  },
  "clarifier quelque chose": {
    default: [
      "écrire les deux côtés de la situation",
      "noter ce qui reste flou pour moi",
      "mettre au clair ce que je veux vraiment",
    ],
    "confusion": [
      "écrire les deux côtés de la situation",
      "noter ce qui est clair et ce qui ne l'est pas",
      "nommer ce qui reste flou",
    ],
    "peur": [
      "noter ce que je sais et ce que j'ignore encore",
      "écrire ce qui dépend de moi",
      "attendre avant de conclure",
    ],
  },
  "exprimer ce que j'ai ressenti": {
    default: [
      "écrire ce que j'aurais voulu dire",
      "écrire les premiers mots qui me viennent",
      "dire ce que j'ai gardé pour moi",
    ],
    "colère": [
      "écrire ce que j'aurais voulu dire",
      "écrire ce qui m'a touché avant d'en parler",
      "poser les mots avant de parler",
    ],
    "honte": [
      "écrire ça juste pour moi",
      "noter ce que je ressens, simplement",
      "garder ça pour moi le temps d'y voir clair",
    ],
  },
  "prendre du recul": {
    default: [
      "laisser passer avant de répondre",
      "écrire la situation avec un regard extérieur",
      "noter ce que je ferais autrement",
    ],
    "colère": [
      "laisser passer avant de répondre",
      "écrire ce qui m'a touché avant d'agir",
      "choisir de ne pas répondre tout de suite",
    ],
    "peur": [
      "noter ce qui me fait peur là-dedans",
      "écrire ce qui est sûr, puis ce que je suppose",
      "attendre avant de décider",
    ],
    "tristesse": [
      "noter ce que j'aurais besoin d'entendre",
      "me laisser un moment avant de répondre",
      "écrire ce que je ressens maintenant",
    ],
  },
  "me rapprocher de quelqu'un": {
    default: [
      "envoyer un message simple",
      "choisir le bon moment pour en parler",
      "écrire ce que j'ai envie de partager",
    ],
    "solitude": [
      "envoyer un message simple",
      "proposer un moment sans trop expliquer",
      "dire que j'aimerais ne pas rester seul(e)",
    ],
  },
};

const ACTION_FALLBACK = [
  "écrire ce qui compte pour moi",
  "laisser passer avant de répondre",
  "écrire ce que je veux garder en tête",
];

function getActionSuggestions(besoin: string, emotion?: string): string[] {
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
  const { user, loading, hasPremiumAccess } = useAuth();
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

function SessionContent({ userId, isFirstSession }: { userId: string; isFirstSession: boolean }) {
  const router = useRouter();
  const { session: authSession, hasPremiumAccess } = useAuth();

  const [phase, setPhase] = useState<Phase>("intro");
  const [paywallDismissed, setPaywallDismissed] = useState(false);

  // Données collectées
  const [situation, setSituation] = useState("");
  const [situationOther, setSituationOther] = useState("");
  const [situationComplement, setSituationComplement] = useState("");
  const [emotion, setEmotion] = useState("");
  const [emotionOther, setEmotionOther] = useState("");
  const [besoin, setBesoin] = useState("");
  const [besoinOther, setBesoinOther] = useState("");
  const [alignementChoice, setAlignementChoice] = useState<"oui" | "un peu" | "pas vraiment" | "">("");
  const [action, setAction] = useState("");
  const [actionSource, setActionSource] = useState<"suggestion" | "free_text" | null>(null);

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

  // ── Démarrer session en DB ───────────────────────────────────
  async function startSession() {
    const s = await createSessionDb(userId, null, "autre");
    if (s) {
      setSessionId(s.id);
      trackEvent(userId, "session_start", { mode: "approfondi" });
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
          .catch(() => {
            console.warn("[TRACEA summarize] error");
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
  // SITUATION — 1 / 4
  // ════════════════════════════════════════════════════════
  if (phase === "situation") {
    return (
      <ScreenContainer overlayOpacity={45}>
        <div className="py-12">
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">

            <div className="text-center space-y-2">
              <p className="font-inter text-[10px] t-text-ghost uppercase tracking-widest">
                1 / 4
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
                  placeholder="En quelques mots…"
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
  // ÉMOTION — 2 / 4
  // ════════════════════════════════════════════════════════
  if (phase === "emotion") {
    return (
      <ScreenContainer overlayOpacity={45}>
        <div className="py-12">
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">

            <div className="text-center space-y-2">
              <p className="font-inter text-[10px] t-text-ghost uppercase tracking-widest">
                2 / 4
              </p>
              <p className="font-body text-lg t-text-secondary">
                Qu&apos;est-ce que tu as ressenti ?
              </p>
              <p className="font-inter text-xs t-text-ghost">
                Le plus présent, même en approchant.
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
                  placeholder="En quelques mots…"
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
                setPhase("besoin");
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
  // BESOIN — 3 / 4
  // ════════════════════════════════════════════════════════
  if (phase === "besoin") {
    return (
      <ScreenContainer overlayOpacity={45}>
        <div className="py-12">
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">

            <div className="text-center space-y-2">
              <p className="font-inter text-[10px] t-text-ghost uppercase tracking-widest">
                3 / 4
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
                  placeholder="En quelques mots…"
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

            <BackButton onClick={() => setPhase("emotion")} />

          </div>
        </div>
      </ScreenContainer>
    );
  }

  // ════════════════════════════════════════════════════════
  // ALIGNEMENT — Miroir de clarification
  // ════════════════════════════════════════════════════════
  if (phase === "alignement") {
    return (
      <ScreenContainer overlayOpacity={45}>
        <div className="py-12">
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10">

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
                Est-ce que quelque chose s&apos;est éclairci ?
              </p>
            </div>

            <div className="w-full space-y-2.5">
              {(["oui", "un peu", "pas vraiment"] as const).map((choice) => (
                <Chip
                  key={choice}
                  label={choice}
                  selected={alignementChoice === choice}
                  onClick={() => {
                    setAlignementChoice(choice);
                    setTimeout(() => setPhase("action"), 400);
                  }}
                />
              ))}
            </div>

          </div>
        </div>
      </ScreenContainer>
    );
  }

  // ════════════════════════════════════════════════════════
  // ACTION — 4 / 4
  // ════════════════════════════════════════════════════════
  if (phase === "action") {
    return (
      <ScreenContainer overlayOpacity={45}>
        <div className="py-12">
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">

            <div className="text-center space-y-2">
              <p className="font-inter text-[10px] t-text-ghost uppercase tracking-widest">
                4 / 4
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
                  key={s}
                  type="button"
                  onClick={() => { setAction(s); setActionSource("suggestion"); }}
                  className={`w-full text-left rounded-[18px] px-5 py-3 font-inter text-sm transition-all duration-200 border ${
                    action === s
                      ? "bg-t-brume/35 border-[rgba(232,216,199,0.40)] t-text-secondary"
                      : "bg-transparent border-[rgba(232,216,199,0.15)] t-text-ghost hover:border-[rgba(232,216,199,0.28)] hover:t-text-secondary"
                  }`}
                >
                  {s}
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
                onChange={(e) => { setAction(e.target.value); setActionSource("free_text"); }}
                placeholder="Quelque chose de simple…"
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
            className="font-inter text-xs t-text-ghost hover:t-text-secondary transition-colors"
          >
            Voir mes traces →
          </button>

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
        Tu viens de redescendre un peu.
      </p>
      <div className="font-body text-base t-text-secondary leading-relaxed space-y-3">
        <p>La prochaine fois, tu pourras revenir plus vite.</p>
        <p>
          Tu verras ce qui revient.<br />
          Et ce qui change en toi.
        </p>
        <p>Tu avances, même quand ça revient.</p>
      </div>
      <PrimaryButton onClick={() => router.push("/app/subscribe")}>
        Découvrir l&apos;abonnement
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

