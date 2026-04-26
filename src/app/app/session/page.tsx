"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  createSessionDb,
  updateSessionDb,
  trackEvent,
  getSessionEndCount,
} from "@/lib/supabase-store";
import { Paywall } from "@/components/Paywall";
import { ConsentGate } from "@/components/ConsentGate";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
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

const SITUATION_CHIPS = [
  "une tension avec quelqu'un",
  "une décision difficile",
  "quelque chose m'a blessé",
  "je me suis senti(e) incompris(e)",
  "une situation m'a dépassé(e)",
  "je ne sais pas exactement",
];

const SITUATION_DETAIL_PLACEHOLDERS: Record<string, string> = {
  "une tension avec quelqu'un":
    "ex : il ne m'a pas répondu…",
  "une décision difficile":
    "ex : j'ai dû choisir seule…",
  "quelque chose m'a blessé":
    "ex : une phrase m'est restée…",
  "je me suis senti(e) incompris(e)":
    "ex : mes mots n'ont pas été reçus…",
  "une situation m'a dépassé(e)":
    "ex : tout est arrivé en même temps…",
  "je ne sais pas exactement":
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

const ACTION_SUGGESTIONS: Record<string, string[]> = {
  "être compris(e)": [
    "écrire ce que j'aurais voulu dire",
    "noter ce qui m'a affecté dans cette situation",
    "trouver à qui en parler",
  ],
  "poser une limite": [
    "nommer ce que je ne veux plus",
    "décider ce que je vais dire et comment",
    "écrire ce que je refuse clairement",
  ],
  "clarifier quelque chose": [
    "noter ce qui m'échappe encore",
    "écrire les deux côtés de la situation",
    "nommer ce qui reste flou pour moi",
  ],
  "exprimer ce que j'ai ressenti": [
    "écrire ce qui s'est passé pour moi",
    "trouver les mots exacts pour le dire",
    "dire ce que j'ai gardé pour moi",
  ],
  "prendre du recul": [
    "écrire la situation depuis l'extérieur",
    "noter ce que je ferais autrement",
    "laisser passer avant de réagir",
  ],
  "me rapprocher de quelqu'un": [
    "choisir quand et comment en parler",
    "écrire ce que j'ai envie de partager",
    "trouver ce qui me retient de le faire",
  ],
};

const ACTION_FALLBACK = [
  "mettre au clair ce que je ressens",
  "écrire ce qui compte pour moi",
  "exprimer ce qui m'a touché",
];

function getActionSuggestions(besoin: string): string[] {
  return ACTION_SUGGESTIONS[besoin] ?? ACTION_FALLBACK;
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
    getSessionEndCount(user.id).then(setSessionCount);
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
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <p className="font-serif text-2xl text-espresso">On y est presque.</p>
        <p className="font-body text-base text-espresso/70 leading-relaxed">
          Crée ton espace pour garder ta progression.
        </p>
        <Link
          href="/app/connexion"
          className="btn-primary inline-block !py-4 !text-base !rounded-2xl w-full"
        >
          Continuer
        </Link>
        <p className="font-body text-xs text-warm-gray/50">
          Gratuit. Sans engagement.
        </p>
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
      <SessionContent userId={user.id} />
    </ConsentGate>
  );
}

// ════════════════════════════════════════════════════════════
// CONTENU PRINCIPAL
// ════════════════════════════════════════════════════════════

function SessionContent({ userId }: { userId: string }) {
  const router = useRouter();
  const { session: authSession } = useAuth();

  const [phase, setPhase] = useState<Phase>("intro");

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
  const suggestions = getActionSuggestions(besoinLabel);

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
                  onClick={() => setAction(s)}
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
                onChange={(e) => setAction(e.target.value)}
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

          {/* Récap */}
          <div className="w-full rounded-[20px] border border-[rgba(232,216,199,0.18)] bg-white/5 px-5 py-5 space-y-4">
            <SynthRow label="Ce qui s'est passé"       value={situationLabel} />
            <SynthRow label="Ce que tu as ressenti"    value={emotionLabel} />
            <SynthRow label="Ce dont tu as besoin"     value={besoinLabel} />
            <SynthRow label="Ce qui te semble juste"   value={action} />
          </div>

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
              Tu as pris le temps d&apos;y voir plus clair.
            </p>
            <p className="font-inter text-xs t-text-ghost">
              C&apos;est déjà un pas.
            </p>
          </div>

          <InstallPrompt />

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

// ── Ligne de récap ─────────────────────────────────────────────
function SynthRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="font-inter text-[10px] t-text-ghost uppercase tracking-widest opacity-70">
        {label}
      </p>
      <p className="font-body text-base t-text-secondary italic">
        {value || "—"}
      </p>
    </div>
  );
}
