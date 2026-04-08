"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { STEPS } from "@/lib/steps";
import { useAuth } from "@/lib/auth-context";
import {
  createSessionDb,
  updateSessionDb,
} from "@/lib/supabase-store";
import type { SessionData, StepId, TraceaAIResponse } from "@/lib/types";
import { IntensitySlider } from "@/components/IntensitySlider";
import { StepIndicator } from "@/components/StepIndicator";
import { HelpPanel } from "@/components/HelpPanel";
import { SafetyBanner } from "@/components/SafetyBanner";
import { SafetyResources } from "@/components/SafetyResources";
import { PatternObservation } from "@/components/PatternObservation";
import { ConsentGate } from "@/components/ConsentGate";
import { BreathingGuide } from "@/components/BreathingGuide";
import Link from "next/link";
import {
  ScreenContainer,
  StepCard,
  StepHeader,
  PrimaryButton,
  ChoiceChip,
  TextCapsuleField,
  SoftHelpText,
} from "@/components/ui";

type Phase = "intro" | "welcome" | "entry-question" | "session" | "mirror" | "integration" | "intensity-after" | "analysis" | "complete";


export default function SessionPage() {
  const { user, loading } = useAuth();

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
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="font-body text-sm text-warm-gray/60 mb-3">
          Tu es &agrave; un pas de commencer.
        </p>
        <h1 className="font-serif text-2xl md:text-3xl text-espresso mb-4">
          On y est presque.
        </h1>
        <p className="font-body text-base text-espresso/70 leading-relaxed mb-8">
          On cr&eacute;e ton espace pour garder ta progression.
        </p>
        <Link href="/app/connexion" className="btn-primary inline-block !py-4 !text-base !rounded-2xl w-full sm:w-auto">
          Continuer
        </Link>
        <p className="font-body text-xs text-warm-gray/50 mt-4">
          Gratuit. Sans engagement.
        </p>
      </div>
    );
  }

  return (
    <ConsentGate>
      <SessionContent userId={user.id} />
    </ConsentGate>
  );
}

// Cache par étape : texte saisi + réponse IA associée
interface StepCacheEntry {
  text: string;
  validatedText: string; // texte au moment où l'IA a été appelée
  aiResponse: TraceaAIResponse | null;
  aiError: string;
  stepName: string;
}

function SessionContent({ userId }: { userId: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [intensity, setIntensity] = useState(5);
  const [intensityAfter, setIntensityAfter] = useState(3);
  const [intensityAfterTouched, setIntensityAfterTouched] = useState(false);
  const [context, setContext] = useState<SessionData["context"]>("existentiel");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [steps, setSteps] = useState<Record<StepId, string>>({
    traverser: "",
    reconnaitre: "",
    ancrer: "",
    conscientiser: "",
    emerger: "",
    aligner: "",
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [text, setText] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [veriteInterieure, setVeriteInterieure] = useState("");
  const [mirrorData, setMirrorData] = useState<TraceaAIResponse | null>(null);
  const [mirrorLoading, setMirrorLoading] = useState(false);
  const [mirrorStepName, setMirrorStepName] = useState("");
  const [mirrorError, setMirrorError] = useState("");
  const [lastStepSnapshot, setLastStepSnapshot] = useState<TraceaAIResponse["user_state_snapshot"] | null>(null);
  const [modeTraversee, setModeTraversee] = useState<"complet" | "court">("complet");
  const [hadDoNotStore, setHadDoNotStore] = useState(false);
  const [lastNextStepSuggestion, setLastNextStepSuggestion] = useState("");
  const [lastMicroAction, setLastMicroAction] = useState("");
  const [lastInsight, setLastInsight] = useState("");
  const [entryQuestion, setEntryQuestion] = useState("");
  const [integrationResponse, setIntegrationResponse] = useState<"yes" | "no" | "unsure" | null>(null);
  const [integrationMessage, setIntegrationMessage] = useState("");
  const [mirrorNote, setMirrorNote] = useState("");
  const [mirrorNotes, setMirrorNotes] = useState<Record<string, string>>({});

  // ── Étape 1 — Traverser : zone du corps ──
  const [bodyZone, setBodyZone] = useState("");
  const [bodyZoneOther, setBodyZoneOther] = useState("");
  const [showTraverserHelp, setShowTraverserHelp] = useState(false);

  // ── Étape 2 — Reconnaître : choix émotion ──
  const [emotionChoice, setEmotionChoice] = useState("");
  const [emotionOther, setEmotionOther] = useState("");
  const [emotionConfirm, setEmotionConfirm] = useState<"oui" | "proche" | "">("");
  const [showReconnaitreHelp, setShowReconnaitreHelp] = useState(false);
  const [showMoreEmotions, setShowMoreEmotions] = useState(false);

  // ── Étape 3 — Ancrer : respiration + feedback ──
  const [ancrerDone, setAncrerDone] = useState(false);
  const [ancrerFeedback, setAncrerFeedback] = useState<"calme" | "pareil" | "agite" | "">("");
  const [showAncrerHelp, setShowAncrerHelp] = useState(false);
  const [ancrerAlt, setAncrerAlt] = useState(false);
  const [ancrerPostPhase, setAncrerPostPhase] = useState(false);

  // ── Étape 4 — Conscientiser : besoin immédiat ──
  const [ecouterChoice, setEcouterChoice] = useState("");
  const [ecouterOther, setEcouterOther] = useState("");
  const [ecouterConfirm, setEcouterConfirm] = useState<"oui" | "appelle" | "">("");
  const [showEcouterHelp, setShowEcouterHelp] = useState(false);
  const [showMoreNeeds, setShowMoreNeeds] = useState(false);

  // ── Étape 5 — Émerger : micro-action ──
  const [emergerChoice, setEmergerChoice] = useState("");
  const [emergerOther, setEmergerOther] = useState("");
  const [showEmergerHelp, setShowEmergerHelp] = useState(false);

  // ── Étape 6 — Aligner : geste + feedback ──
  const [alignerPhase, setAlignerPhase] = useState<"choix" | "reduction" | "fait" | "feedback">("choix");
  const [alignerReduction, setAlignerReduction] = useState("");
  const [alignerReductionOther, setAlignerReductionOther] = useState("");
  const [alignerFeedback, setAlignerFeedback] = useState<"mieux" | "clair" | "difficile" | "">("");

  // ── Cache des réponses par étape (navigation sans perte) ──
  const [stepCache, setStepCache] = useState<Record<string, StepCacheEntry>>({});

  const STEPS_COURT = ["traverser", "ancrer", "emerger"];
  const stepsActifs = modeTraversee === "court"
    ? STEPS.filter(s => STEPS_COURT.includes(s.id))
    : STEPS;
  const step = stepsActifs[currentStep];
  const stepActuel = stepsActifs[currentStep];
  const activeStepsIndices = modeTraversee === "court" ? [0, 2, 4] : [0, 1, 2, 3, 4, 5];
  const completedSteps = Array.from({ length: currentStep }, (_, i) => activeStepsIndices[i]);
  const currentStepIndicateur = activeStepsIndices[currentStep];

  // Sauvegarde le texte courant dans le cache (sans écraser l'IA)
  function cacheCurrentText() {
    if (!step) return;
    setStepCache(prev => ({
      ...prev,
      [step.id]: {
        ...prev[step.id],
        text: text,
        validatedText: prev[step.id]?.validatedText || "",
        aiResponse: prev[step.id]?.aiResponse || null,
        aiError: prev[step.id]?.aiError || "",
        stepName: step.name,
      },
    }));
  }

  // Restaure le texte depuis le cache quand on navigue vers une étape
  function restoreFromCache(stepIndex: number) {
    const targetStep = stepsActifs[stepIndex];
    if (!targetStep) return;
    const cached = stepCache[targetStep.id];
    setText(cached?.text || steps[targetStep.id as StepId] || "");
  }

  async function handleStartSession() {
    const s = await createSessionDb(userId, intensity, context);
    if (s) {
      setSessionId(s.id);
      setPhase("entry-question");
    }
  }

  async function handleNextStep() {
    if (!sessionId) return;

    const stepId = step.id as StepId;

    // Étape 1 — concaténer la zone du corps au texte si renseignée
    let stepText = text;
    if (stepId === "traverser" && bodyZone) {
      const zone = bodyZone === "autre" && bodyZoneOther.trim() ? bodyZoneOther.trim() : bodyZone;
      stepText = `${text.trim()} [corps: ${zone}]`;
    }

    // Étape 2 — construire le texte depuis le choix émotion
    if (stepId === "reconnaitre" && emotionChoice) {
      const label = emotionChoice === "autre" && emotionOther.trim() ? `autre: ${emotionOther.trim()}` : emotionChoice;
      stepText = emotionConfirm === "proche" ? `${label} (proche)` : label;
    }

    // Étape 3 — construire le texte depuis le feedback
    if (stepId === "ancrer" && ancrerFeedback) {
      const feedbackLabels = { calme: "un peu plus calme", pareil: "pareil", agite: "plus agité" };
      stepText = feedbackLabels[ancrerFeedback];
    }

    // Étape 4 — construire le texte depuis le choix besoin
    if (stepId === "conscientiser" && ecouterChoice) {
      const label = ecouterChoice === "autre" && ecouterOther.trim() ? `autre: ${ecouterOther.trim()}` : ecouterChoice;
      stepText = ecouterConfirm === "appelle" ? `${label} (appelle)` : label;
    }

    // Étape 5 — construire le texte depuis le choix micro-action
    if (stepId === "emerger" && emergerChoice) {
      stepText = emergerChoice === "autre" && emergerOther.trim() ? `autre: ${emergerOther.trim()}` : emergerChoice;
    }

    // Étape 6 — construire le texte depuis le geste final
    if (stepId === "aligner") {
      if (alignerReduction) {
        stepText = alignerReduction === "autre" && alignerReductionOther.trim() ? `autre: ${alignerReductionOther.trim()}` : alignerReduction;
      } else {
        // Geste repris de l'étape 5
        stepText = emergerChoice === "autre" && emergerOther.trim() ? emergerOther.trim() : emergerChoice;
      }
    }

    const updatedSteps = { ...steps, [stepId]: stepText };
    setSteps(updatedSteps);

    const updates: Record<string, unknown> = { steps: updatedSteps };

    if (stepId === "reconnaitre") {
      updates.emotion_primaire = stepText.slice(0, 100);
    }
    if (stepId === "emerger") {
      updates.verite_interieure = stepText.slice(0, 200);
      setVeriteInterieure(stepText.slice(0, 200));
    }
    if (stepId === "aligner") {
      updates.action_alignee = stepText.slice(0, 200);
    }

    await updateSessionDb(sessionId, updates as Parameters<typeof updateSessionDb>[1]);

    // ── Étapes 2, 3, 4, 5 : bypass IA, transition directe (UI affiche du contenu fixe) ──
    if (stepId === "reconnaitre" || stepId === "ancrer" || stepId === "conscientiser" || stepId === "emerger") {
      handleContinueAfterMirror();
      return;
    }

    // ── Vérifier si le cache contient déjà une réponse IA pour ce texte ──
    const cached = stepCache[stepId];
    const textUnchanged = cached?.validatedText === stepText.trim() && cached.aiResponse;

    if (textUnchanged && cached.aiResponse) {
      // Réponse IA déjà générée pour ce texte exact → afficher sans rappeler l'API
      setMirrorStepName(step.name);
      setMirrorData(cached.aiResponse);
      setMirrorError("");
      setMirrorLoading(false);
      setPhase("mirror");

      // Mettre à jour le cache avec le texte courant
      setStepCache(prev => ({
        ...prev,
        [stepId]: { ...prev[stepId], text: stepText },
      }));
      return;
    }

    // ── Pas de cache ou texte modifié → appeler l'API Claude ──
    setMirrorStepName(step.name);
    setMirrorLoading(true);
    setMirrorData(null);
    setMirrorError("");
    setPhase("mirror");

    try {
      const bodyPayload: Record<string, unknown> = {
        type: "step-mirror",
        stepId,
        stepResponse: stepText,
        previousSteps: updatedSteps,
        context,
        intensity,
        userId,
      };

      // Injecter la question d'entrée comme contexte initial à l'étape Traverser
      if (stepId === "traverser" && entryQuestion.trim()) {
        bodyPayload.entryContext = entryQuestion;
      }

      // Injecter les notes intermédiaires (réponses libres des champs "Note-le")
      const notesWithContent = Object.entries(mirrorNotes).filter(([, v]) => v.trim());
      if (notesWithContent.length > 0) {
        bodyPayload.mirrorNotes = Object.fromEntries(notesWithContent);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const res = await fetch("/api/tracea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("API TRACEA error:", res.status, errData);
        const errorMsg = errData.error || `Erreur API (${res.status}). Le reflet n'a pas pu être généré.`;
        setMirrorError(errorMsg);
        // Sauvegarder l'erreur dans le cache
        setStepCache(prev => ({
          ...prev,
          [stepId]: { text: stepText, validatedText: stepText.trim(), aiResponse: null, aiError: errorMsg, stepName: step.name },
        }));
      } else {
        const data = await res.json() as TraceaAIResponse;
        if (data.mirror) {
          setMirrorData(data);
          setLastStepSnapshot(data.user_state_snapshot);
          // Sauvegarder la réponse IA dans le cache
          setStepCache(prev => ({
            ...prev,
            [stepId]: { text: stepText, validatedText: stepText.trim(), aiResponse: data, aiError: "", stepName: step.name },
          }));
          // Phase 2 : tracker le flag do_not_store
          if (data.do_not_store) {
            setHadDoNotStore(true);
          }
          // Phase 3 : stocker pour le résumé post-session
          if (stepId === "aligner") {
            if (data.next_step_suggestion) setLastNextStepSuggestion(data.next_step_suggestion);
            if (data.micro_action) setLastMicroAction(data.micro_action);
          }
          // Note : l'étape "emerger" est bypassée (pas d'appel IA), insight non utilisé
        } else {
          setMirrorError("La réponse de l'IA est vide. Tu peux continuer.");
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
      if (err instanceof DOMException && err.name === "AbortError") {
        setMirrorError("Le temps de réponse a été dépassé. Tu peux continuer ta session.");
      } else {
        setMirrorError("Impossible de contacter l'IA. Vérifie ta connexion.");
      }
    }
    setMirrorLoading(false);
  }

  function handleContinueAfterMirror() {
    const nextIndex = currentStep + 1;
    if (nextIndex < stepsActifs.length) {
      // Restaurer le texte de l'étape suivante depuis le cache (ou vide)
      const nextStepId = stepsActifs[nextIndex].id;
      const cachedNext = stepCache[nextStepId];
      const restoredText = cachedNext?.text || steps[nextStepId as StepId] || "";

      // Sauvegarder la note intermédiaire si non vide
      const currentStepId = stepsActifs[currentStep].id;
      if (mirrorNote.trim()) {
        setMirrorNotes(prev => ({ ...prev, [currentStepId]: mirrorNote.trim() }));
      }

      // Réinitialiser le choix émerger si le besoin (étape 4) a changé les options
      if (nextStepId === "emerger") {
        setEmergerChoice("");
        setEmergerOther("");
      }

      // Passage direct à l'étape suivante (sans écran de transition)
      setMirrorNote("");
      setCurrentStep(nextIndex);
      setText(restoredText);
      setPhase("session");
    } else {
      // Sauvegarder la dernière note si non vide
      const lastStepId = stepsActifs[currentStep].id;
      if (mirrorNote.trim()) {
        setMirrorNotes(prev => ({ ...prev, [lastStepId]: mirrorNote.trim() }));
      }
      // Dernière étape → micro-intégration (Section 5)
      setPhase("integration");
    }
  }

  // ── Navigation arrière ──
  function handleGoBack() {
    // Sauvegarder le texte courant dans le cache avant de reculer
    cacheCurrentText();

    const prevIndex = currentStep - 1;
    if (prevIndex >= 0) {
      setCurrentStep(prevIndex);
      restoreFromCache(prevIndex);
      setPhase("session");
    }
  }

  // Retour depuis le mirror vers l'édition de l'étape courante
  function handleBackToEdit() {
    const cached = stepCache[step?.id];
    setText(cached?.text || steps[step?.id as StepId] || "");
    setPhase("session");
  }

  function handleIntegrationChoice(choice: "yes" | "no" | "unsure") {
    setIntegrationResponse(choice);
    if (choice === "no" || choice === "unsure") {
      setIntegrationMessage("C'est normal. Parfois le changement se voit après.");
      setTimeout(() => {
        setPhase("intensity-after");
      }, 1500);
    } else {
      setPhase("intensity-after");
    }
  }

  async function handleIntensityAfterDone() {
    if (!sessionId) return;
    await updateSessionDb(sessionId, { intensity_after: intensityAfter });
    setPhase("analysis");
    await generateAnalysis();
  }

  async function generateAnalysis() {
    if (!sessionId) return;
    setAnalysisLoading(true);

    let analysisText = "";

    try {
      const res = await fetch("/api/tracea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "final-analysis",
          steps,
          context,
          intensityBefore: intensity,
          intensityAfter,
          userId,
        }),
      });
      const data = await res.json();
      analysisText = data.analysis || "";
    } catch {
      // Fallback si l'API échoue
      analysisText = generateFallbackAnalysis();
    }

    if (!analysisText) {
      analysisText = generateFallbackAnalysis();
    }

    setAnalysis(analysisText);
    await updateSessionDb(sessionId!, {
      analysis: analysisText,
      completed: true,
      intensity_after: intensityAfter,
    });

    // IMPORTANT : afficher l'analyse AVANT de lancer le résumé mémoire
    setAnalysisLoading(false);
    setPhase("complete");

    // Phase 2 : Générer le résumé mémoire en arrière-plan (fire-and-forget)
    const summarizeWithTimeout = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const res = await fetch("/api/tracea/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            userId,
            sessionId,
            steps,
            context,
            intensityBefore: intensity,
            intensityAfter,
            hadDoNotStore,
          }),
        });
        clearTimeout(timeoutId);
        const data = await res.json();
        if (data.success) {
          console.log("[Session] Memory summary generated successfully.");
        } else {
          console.warn("[Session] Memory summary failed:", data.error);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof DOMException && err.name === "AbortError") {
          console.warn("[Session] Memory summary timed out after 15s.");
        } else {
          console.warn("[Session] Memory summary generation failed:", err);
        }
      }
    };
    summarizeWithTimeout(); // lancer sans await
  }

  function generateFallbackAnalysis(): string {
    const recovery = intensity - intensityAfter;
    const parts: string[] = [];

    parts.push(
      `Analyse de ta traversée · ${new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`
    );
    parts.push("");
    parts.push(
      `Contexte : ${context} | Intensité : ${intensity}/10 → ${intensityAfter}/10 (récupération : ${recovery > 0 ? "-" : ""}${Math.abs(recovery)} points)`
    );
    parts.push("");

    if (steps.traverser) {
      parts.push("TRAVERSER · Ce que tu as vécu :");
      parts.push(`« ${steps.traverser.slice(0, 150)}${steps.traverser.length > 150 ? "..." : ""} »`);
      parts.push("");
    }
    if (steps.reconnaitre) {
      parts.push("RECONNAÎTRE · L'émotion primaire identifiée :");
      parts.push(steps.reconnaitre.slice(0, 150));
      parts.push("");
    }
    if (steps.ancrer) {
      parts.push("ANCRER · Stabilisation :");
      parts.push(steps.ancrer.slice(0, 150));
      parts.push("");
    }
    if (steps.conscientiser) {
      parts.push("CONSCIENTISER · Le besoin identifié :");
      parts.push(steps.conscientiser.slice(0, 200));
      parts.push("");
    }
    if (steps.emerger) {
      parts.push("ÉMERGER · Le geste choisi :");
      parts.push(steps.emerger.slice(0, 200));
      parts.push("");
    }
    if (steps.aligner) {
      parts.push("ALIGNER · L'action posée :");
      parts.push(steps.aligner.slice(0, 200));
      parts.push("");
    }

    if (recovery > 0) {
      parts.push(
        `Ton système nerveux a récupéré ${recovery} points d'intensité. Le protocole t'a permis de traverser cette émotion de manière structurée.`
      );
    } else if (recovery === 0) {
      parts.push(
        "Ton intensité est restée stable. Certaines émotions demandent plus d'une traversée."
      );
    } else {
      parts.push(
        "Ton intensité a augmenté. Cela peut arriver lors de prises de conscience profondes."
      );
    }

    return parts.join("\n");
  }

  // --- INTRO ---
  if (phase === "intro") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <p className="section-label">Nouvelle session</p>
        <h1 className="section-title !text-2xl md:!text-4xl">Préparer ta traversée</h1>
        <p className="text-warm-gray mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
          Avant de commencer, évalue ton état actuel.
        </p>

        <div className="card-base mb-6">
          <IntensitySlider value={intensity} onChange={setIntensity} />
        </div>

        <SafetyBanner intensity={intensity} />

        <div className="card-base mb-6 md:mb-8">
          <label className="text-xs font-medium tracking-widest uppercase text-warm-gray block mb-3">
            Contexte de la traversée
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "relationnel", label: "Relationnel" },
                { value: "professionnel", label: "Professionnel" },
                { value: "existentiel", label: "Existentiel" },
                { value: "autre", label: "Autre" },
              ] as const
            ).map((c) => (
              <button
                key={c.value}
                onClick={() => setContext(c.value)}
                className={`py-3.5 md:py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  context === c.value
                    ? "bg-terra text-cream"
                    : "bg-beige text-warm-gray hover:bg-beige-dark"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray text-center mb-4">
            Choisir ton parcours
          </p>
          <button
            onClick={() => { setModeTraversee("complet"); handleStartSession(); }}
            className="btn-primary w-full text-center !py-4 md:!py-3 !text-base md:!text-sm !rounded-2xl"
          >
            Traversée complète · 6 étapes
          </button>
          <button
            onClick={() => { setModeTraversee("court"); handleStartSession(); }}
            className="w-full py-4 md:py-3.5 px-6 rounded-2xl border-2 border-terra/30 text-terra font-medium text-base md:text-sm hover:border-terra hover:bg-terra-light/20 transition-all text-center"
          >
            Traversée courte · 3 étapes
            <span className="block text-xs text-warm-gray font-normal mt-0.5">
              Pour les moments d&apos;intensité élevée
            </span>
          </button>
        </div>
      </div>
    );
  }

  // --- WELCOME (Section 2) ---
  if (phase === "welcome") {
    return <WelcomeScreen onContinue={() => setPhase("entry-question")} />;
  }

  // --- ENTRY QUESTION (Section 3) ---
  if (phase === "entry-question") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 md:py-16 animate-fade-in">
        <div className="text-center max-w-lg mx-auto">
          <h2 className="font-serif text-xl md:text-3xl text-espresso leading-relaxed mb-6 md:mb-8">
            Qu&apos;est-ce qui est le plus présent pour toi en ce moment ?
          </h2>
          <textarea
            value={entryQuestion}
            onChange={(e) => setEntryQuestion(e.target.value)}
            placeholder="Décris ce que tu ressens, sans chercher les bons mots..."
            className="w-full h-32 bg-beige/50 rounded-xl p-4 text-espresso font-body text-base leading-relaxed resize-none border border-beige-dark focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra/20 transition-all placeholder:text-warm-gray/40 mb-6"
          />
          <button
            onClick={() => {
              setCurrentStep(0);
              setPhase("session");
            }}
            className="btn-primary w-full md:w-auto !py-4 md:!py-3 !text-base md:!text-sm !rounded-2xl"
          >
            Continuer
          </button>
        </div>
      </div>
    );
  }

  // (Écran de transition supprimé — passage direct entre étapes)

  // --- SESSION ---
  if (phase === "session") {
    const hasCachedAI = !!(stepCache[step.id]?.aiResponse && stepCache[step.id]?.validatedText === text.trim());

    // ╔═══════════════════════════════════════════════════════════╗
    // ║  ÉTAPE 1 — TRAVERSER (immersif paysage intérieur)        ║
    // ╚═══════════════════════════════════════════════════════════╝
    if (step.id === "traverser") {
      return (
        <ScreenContainer className="py-8 md:py-12">
          <StepIndicator
            currentStep={currentStepIndicateur}
            completedSteps={completedSteps}
            activeSteps={modeTraversee === "court" ? [0, 2, 4] : undefined}
            immersive
          />

          <div className="mt-5 md:mt-6 animate-fade-up" key={currentStep}>
            <StepCard>
              <StepHeader
                stepNumber={step.number}
                stepName={step.name}
                totalSteps={stepsActifs.length}
                currentIndex={currentStep}
                hasCachedAI={hasCachedAI}
              />

              {/* Description — espacée */}
              {step.description && (
                <p className="font-inter text-sm text-t-creme/50 italic mb-8">
                  {step.description}
                </p>
              )}

              {/* Question principale — grande, aérée */}
              {step.question && (
                <p className="font-inter text-lg md:text-xl text-t-beige leading-relaxed whitespace-pre-wrap mb-3">
                  {step.question}
                </p>
              )}

              {/* Textarea capsule */}
              <TextCapsuleField
                value={text}
                onChange={setText}
                placeholder="ex : boule au ventre, tension, agitation, trop de pensées"
                multiline
                rows={2}
                className="h-20 md:h-24"
              />

              {/* Zone du corps — chips — bloc bien séparé */}
              <div className="mt-8">
                <p className="font-inter text-base text-t-beige/90 mb-3.5">
                  Où tu le sens dans ton corps ?
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {["poitrine", "ventre", "gorge", "tête", "épaules", "autre"].map((zone) => (
                    <ChoiceChip
                      key={zone}
                      label={zone.charAt(0).toUpperCase() + zone.slice(1)}
                      selected={bodyZone === zone}
                      onClick={() => { setBodyZone(zone); if (zone !== "autre") setBodyZoneOther(""); }}
                    />
                  ))}
                </div>
                {bodyZone === "autre" && (
                  <TextCapsuleField
                    value={bodyZoneOther}
                    onChange={setBodyZoneOther}
                    placeholder="Où exactement ?"
                    className="mt-3.5"
                  />
                )}
              </div>

              {/* Bouton principal — bien espacé */}
              <div className="flex items-center gap-3 mt-10">
                {currentStep > 0 && (
                  <button
                    onClick={handleGoBack}
                    className="t-btn-secondary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    <span className="hidden sm:inline">Retour</span>
                  </button>
                )}
                <PrimaryButton
                  onClick={handleNextStep}
                  disabled={text.trim().length < 3}
                  className="flex-1"
                >
                  Continuer
                </PrimaryButton>
              </div>

              {/* Aide secondaire */}
              <SoftHelpText trigger="Je ne sais pas trop">
                Tu peux juste choisir la zone du corps la plus marquée.
              </SoftHelpText>
            </StepCard>
            <HelpPanel step={step} />
          </div>
        </ScreenContainer>
      );
    }

    // ╔═══════════════════════════════════════════════════════════╗
    // ║  ÉTAPE 2 — Reconnaître (immersif, overlay allégé)        ║
    // ╚═══════════════════════════════════════════════════════════╝
    if (step.id === "reconnaitre") {
      return (
        <ScreenContainer className="py-8 md:py-12" overlayOpacity={22}>
          <StepIndicator
            currentStep={currentStepIndicateur}
            completedSteps={completedSteps}
            activeSteps={modeTraversee === "court" ? [0, 2, 4] : undefined}
            immersive
          />

          <div className="mt-5 md:mt-6 animate-fade-up" key={currentStep}>
            <StepCard>
              <StepHeader
                stepNumber={step.number}
                stepName={step.name}
                totalSteps={stepsActifs.length}
                currentIndex={currentStep}
                hasCachedAI={hasCachedAI}
              />

              {/* Description */}
              {step.description && (
                <p className="font-inter text-sm text-t-creme/55 italic mb-8">
                  {step.description}
                </p>
              )}

              {/* Question principale */}
              <p className="font-inter text-lg md:text-xl text-t-beige leading-relaxed whitespace-pre-wrap mb-3">
                {step.question}
              </p>

              {/* Chips émotion — contraste légèrement renforcé */}
              <div className="mt-6">
                <div className="flex flex-wrap gap-2.5">
                  {(showMoreEmotions
                    ? ["tension", "peur", "tristesse", "colère", "fatigue", "confusion", "trop-plein", "vide", "autre"]
                    : ["tension", "peur", "tristesse", "colère", "fatigue"]
                  ).map((emo) => (
                    <ChoiceChip
                      key={emo}
                      label={emo.charAt(0).toUpperCase() + emo.slice(1)}
                      selected={emotionChoice === emo}
                      onClick={() => { setEmotionChoice(emo); setEmotionConfirm(""); if (emo !== "autre") setEmotionOther(""); }}
                      className="border-t-creme/25 text-t-creme/90"
                    />
                  ))}
                  {!showMoreEmotions && (
                    <button
                      onClick={() => setShowMoreEmotions(true)}
                      className="px-3 py-1.5 rounded-full text-sm font-inter border border-t-creme/15 text-t-creme/50 hover:text-t-creme/70 transition-colors"
                    >
                      + voir plus
                    </button>
                  )}
                </div>
                {emotionChoice === "autre" && (
                  <TextCapsuleField
                    value={emotionOther}
                    onChange={setEmotionOther}
                    placeholder="Un mot simple…"
                    className="mt-3.5"
                  />
                )}
              </div>

              {/* Micro-texte — apparaît quand un choix est fait */}
              {emotionChoice && (emotionChoice !== "autre" || emotionOther.trim()) && (
                <p className="font-inter text-sm text-t-creme/45 mt-4 italic">
                  Pas besoin d&apos;être exact. C&apos;est assez.
                </p>
              )}

              {/* Bouton principal */}
              <div className="flex items-center gap-3 mt-10">
                {currentStep > 0 && (
                  <button
                    onClick={handleGoBack}
                    className="t-btn-secondary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    <span className="hidden sm:inline">Retour</span>
                  </button>
                )}
                <PrimaryButton
                  onClick={handleNextStep}
                  disabled={!emotionChoice || (emotionChoice === "autre" && !emotionOther.trim())}
                  className="flex-1"
                >
                  Continuer
                </PrimaryButton>
              </div>

              {/* Aide secondaire */}
              <SoftHelpText trigger="Aucun mot ne colle vraiment">
                Ce n&apos;est pas grave. Choisis juste ce qui s&apos;en approche le plus.
              </SoftHelpText>
            </StepCard>
            <HelpPanel step={step} />
          </div>
        </ScreenContainer>
      );
    }

    // ╔═══════════════════════════════════════════════════════════╗
    // ║  ÉTAPE 3 — Ancrer (immersif, ralenti, respirant)         ║
    // ╚═══════════════════════════════════════════════════════════╝
    if (step.id === "ancrer") {
      return (
        <ScreenContainer className="py-10 md:py-16" overlayOpacity={18}>
          <StepIndicator
            currentStep={currentStepIndicateur}
            completedSteps={completedSteps}
            activeSteps={modeTraversee === "court" ? [0, 2, 4] : undefined}
            immersive
          />

          <div className="mt-6 md:mt-8 animate-fade-up" key={currentStep}>
            {/* Micro-texte de transition depuis reconnaitre */}
            <p className="font-body text-sm text-warm-gray/70 italic text-center mb-4">
              Ça semble bien présent. On va juste revenir au corps.
            </p>

            <StepCard className={`transition-all duration-1000 ease-in-out ${!ancrerDone ? "!bg-[rgba(50,35,28,0.08)] !border-[rgba(232,216,199,0.03)] !shadow-none !backdrop-blur-[40px]" : ""}`}>
              {/* En-tête — très effacé pendant la respiration */}
              <div className={`transition-opacity duration-1000 ${!ancrerDone ? "opacity-[0.3]" : "opacity-100"}`}>
                <StepHeader
                  stepNumber={step.number}
                  stepName={step.name}
                  totalSteps={stepsActifs.length}
                  currentIndex={currentStep}
                  hasCachedAI={hasCachedAI}
                />
              </div>

              {/* Description courte — s'efface pendant la respiration */}
              <p className={`font-inter text-sm text-t-creme/45 italic transition-all duration-1000 ${!ancrerDone ? "mb-2 opacity-[0.2]" : "mb-10 opacity-100"}`}>
                Juste ralentir.
              </p>

              {/* Phase 1 — Respiration guidée */}
              {!ancrerDone && !ancrerAlt && (
                <div>
                  <BreathingGuide onComplete={() => setAncrerDone(true)} immersive />
                  <div className="text-center mt-6">
                    <button
                      onClick={() => setAncrerAlt(true)}
                      className="font-inter text-sm text-t-creme/70 underline underline-offset-4 hover:text-t-creme transition-colors py-3 px-4"
                    >
                      Je préfère juste sentir mon corps
                    </button>
                  </div>
                </div>
              )}

              {/* Phase 1 alt — Sentir sans respirer */}
              {ancrerAlt && !ancrerDone && (
                <div className="py-12 text-center">
                  <p className="font-inter text-sm text-t-creme/55 leading-relaxed mb-8">
                    Sens le point le plus tendu. Reste là.
                  </p>
                  <button
                    onClick={() => setAncrerDone(true)}
                    className="t-btn-secondary"
                  >
                    J&apos;ai pris le temps
                  </button>
                </div>
              )}

              {/* Phase 2 — Feedback post-respiration (masqué en post-phase) */}
              {ancrerDone && !ancrerPostPhase && (
                <>
                  <p className="font-inter text-lg text-t-beige leading-relaxed mb-4">
                    {step.question}
                  </p>
                  <div className="flex flex-wrap gap-2.5 mt-2">
                    {([["calme", "Un peu plus calme"], ["pareil", "Pareil"], ["agite", "Plus agité"]] as const).map(([key, label]) => (
                      <ChoiceChip
                        key={key}
                        label={label}
                        selected={ancrerFeedback === key}
                        onClick={() => setAncrerFeedback(key)}
                      />
                    ))}
                  </div>
                  {ancrerFeedback === "agite" && !ancrerPostPhase && (
                    <p className="font-inter text-sm text-t-creme/50 mt-4 italic">
                      Ok. On ne force pas. On continue doucement.
                    </p>
                  )}
                </>
              )}

              {/* Bouton — vers post-feedback (bypass IA) */}
              {ancrerDone && !ancrerPostPhase && (
                <div className="flex items-center gap-3 mt-12">
                  <button
                    onClick={handleGoBack}
                    className="t-btn-secondary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    <span className="hidden sm:inline">Retour</span>
                  </button>
                  <PrimaryButton
                    onClick={() => setAncrerPostPhase(true)}
                    disabled={!ancrerFeedback}
                    className="flex-1"
                  >
                    Continuer
                  </PrimaryButton>
                </div>
              )}

              {/* Aide — visible après feedback, avant post-phase */}
              {ancrerDone && !ancrerPostPhase && (
                <SoftHelpText trigger="Je ne sais pas trop">
                  Choisis juste ce qui se rapproche le plus de ce que tu ressens.
                </SoftHelpText>
              )}

              {/* Phase 3 — Post-feedback conditionnel (pas d'IA) */}
              {ancrerPostPhase && (
                <div className="mt-10 animate-fade-up">
                  {ancrerFeedback === "calme" && (
                    <>
                      <p className="font-inter text-base text-t-beige/90 leading-relaxed mb-10">
                        Ok. On reste simple.
                      </p>
                      <PrimaryButton onClick={handleNextStep} className="w-full">
                        Continuer
                      </PrimaryButton>
                    </>
                  )}

                  {ancrerFeedback === "pareil" && (
                    <>
                      <p className="font-inter text-base text-t-beige/90 leading-relaxed mb-8">
                        On ajuste un peu.
                      </p>
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => {
                            setAncrerDone(false);
                            setAncrerPostPhase(false);
                            setAncrerFeedback("");
                          }}
                          className="t-btn-secondary w-full justify-center"
                        >
                          Refaire un cycle
                        </button>
                        <button
                          onClick={() => {
                            setAncrerAlt(true);
                            setAncrerDone(false);
                            setAncrerPostPhase(false);
                            setAncrerFeedback("");
                          }}
                          className="t-btn-secondary w-full justify-center"
                        >
                          Sentir mon corps
                        </button>
                      </div>
                    </>
                  )}

                  {ancrerFeedback === "agite" && (
                    <>
                      <p className="font-inter text-base text-t-beige/90 leading-relaxed mb-8">
                        On change.
                      </p>
                      <div className="flex flex-col gap-3">
                        {["Sentir mes pieds au sol", "Regarder autour de moi", "Sentir un point de contact"].map((label) => (
                          <button
                            key={label}
                            onClick={handleNextStep}
                            className="t-btn-secondary w-full justify-center"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </StepCard>
            <HelpPanel step={step} />
          </div>
        </ScreenContainer>
      );
    }

    // ╔═══════════════════════════════════════════════════════════╗
    // ║  ÉTAPE 4 — Conscientiser (immersif, remontée douce)      ║
    // ╚═══════════════════════════════════════════════════════════╝
    if (step.id === "conscientiser") {
      return (
        <ScreenContainer className="py-8 md:py-12" overlayOpacity={4}>
          {/* Couche lumière étape 4 : halo central, horizon, bas allégé */}
          <div
            className="fixed inset-0 pointer-events-none z-[1]"
            style={{
              background: [
                /* halo doré derrière la carte — plus diffus */
                "radial-gradient(ellipse 90% 65% at 50% 45%, rgba(214,165,106,0.04) 0%, transparent 65%)",
                /* ligne d'horizon lumineuse */
                "radial-gradient(ellipse 120% 8% at 50% 38%, rgba(214,165,106,0.05) 0%, transparent 80%)",
                /* vignette latérale — contraste fond renforcé */
                "radial-gradient(ellipse 55% 65% at 50% 50%, transparent 0%, rgba(35,25,22,0.28) 100%)",
                /* bas allégé */
                "linear-gradient(to top, rgba(35,25,22,0.06) 0%, transparent 35%)",
              ].join(", "),
            }}
          />

          <StepIndicator
            currentStep={currentStepIndicateur}
            completedSteps={completedSteps}
            activeSteps={modeTraversee === "court" ? [0, 2, 4] : undefined}
            immersive
          />

          <div className="mt-5 md:mt-6 animate-fade-up" key={currentStep}>
            <StepCard className="!bg-[rgba(50,35,28,0.32)] !backdrop-blur-[18px] !border-[rgba(232,216,199,0.11)] !shadow-[0_8px_40px_rgba(0,0,0,0.15),0_0_0_1px_rgba(232,216,199,0.05)_inset,0_0_50px_rgba(214,165,106,0.03)]">
              <StepHeader
                stepNumber={step.number}
                stepName={step.name}
                totalSteps={stepsActifs.length}
                currentIndex={currentStep}
                hasCachedAI={hasCachedAI}
              />

              {/* Description */}
              {step.description && (
                <p className="font-inter text-sm text-t-creme/60 italic mb-8">
                  {step.description}
                </p>
              )}

              {/* Question principale */}
              <p className="font-inter text-lg md:text-xl text-t-beige leading-relaxed whitespace-pre-wrap mb-3">
                {step.question}
              </p>

              {/* Chips besoin */}
              <div className="mt-6">
                <div className="flex flex-wrap gap-2.5">
                  {(showMoreNeeds
                    ? ["ralentir", "souffler", "relâcher", "être rassuré", "espace", "soutien", "pause", "autre"]
                    : ["ralentir", "souffler", "espace", "pause"]
                  ).map((need) => (
                    <ChoiceChip
                      key={need}
                      label={need.charAt(0).toUpperCase() + need.slice(1)}
                      selected={ecouterChoice === need}
                      onClick={() => { setEcouterChoice(need); setEcouterConfirm(""); if (need !== "autre") setEcouterOther(""); }}
                      className="border-t-creme/30 text-t-creme"
                    />
                  ))}
                  {!showMoreNeeds && (
                    <button
                      onClick={() => setShowMoreNeeds(true)}
                      className="px-3 py-1.5 rounded-full text-sm font-inter border border-t-creme/15 text-t-creme/50 hover:text-t-creme/70 transition-colors"
                    >
                      + voir plus
                    </button>
                  )}
                </div>
                {ecouterChoice === "autre" && (
                  <TextCapsuleField
                    value={ecouterOther}
                    onChange={setEcouterOther}
                    placeholder="Ce qui aiderait…"
                    className="mt-3.5"
                  />
                )}
              </div>

              {/* Micro-texte — apparaît quand un choix est fait */}
              {ecouterChoice && (ecouterChoice !== "autre" || ecouterOther.trim()) && (
                <p className="font-inter text-sm text-t-creme/45 mt-4 italic">
                  C&apos;est assez pour avancer.
                </p>
              )}

              {/* Bouton principal */}
              <div className="flex items-center gap-3 mt-10">
                {currentStep > 0 && (
                  <button
                    onClick={handleGoBack}
                    className="t-btn-secondary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    <span className="hidden sm:inline">Retour</span>
                  </button>
                )}
                <PrimaryButton
                  onClick={handleNextStep}
                  disabled={!ecouterChoice || (ecouterChoice === "autre" && !ecouterOther.trim())}
                  className="flex-1"
                >
                  Continuer
                </PrimaryButton>
              </div>

              {/* Aide secondaire */}
              <SoftHelpText trigger="Je ne sais pas">
                Choisis ce qui soulagerait un tout petit peu, même si ce n&apos;est pas parfait.
              </SoftHelpText>
            </StepCard>
            <HelpPanel step={step} />
          </div>
        </ScreenContainer>
      );
    }

    // ╔═══════════════════════════════════════════════════════════╗
    // ║  ÉTAPE 5 — Émerger (immersif, mouvement, action)         ║
    // ╚═══════════════════════════════════════════════════════════╝
    if (step.id === "emerger") {
      return (
        <ScreenContainer
          className="py-8 md:py-12"
          overlayOpacity={3}
          /* backgroundImage="/images/tracea-bg-step5.png" — à activer quand l'image sera prête */
        >
          {/* Couche lumière étape 5 : direction vers l'avant, guidage chemin */}
          <div
            className="fixed inset-0 pointer-events-none z-[1]"
            style={{
              background: [
                /* 1. Point d'appel lumineux — orangé chaud au-dessus du chemin */
                "radial-gradient(ellipse 40% 30% at 50% 42%, rgba(220,170,100,0.13) 0%, transparent 70%)",
                /* 2. Trace lumineuse sur le chemin — bande verticale étroite */
                "radial-gradient(ellipse 15% 60% at 50% 65%, rgba(232,216,199,0.10) 0%, transparent 75%)",
                /* 3. Réduction contraste autour du chemin — fondu latéral doux */
                "radial-gradient(ellipse 80% 70% at 50% 55%, transparent 30%, rgba(35,25,22,0.10) 100%)",
                /* 4. Horizon lumineux */
                "radial-gradient(ellipse 150% 12% at 50% 38%, rgba(232,216,199,0.07) 0%, transparent 80%)",
                /* 5. Overlay directionnel — plus sombre en bas, plus clair en haut */
                "linear-gradient(to top, rgba(35,25,22,0.10) 0%, transparent 40%, rgba(232,216,199,0.05) 100%)",
              ].join(", "),
            }}
          />

          <StepIndicator
            currentStep={currentStepIndicateur}
            completedSteps={completedSteps}
            activeSteps={modeTraversee === "court" ? [0, 2, 4] : undefined}
            immersive
          />

          <div className="mt-5 md:mt-6 animate-fade-up" key={currentStep}>
            <StepCard className="!bg-[rgba(50,35,28,0.20)] !backdrop-blur-[14px] !border-[rgba(232,216,199,0.09)]">
              <StepHeader
                stepNumber={step.number}
                stepName={step.name}
                totalSteps={stepsActifs.length}
                currentIndex={currentStep}
                hasCachedAI={hasCachedAI}
              />

              {/* Description */}
              {step.description && (
                <p className="font-inter text-sm text-t-creme/55 italic mb-8">
                  {step.description}
                </p>
              )}

              {/* Question principale */}
              <p className="font-inter text-lg md:text-xl text-t-beige leading-relaxed whitespace-pre-wrap mb-3">
                {step.question}
              </p>

              {/* Chips micro-action — conditionnées par le besoin (étape 4) */}
              <div className="mt-6">
                <div className="flex flex-wrap gap-2.5">
                  {((): string[] => {
                    const noBreathing = ancrerFeedback === "agite";
                    let options: string[];
                    switch (ecouterChoice) {
                      case "espace":
                        options = ["sortir prendre l'air", "m'éloigner un moment", "couper une stimulation", "boire un verre d'eau ailleurs"];
                        break;
                      case "soutien":
                      case "être rassuré":
                        options = ["envoyer un message à quelqu'un", "appeler une personne de confiance", "me rappeler un moment rassurant", "écrire ce que je voudrais entendre"];
                        break;
                      case "pause":
                      case "ralentir":
                      case "souffler":
                        options = noBreathing
                          ? ["me poser 2 minutes", "fermer les yeux un instant", "m'asseoir quelque part au calme", "boire un verre d'eau"]
                          : ["me poser 2 minutes", "fermer les yeux un instant", "respirer encore un peu", "m'asseoir quelque part au calme"];
                        break;
                      case "relâcher":
                        options = noBreathing
                          ? ["étirer mon corps doucement", "secouer mes mains", "me poser 2 minutes", "boire un verre d'eau"]
                          : ["étirer mon corps doucement", "secouer mes mains", "respirer encore un peu", "me poser 2 minutes"];
                        break;
                      default:
                        options = noBreathing
                          ? ["boire un verre d'eau", "me poser 2 minutes", "sortir prendre l'air", "fermer les yeux un instant"]
                          : ["boire un verre d'eau", "respirer encore un peu", "me poser 2 minutes", "sortir prendre l'air"];
                        break;
                    }
                    return options;
                  })().concat(["je ne sais pas", "autre"]).map((action) => (
                    <ChoiceChip
                      key={action}
                      label={action.charAt(0).toUpperCase() + action.slice(1)}
                      selected={emergerChoice === action}
                      onClick={() => { setEmergerChoice(action); if (action !== "autre") setEmergerOther(""); }}
                      className="border-t-creme/25 text-t-creme/90"
                    />
                  ))}
                </div>
                {emergerChoice === "autre" && (
                  <TextCapsuleField
                    value={emergerOther}
                    onChange={setEmergerOther}
                    placeholder="Quelque chose de simple…"
                    className="mt-3.5"
                  />
                )}
                {emergerChoice && (emergerChoice !== "autre" || emergerOther.trim()) && (
                  <p className="font-inter text-sm text-t-creme/45 mt-4 italic">
                    Lequel te paraît le plus simple ?
                  </p>
                )}
              </div>

              {/* Bouton principal */}
              <div className="flex items-center gap-3 mt-10">
                {currentStep > 0 && (
                  <button
                    onClick={handleGoBack}
                    className="t-btn-secondary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    <span className="hidden sm:inline">Retour</span>
                  </button>
                )}
                <PrimaryButton
                  onClick={handleNextStep}
                  disabled={!emergerChoice || (emergerChoice === "autre" && !emergerOther.trim())}
                  className="flex-1"
                >
                  Continuer
                </PrimaryButton>
              </div>

              {/* Aide secondaire */}
              <SoftHelpText trigger="Rien ne vient clairement">
                Choisis juste l&apos;option la plus douce.
              </SoftHelpText>
            </StepCard>
            <HelpPanel step={step} />
          </div>
        </ScreenContainer>
      );
    }

    // ╔═══════════════════════════════════════════════════════════╗
    // ║  ÉTAPE 6 — Aligner (immersif, stabilité, clarté)         ║
    // ╚═══════════════════════════════════════════════════════════╝
    return (
      <ScreenContainer className="py-8 md:py-12" overlayOpacity={2}>
        {/* Couche lumière étape 6 : présence stable, recentrage, ancrage */}
        <div
          className="fixed inset-0 pointer-events-none z-[1]"
          style={{
            background: [
              /* 1. Halo de présence — plus dense, moins diffus */
              "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(214,165,106,0.08) 0%, transparent 55%)",
              /* 2. Chaleur centrale — recentrage */
              "radial-gradient(ellipse 50% 50% at 50% 48%, rgba(220,170,100,0.04) 0%, transparent 60%)",
              /* 3. Chemin haut — aboutissement lumineux */
              "radial-gradient(ellipse 16% 35% at 50% 35%, rgba(232,216,199,0.08) 0%, transparent 70%)",
              /* 4. Bords doux */
              "radial-gradient(ellipse 65% 75% at 50% 50%, transparent 0%, rgba(35,25,22,0.10) 100%)",
              /* 5. Bas assombri — ancrage renforcé */
              "linear-gradient(to top, rgba(35,25,22,0.18) 0%, rgba(35,25,22,0.06) 25%, transparent 45%)",
            ].join(", "),
          }}
        />

        <StepIndicator
          currentStep={currentStepIndicateur}
          completedSteps={completedSteps}
          activeSteps={modeTraversee === "court" ? [0, 2, 4] : undefined}
          immersive
        />

        <div className="mt-5 md:mt-6 animate-fade-up" key={currentStep}>
          <StepCard className="!bg-[rgba(50,35,28,0.32)] !backdrop-blur-[22px] !border-[rgba(232,216,199,0.13)] !shadow-[0_6px_30px_rgba(0,0,0,0.14),0_0_0_1px_rgba(232,216,199,0.05)_inset]">
            <StepHeader
              stepNumber={step.number}
              stepName={step.name}
              totalSteps={stepsActifs.length}
              currentIndex={currentStep}
              hasCachedAI={hasCachedAI}
            />

            {/* Description */}
            {step.description && (
              <p className="font-inter text-sm text-t-creme/55 italic mb-8">
                {step.description}
              </p>
            )}

            {/* Phase choix — rappel du geste OU proposition si "je ne sais pas" */}
            {alignerPhase === "choix" && (
              <div className="mt-2">
                {emergerChoice && emergerChoice !== "je ne sais pas" ? (
                  <>
                    <p className="font-inter text-sm text-t-creme/60 mb-3">
                      Ton geste du moment :
                    </p>
                    <div className="t-card !p-3 !rounded-xl mb-5">
                      <p className="font-inter text-base text-t-beige">
                        {emergerChoice === "autre" && emergerOther.trim() ? emergerOther.trim() : emergerChoice}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <button
                        onClick={() => { setAlignerPhase("fait"); setTimeout(() => setAlignerPhase("feedback"), 1500); }}
                        className="t-chip t-chip-active text-left"
                      >
                        Je le fais maintenant
                      </button>
                      <button
                        onClick={() => setAlignerPhase("reduction")}
                        className="t-chip text-left"
                      >
                        Je choisis encore plus petit
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-inter text-base text-t-beige/90 leading-relaxed mb-6">
                      On va juste choisir quelque chose de très simple.
                    </p>
                    <div className="flex flex-col gap-2.5">
                      {(ancrerFeedback === "agite"
                        ? ["poser une main sur soi", "regarder autour de soi", "boire une gorgée d'eau"]
                        : ["respirer une fois lentement", "poser une main sur soi", "regarder autour de soi"]
                      ).map((geste) => (
                        <button
                          key={geste}
                          onClick={() => {
                            setAlignerReduction(geste);
                            setAlignerPhase("fait");
                            setTimeout(() => setAlignerPhase("feedback"), 1500);
                          }}
                          className="t-chip text-left"
                        >
                          {geste.charAt(0).toUpperCase() + geste.slice(1)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Phase réduction */}
            {alignerPhase === "reduction" && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2.5">
                  {(ancrerFeedback === "agite"
                    ? ["juste m'asseoir", "juste poser une main sur moi", "juste boire une gorgée d'eau", "autre"]
                    : ["juste m'asseoir", "juste poser une main sur moi", "juste boire une gorgée d'eau", "juste respirer une fois lentement", "autre"]
                  ).map((opt) => (
                    <ChoiceChip
                      key={opt}
                      label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                      selected={alignerReduction === opt}
                      onClick={() => { setAlignerReduction(opt); if (opt !== "autre") { setAlignerReductionOther(""); setAlignerPhase("fait"); setTimeout(() => setAlignerPhase("feedback"), 1500); } }}
                    />
                  ))}
                </div>
                {alignerReduction === "autre" && (
                  <>
                    <TextCapsuleField
                      value={alignerReductionOther}
                      onChange={setAlignerReductionOther}
                      placeholder="Le plus petit geste…"
                      className="mt-3.5"
                    />
                    {alignerReductionOther.trim() && (
                      <button
                        onClick={() => { setAlignerPhase("fait"); setTimeout(() => setAlignerPhase("feedback"), 1500); }}
                        className="t-btn-secondary mt-3"
                      >
                        C&apos;est celui-là
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Phase fait — pause */}
            {alignerPhase === "fait" && (
              <div className="py-8 text-center">
                <p className="font-inter text-sm text-t-creme/50 italic">
                  C&apos;est suffisant pour maintenant.
                </p>
              </div>
            )}

            {/* Phase feedback */}
            {alignerPhase === "feedback" && (
              <>
                <p className="font-inter text-lg text-t-beige leading-relaxed mb-4">
                  {step.question}
                </p>
                <div className="flex flex-wrap gap-2.5 mt-2">
                  {([["mieux", "Un peu mieux"], ["clair", "Pareil mais plus clair"], ["difficile", "Encore difficile"]] as const).map(([key, label]) => (
                    <ChoiceChip
                      key={key}
                      label={label}
                      selected={alignerFeedback === key}
                      onClick={() => setAlignerFeedback(key)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Bouton principal — masqué pendant "fait" */}
            {alignerPhase !== "fait" && (
              <div className="flex items-center gap-3 mt-10">
                {currentStep > 0 && (
                  <button
                    onClick={handleGoBack}
                    className="t-btn-secondary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    <span className="hidden sm:inline">Retour</span>
                  </button>
                )}
                <PrimaryButton
                  onClick={handleNextStep}
                  disabled={alignerPhase === "feedback" ? !alignerFeedback : true}
                  className="flex-1"
                >
                  Terminer
                </PrimaryButton>
              </div>
            )}
          </StepCard>
          <HelpPanel step={step} />
        </div>
      </ScreenContainer>
    );
  }

  // --- MIRROR (retour après chaque étape) ---
  if (phase === "mirror") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
        <StepIndicator
          currentStep={currentStepIndicateur}
          completedSteps={[...completedSteps, currentStepIndicateur]}
          activeSteps={modeTraversee === "court" ? [0, 2, 4] : undefined}
        />
        <div className="mt-4 md:mt-8 animate-fade-up">
          <div className="flex items-center gap-3 mb-5 md:mb-6">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-sage rounded-full flex items-center justify-center font-serif text-base md:text-lg text-cream flex-shrink-0">
              ✓
            </div>
            <h2 className="font-serif text-xl md:text-2xl text-espresso">{mirrorStepName}</h2>
          </div>

          {mirrorLoading ? (
            <div className="text-center py-6">
              <p className="text-sm text-warm-gray italic animate-pulse-gentle">
                Un instant.
              </p>
            </div>
          ) : mirrorError ? (
            <div className="border-l-[3px] border-dusty pl-6 py-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-dusty" />
                <p className="text-xs font-medium tracking-widest uppercase text-dusty">
                  Information
                </p>
              </div>
              <p className="font-body text-sm text-warm-gray leading-relaxed">
                {mirrorError}
              </p>
            </div>
          ) : mirrorData ? (
            <div className="space-y-6 mb-6 animate-fade-up">
              {/* Miroir — "Ce que tu vis" + ancrage étape 2 */}
              <div className="border-l-[3px] border-sage pl-6 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-sage" />
                  <p className="text-xs font-medium tracking-widest uppercase text-sage">
                    Ce que tu vis
                  </p>
                </div>
                <p className="font-body text-base text-espresso leading-relaxed">
                  {step?.id === "conscientiser" && ecouterChoice
                    ? `Ça semble appeler ${ecouterChoice === "être rassuré" ? "d'être rassuré" : ecouterChoice === "relâcher" ? "à relâcher" : ecouterChoice === "autre" && ecouterOther.trim() ? ecouterOther.trim() : ["soutien", "espace", "pause"].includes(ecouterChoice) ? (ecouterChoice === "soutien" ? "du soutien" : ecouterChoice === "espace" ? "de l'espace" : "une pause") : ecouterChoice === "ralentir" ? "à ralentir" : ecouterChoice === "souffler" ? "à souffler" : ecouterChoice}.`
                    : step?.id === "emerger" && emergerChoice
                    ? (emergerChoice === "autre" && emergerOther.trim()
                        ? `${emergerOther.trim().charAt(0).toUpperCase() + emergerOther.trim().slice(1)}.`
                        : `${emergerChoice.charAt(0).toUpperCase() + emergerChoice.slice(1)}.`)
                    : mirrorData.mirror}
                </p>
                {step?.id === "conscientiser" && (
                  <p className="font-body text-sm text-espresso/70 leading-relaxed mt-3 italic">
                    Laisse ça être là, sans chercher à préciser.
                  </p>
                )}
                {step?.id === "emerger" && (
                  <p className="font-body text-sm text-espresso/70 leading-relaxed mt-3 italic whitespace-pre-line">
                    {emergerChoice === "je ne sais pas"
                      ? "On reste simple.\nJuste quelque chose de très petit."
                      : "Ok. Tu peux faire ça simplement."}
                  </p>
                )}
                {step?.id === "reconnaitre" && (
                  <p className="font-body text-sm text-espresso/70 leading-relaxed mt-3 italic">
                    Là, reste juste avec ça un instant.
                  </p>
                )}
              </div>

              {/* Progress signal — "Ce qui évolue en toi" (Phase 3 — uniquement étapes C, É, A) */}
              {mirrorData.progress_signal &&
                ["conscientiser", "emerger", "aligner"].includes(step?.id || "") && (
                <div className="flex items-start gap-2 pl-6 py-2">
                  <span className="text-sage text-sm mt-0.5">↗</span>
                  <div>
                    <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-sage mb-1">
                      Ce qui évolue en toi
                    </p>
                    <p className="font-body text-sm text-sage leading-relaxed">
                      {mirrorData.progress_signal}
                    </p>
                  </div>
                </div>
              )}

              {/* Hypothèse — "Ce que ça pourrait dire" (masqué étapes 1, 2, 4 et 5) */}
              {mirrorData.hypothesis && !["traverser", "reconnaitre", "conscientiser", "emerger"].includes(step?.id || "") && (
                <div className="pl-6">
                  <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-sage/70 mb-2">
                    Ce que ça pourrait dire
                  </p>
                  <p className="font-body text-base text-espresso/80 leading-relaxed italic">
                    {mirrorData.hypothesis}
                  </p>
                </div>
              )}

              {/* Éclairage — pas de label */}
              {mirrorData.insight && (
                <p className="font-body text-base text-espresso leading-relaxed pl-6">
                  {mirrorData.insight}
                </p>
              )}

              {/* Question ouverte — choix corporel rapide pour étape 1, "À explorer" pour les autres */}
              {step?.id === "traverser" ? (
                <div className="pl-6">
                  <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-terra/70 mb-2">
                    Maintenant
                  </p>
                  <p className="font-body text-base text-espresso leading-relaxed mb-3">
                    Où tu le sens le plus ?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["poitrine", "ventre", "gorge", "tête", "épaules", "partout", "je ne sais pas"].map((zone) => (
                      <button
                        key={zone}
                        onClick={() => {
                          setBodyZone(zone);
                          setMirrorNote(zone);
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm font-body border transition-all ${
                          bodyZone === zone
                            ? "bg-terra/20 border-terra text-espresso"
                            : "border-beige-dark text-warm-gray hover:border-terra/40"
                        }`}
                      >
                        {zone.charAt(0).toUpperCase() + zone.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : ["reconnaitre", "conscientiser", "emerger"].includes(step?.id || "") ? null : mirrorData.question ? (
                <div className="pl-6">
                  <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-terra/70 mb-2">
                    À explorer
                  </p>
                  <p className="font-serif text-lg text-terra leading-relaxed">
                    {mirrorData.question}
                  </p>
                </div>
              ) : null}

              {/* Champ de dépôt — visible sauf étapes Traverser, Reconnaître et Aligner */}
              {step?.id !== "aligner" && step?.id !== "traverser" && step?.id !== "reconnaitre" && (
                <div className="pl-6 pt-1">
                  <textarea
                    value={mirrorNote}
                    onChange={(e) => setMirrorNote(e.target.value)}
                    placeholder="Note-le en quelques mots…"
                    className="w-full px-4 py-3 bg-beige/30 rounded-xl text-espresso font-body text-sm leading-relaxed border border-beige-dark/50 focus:border-terra/40 focus:outline-none focus:ring-1 focus:ring-terra/10 transition-all placeholder:text-warm-gray/40 resize-none"
                    rows={2}
                  />
                </div>
              )}

              {/* Micro-action — "À essayer maintenant" (masqué étape 2) */}
              {step?.id === "traverser" ? (
                <div className="card-base !p-4 ml-6">
                  <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-1">
                    À essayer maintenant
                  </p>
                  <p className="font-body text-sm text-espresso leading-relaxed">
                    Reste juste avec cette sensation un instant.
                  </p>
                </div>
              ) : step?.id === "reconnaitre" ? null : step?.id === "conscientiser" ? (
                <div className="card-base !p-4 ml-6">
                  <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-1">
                    À essayer maintenant
                  </p>
                  <p className="font-body text-sm text-espresso leading-relaxed">
                    Laisse juste venir ça comme c&apos;est.
                  </p>
                </div>
              ) : step?.id === "emerger" ? (
                <div className="card-base !p-4 ml-6">
                  <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-1">
                    À essayer maintenant
                  </p>
                  <p className="font-body text-sm text-espresso leading-relaxed">
                    {emergerChoice === "je ne sais pas"
                      ? "Un tout petit geste suffit."
                      : "Tu peux commencer doucement."}
                  </p>
                </div>
              ) : mirrorData.micro_action ? (
                <div className="card-base !p-4 ml-6">
                  <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-1">
                    À essayer maintenant
                  </p>
                  <p className="font-body text-sm text-espresso leading-relaxed">
                    {mirrorData.micro_action}
                  </p>
                </div>
              ) : null}

              {/* Pattern observation — "Ce que TRACÉA remarque" (Phase 2) */}
              {mirrorData.pattern_observation && (
                <PatternObservation observation={mirrorData.pattern_observation} />
              )}

              {/* Next step suggestion — "Pour la prochaine fois" (Phase 3 — uniquement étape Aligner) */}
              {mirrorData.next_step_suggestion && step?.id === "aligner" && (
                <div className="border-l-[3px] border-sage/40 pl-5 py-3 ml-6 bg-sage/5 rounded-r-xl">
                  <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-sage mb-1">
                    Pour la prochaine fois
                  </p>
                  <p className="font-body text-sm text-espresso/80 leading-relaxed italic">
                    {mirrorData.next_step_suggestion}
                  </p>
                </div>
              )}

              {/* Message de sécurité */}
              {mirrorData.safety_message && (
                <div className="card-base !border-l-4 !border-l-terra !p-4 ml-6 bg-terra-light/10">
                  <p className="font-body text-sm text-espresso leading-relaxed">
                    {mirrorData.safety_message}
                  </p>
                </div>
              )}

              {/* Ressources d'urgence si risk_level = high */}
              {mirrorData.showSafetyResources && <SafetyResources />}
            </div>
          ) : null}

          <div className="flex items-center gap-3 mt-4">
            {/* Retour : revenir modifier le texte de l'étape */}
            <button
              onClick={handleBackToEdit}
              className="flex items-center justify-center gap-1.5 px-5 py-3.5 md:py-3 rounded-2xl border-2 border-beige-dark text-warm-gray font-medium text-sm hover:border-warm-gray hover:bg-beige transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              <span className="hidden sm:inline">Modifier</span>
            </button>
            <button
              onClick={handleContinueAfterMirror}
              disabled={mirrorLoading}
              className="btn-primary flex-1 text-center !py-4 md:!py-3 !text-base md:!text-sm !rounded-2xl disabled:opacity-40"
            >
              {currentStep < stepsActifs.length - 1 ? "Continuer" : "Étape suivante"}
            </button>
          </div>

          {mirrorLoading && (
            <button
              onClick={handleContinueAfterMirror}
              className="btn-ghost w-full text-center mt-2 !py-3.5 !rounded-2xl text-sm"
            >
              Passer le reflet
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- INTEGRATION (Section 5) ---
  if (phase === "integration") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 animate-fade-in">
        <div className="text-center min-h-[40vh] flex flex-col items-center justify-center">
          {integrationMessage ? (
            <p className="font-body text-lg text-espresso/80 italic animate-fade-in">
              {integrationMessage}
            </p>
          ) : (
            <>
              <p className="font-serif text-2xl text-espresso mb-3">
                Prends 10 secondes.
              </p>
              <p className="font-body text-sm text-warm-gray italic mb-6">
                Reste là, sans rien faire. Juste sentir.
              </p>
              <p className="font-body text-lg text-espresso/80 mb-10">
                Est-ce que quelque chose a légèrement changé ?
              </p>
              <div className="flex flex-wrap gap-3 justify-center w-full max-w-sm">
                <button
                  onClick={() => handleIntegrationChoice("yes")}
                  className="flex-1 min-w-[80px] px-6 py-3.5 rounded-2xl border-2 border-sage/30 text-espresso font-medium text-base hover:border-sage hover:bg-sage/10 transition-all"
                >
                  Oui
                </button>
                <button
                  onClick={() => handleIntegrationChoice("no")}
                  className="flex-1 min-w-[80px] px-6 py-3.5 rounded-2xl border-2 border-beige-dark text-warm-gray font-medium text-base hover:border-warm-gray hover:bg-beige transition-all"
                >
                  Non
                </button>
                <button
                  onClick={() => handleIntegrationChoice("unsure")}
                  className="w-full px-6 py-3.5 rounded-2xl border-2 border-beige-dark text-warm-gray font-medium text-base hover:border-warm-gray hover:bg-beige transition-all"
                >
                  Je ne sais pas
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // --- INTENSITY AFTER ---
  if (phase === "intensity-after") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <p className="section-label">Fin de traversée</p>
        <h1 className="section-title !text-2xl md:!text-4xl">Où en es-tu maintenant ?</h1>
        <p className="text-warm-gray text-sm md:text-base text-center mb-6 leading-relaxed">
          Place le curseur là où tu te sens, maintenant.
        </p>
        <div className="card-base mb-6">
          <IntensitySlider
            value={intensityAfter}
            onChange={(v: number) => { setIntensityAfter(v); setIntensityAfterTouched(true); }}
            label="Intensité après la traversée"
          />
        </div>
        {intensityAfterTouched && (
          <>
            {intensity > intensityAfter ? (
              <div className="text-center mb-4 animate-fade-in">
                <p className="font-body text-sm text-sage italic">
                  Ton intensité a baissé.
                </p>
              </div>
            ) : intensity === intensityAfter ? (
              <div className="text-center mb-4 animate-fade-in">
                <p className="font-body text-sm text-warm-gray italic">
                  Ton intensité est restée stable.
                </p>
              </div>
            ) : (
              <div className="text-center mb-4 animate-fade-in">
                <p className="font-body text-sm text-warm-gray italic">
                  Ton intensité a monté.
                </p>
              </div>
            )}
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 animate-fade-in">
              <div className="card-terra flex-1 text-center !p-3 md:!p-5">
                <div className="text-[10px] md:text-xs text-terra-dark tracking-widest uppercase mb-1">Avant</div>
                <div className="font-serif text-xl md:text-2xl text-espresso">{intensity}/10</div>
              </div>
              <div className="font-serif text-lg md:text-xl text-warm-gray">→</div>
              <div className="card-sage flex-1 text-center !p-3 md:!p-5">
                <div className="text-[10px] md:text-xs text-[#4A6B3A] tracking-widest uppercase mb-1">Après</div>
                <div className="font-serif text-xl md:text-2xl text-espresso">{intensityAfter}/10</div>
              </div>
            </div>
          </>
        )}
        <button
          onClick={handleIntensityAfterDone}
          disabled={!intensityAfterTouched}
          className="btn-primary w-full text-center !py-4 md:!py-3 !text-base md:!text-sm !rounded-2xl"
          style={{ opacity: intensityAfterTouched ? 1 : 0.4 }}
        >
          Voir mon parcours
        </button>
      </div>
    );
  }

  // --- ANALYSIS / COMPLETE ---
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
      <h1 className="section-title !text-2xl md:!text-4xl">Ta traversée</h1>
      {analysisLoading ? (
        <div className="card-base text-center py-12 md:py-16">
          <div className="font-serif text-2xl md:text-3xl text-terra mb-4 animate-pulse-gentle">TRACEA</div>
          <p className="text-warm-gray text-sm md:text-base">Un instant de recul...</p>
        </div>
      ) : (
        <>
          {/* Intensity summary — empilé sur mobile, horizontal sur desktop */}
          <div className="grid grid-cols-3 gap-2 md:flex md:items-center md:gap-4 mb-6">
            <div className="card-terra text-center !p-3 md:!p-5 md:flex-1">
              <div className="text-[10px] md:text-xs text-terra-dark tracking-widest uppercase mb-1">Avant</div>
              <div className="font-serif text-lg md:text-2xl text-espresso">{intensity}/10</div>
            </div>
            <div className="card-sage text-center !p-3 md:!p-5 md:flex-1">
              <div className="text-[10px] md:text-xs text-[#4A6B3A] tracking-widest uppercase mb-1">Après</div>
              <div className="font-serif text-lg md:text-2xl text-espresso">{intensityAfter}/10</div>
            </div>
            <div className="text-center flex flex-col items-center justify-center md:flex-1">
              {intensity - intensityAfter > 0 ? (
                <>
                  <div className="text-[10px] md:text-xs text-sage tracking-widest uppercase mb-1">Régulation</div>
                  <div className="font-serif text-lg md:text-2xl text-sage">
                    -{intensity - intensityAfter} <span className="text-xs md:text-base">pts</span>
                  </div>
                </>
              ) : intensity - intensityAfter === 0 ? (
                <>
                  <div className="text-[10px] md:text-xs text-warm-gray tracking-widest uppercase mb-1">Évolution</div>
                  <div className="font-serif text-sm md:text-2xl text-warm-gray">
                    Stable
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[10px] md:text-xs text-terra tracking-widest uppercase mb-1">Évolution</div>
                  <div className="font-serif text-sm md:text-2xl text-terra">
                    En cours
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Résumé post-session — choix utilisateur + observation IA */}
          {(steps.reconnaitre || lastStepSnapshot) && (
            <div className="card-base mb-6">
              <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">
                Ce qui a été traversé
              </p>
              <div className="space-y-2">
                {steps.reconnaitre && (
                  <p className="font-body text-sm text-espresso">
                    Émotion identifiée : {steps.reconnaitre}.
                  </p>
                )}
                {steps.conscientiser && (
                  <p className="font-body text-sm text-espresso">
                    Besoin : {steps.conscientiser}.
                  </p>
                )}
              </div>
            </div>
          )}

          {veriteInterieure && (
            <div className="border-l-[3px] border-terra pl-6 py-3 mb-6">
              <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-2">
                Le geste que tu as choisi
              </p>
              <p className="font-body text-xl italic text-espresso">
                {veriteInterieure.toLowerCase().includes("je ne sais pas") || veriteInterieure.toLowerCase().includes("sais pas") || veriteInterieure.trim().length < 10
                  ? "Pas de geste formulé pour le moment."
                  : <>&ldquo;{veriteInterieure}&rdquo;</>}
              </p>
            </div>
          )}

          {/* Action posée + suggestion IA (Phase 3) */}
          {(steps.aligner || lastNextStepSuggestion) && (
            <div className="card-base mb-6 space-y-4">
              {steps.aligner && (
                <div>
                  <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-2">
                    Ce que tu as posé
                  </p>
                  <p className="font-body text-sm text-espresso leading-relaxed">
                    {steps.aligner}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Écran de fin */}
          <div className="text-center py-6 md:py-8 animate-fade-in">
            <h2 className="font-serif text-xl md:text-2xl text-espresso mb-4">
              Ta traversée est terminée.
            </h2>
            <button
              onClick={() => router.push("/app")}
              className="btn-primary w-full md:w-auto mb-3 !py-4 md:!py-3 !text-base md:!text-sm !rounded-2xl"
            >
              Retour à l&apos;accueil
            </button>
            <div className="mt-3">
              <Link
                href="/app/profil"
                className="text-sm text-warm-gray hover:text-terra transition-colors underline underline-offset-2"
              >
                Voir mon profil
              </Link>
            </div>
          </div>

          <div className="mt-10" />
        </>
      )}
    </div>
  );
}

// ===================================================================
// ÉCRAN D'ACCUEIL DE SESSION (Section 2)
// ===================================================================

function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  const [visible, setVisible] = useState([false, false, false, false]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisible((v) => { const n = [...v]; n[0] = true; return n; }), 100),
      setTimeout(() => setVisible((v) => { const n = [...v]; n[1] = true; return n; }), 400),
      setTimeout(() => setVisible((v) => { const n = [...v]; n[2] = true; return n; }), 700),
      setTimeout(() => setVisible((v) => { const n = [...v]; n[3] = true; return n; }), 1000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center min-h-[50vh] flex flex-col items-center justify-center space-y-6">
        <h1
          className="font-serif text-3xl text-espresso transition-opacity duration-500"
          style={{ opacity: visible[0] ? 1 : 0 }}
        >
          Bienvenue dans ta traversée
        </h1>

        <div
          className="space-y-3 max-w-md transition-opacity duration-500"
          style={{ opacity: visible[1] ? 1 : 0 }}
        >
          <p className="font-body text-base text-espresso/80 leading-relaxed">
            Ici, tu n&apos;as rien à réussir.
          </p>
          <p className="font-body text-base text-espresso/80 leading-relaxed">
            Juste à observer ce qui se passe en toi.
          </p>
        </div>

        <div
          className="space-y-3 max-w-md transition-opacity duration-500"
          style={{ opacity: visible[2] ? 1 : 0 }}
        >
          <p className="font-body text-base text-espresso/80 leading-relaxed">
            TRACÉA ne te donne pas des réponses.
          </p>
          <p className="font-body text-base text-espresso/80 leading-relaxed">
            TRACÉA t&apos;aide à te comprendre.
          </p>
        </div>

        <p
          className="font-serif text-lg text-terra italic transition-opacity duration-500"
          style={{ opacity: visible[2] ? 1 : 0 }}
        >
          Ce n&apos;est pas une thérapie. C&apos;est un entraînement.
        </p>

        <div
          className="pt-4 transition-opacity duration-500"
          style={{ opacity: visible[3] ? 1 : 0 }}
        >
          <button onClick={onContinue} className="btn-primary">
            Commencer
          </button>
        </div>
      </div>
    </div>
  );
}
