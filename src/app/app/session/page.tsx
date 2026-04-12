"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { STEPS } from "@/lib/steps";
import { useAuth } from "@/lib/auth-context";
import {
  createSessionDb,
  updateSessionDb,
  trackEvent,
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
import { GroundingGuide } from "@/components/GroundingGuide";
import { GazeGuide } from "@/components/GazeGuide";
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

type Phase = "intro" | "intro-context" | "welcome" | "entry-question" | "session" | "mirror" | "integration" | "analysis" | "complete" | "soft-switch";


export default function SessionPage() {
  return (
    <Suspense>
      <SessionPageInner />
    </Suspense>
  );
}

function SessionPageInner() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const routerActivation = searchParams.get("activation"); // "encore" | "calme" | null

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
      <SessionContent userId={user.id} routerActivation={routerActivation} />
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

function SessionContent({ userId, routerActivation }: { userId: string; routerActivation: string | null }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [intensity, setIntensity] = useState(5);
  const [intensityAfter, setIntensityAfter] = useState(3);
  const [intensityAfterTouched, setIntensityAfterTouched] = useState(false);
  const [context, setContext] = useState<SessionData["context"] | "">("");
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
  const [showSensations, setShowSensations] = useState(false);
  const [integrationResponse, setIntegrationResponse] = useState<"yes" | "no" | "unsure" | null>(null);
  const [integrationMessage, setIntegrationMessage] = useState("");
  const [mirrorNote, setMirrorNote] = useState("");
  const [mirrorNotes, setMirrorNotes] = useState<Record<string, string>>({});

  // ── Étape 1 — Traverser : sous-phases (ressenti → corps → texte) ──
  const [traverserPhase, setTraverserPhase] = useState<"ressenti" | "corps" | "texte">("ressenti");
  const [ressentiChoice, setRessentiChoice] = useState("");
  const [traverserFreeText, setTraverserFreeText] = useState("");
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
  const [ancrerFeedback, setAncrerFeedback] = useState<"calme" | "pareil" | "agite" | "incertain" | "">("");
  const [showAncrerHelp, setShowAncrerHelp] = useState(false);
  const [ancrerMethod, setAncrerMethod] = useState<"" | "respirer" | "corps" | "regarder">("");
  const [ancrerAlt, setAncrerAlt] = useState(false);
  const [ancrerPostPhase, setAncrerPostPhase] = useState(false);

  // ── Étape 4 — Écouter : besoin immédiat ──
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
  const [alignerPhase, setAlignerPhase] = useState<"choix" | "reduction" | "repere" | "fait" | "feedback">("choix");
  const [alignerReduction, setAlignerReduction] = useState("");
  const [alignerReductionOther, setAlignerReductionOther] = useState("");
  const [alignerFeedback, setAlignerFeedback] = useState<"maintenant" | "plus-petit" | "plus-tard" | "">("");

  // ── Cache des réponses par étape (navigation sans perte) ──
  const [stepCache, setStepCache] = useState<Record<string, StepCacheEntry>>({});

  // ── Soft switch (routing automatique depuis traversée courte) ──
  const [routedFromActivation, setRoutedFromActivation] = useState(false);
  const [softSwitchTriggered, setSoftSwitchTriggered] = useState(false);
  const [dontKnowCount, setDontKnowCount] = useState(0);
  const [emptyAdvanceCount, setEmptyAdvanceCount] = useState(0);
  const [screenEnteredAt, setScreenEnteredAt] = useState(Date.now());
  const [firstInputDone, setFirstInputDone] = useState(false);

  // ── Micro-réception (accusé de réception visuel bref) ──
  const [ack, setAck] = useState<string | null>(null);

  function triggerAck(text: string, next: () => void) {
    setAck(text);
    setTimeout(() => next(), 280);
    setTimeout(() => setAck(null), 400);
  }

  // Auto-route if activation param present (skip intro + intro-context)
  useEffect(() => {
    if (routerActivation && !routedFromActivation) {
      setRoutedFromActivation(true);
      const intensityMap: Record<string, number> = { encore: 4, calme: 2 };
      setIntensity(intensityMap[routerActivation] || 4);
      setModeTraversee("complet");
      // Create session directly, then go to first step
      createSessionDb(userId, intensityMap[routerActivation] || 4, context || "autre").then(s => {
        if (s) {
          setSessionId(s.id);
          setPhase("session");
          trackEvent(userId, "session_start", {
            mode: "complet",
            intensity: intensityMap[routerActivation] || 4,
            context: context || null,
          });
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routerActivation, userId]);

  // Track screen entry time for soft switch
  useEffect(() => {
    if (phase === "session") {
      setScreenEnteredAt(Date.now());
      setFirstInputDone(false);
    }
  }, [phase, currentStep]);

  // Check soft switch conditions
  const softSwitchEligible = routedFromActivation && currentStep < 3 && !softSwitchTriggered && (phase === "session" || phase === "entry-question");

  function checkSoftSwitch(): boolean {
    if (!softSwitchEligible) return false;

    const elapsed = Date.now() - screenEnteredAt;
    const timeOverload = !firstInputDone && elapsed > 5000;

    if (timeOverload || dontKnowCount >= 2 || emptyAdvanceCount >= 1) {
      setSoftSwitchTriggered(true);
      setPhase("soft-switch");
      return true;
    }
    return false;
  }

  // Track "je ne sais pas" selections for soft switch
  function trackDontKnow() {
    if (!softSwitchEligible) return;
    const newCount = dontKnowCount + 1;
    setDontKnowCount(newCount);
    if (newCount >= 2) {
      setSoftSwitchTriggered(true);
      setPhase("soft-switch");
    }
  }

  // Track empty advance attempts for soft switch
  function trackEmptyAdvance() {
    if (!softSwitchEligible) return;
    setEmptyAdvanceCount(prev => prev + 1);
    setSoftSwitchTriggered(true);
    setPhase("soft-switch");
  }

  // Mark first input done
  function markFirstInput() {
    if (!firstInputDone) setFirstInputDone(true);
  }

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
    const s = await createSessionDb(userId, intensity, context || "autre");
    if (s) {
      setSessionId(s.id);
      setPhase("session");
      trackEvent(userId, "session_start", {
        mode: modeTraversee,
        intensity,
        context: context || null,
      });
    }
  }

  async function handleNextStep() {
    if (!sessionId) return;

    // Soft switch: check time overload before advancing
    if (checkSoftSwitch()) return;

    const stepId = step.id as StepId;

    // Étape 1 — assembler ressenti + zone + texte facultatif
    let stepText = text;
    if (stepId === "traverser") {
      const parts: string[] = [];
      if (ressentiChoice) parts.push(ressentiChoice);
      if (bodyZone) {
        const zone = bodyZone === "autre" && bodyZoneOther.trim() ? bodyZoneOther.trim() : bodyZone;
        parts.push(`[corps: ${zone}]`);
      }
      if (text.trim()) {
        parts.push(text.trim());
        setTraverserFreeText(text.trim());
      }
      stepText = parts.join(" ");
    }

    // Étape 2 — construire le texte depuis le choix émotion
    if (stepId === "reconnaitre" && emotionChoice) {
      const label = emotionChoice === "autre" && emotionOther.trim() ? `autre: ${emotionOther.trim()}` : emotionChoice;
      stepText = emotionConfirm === "proche" ? `${label} (proche)` : label;
    }

    // Étape 3 — construire le texte depuis le feedback
    if (stepId === "ancrer" && ancrerFeedback) {
      const feedbackLabels: Record<string, string> = { calme: "un peu plus calme", pareil: "pareil", agite: "plus agité", incertain: "pas sûr" };
      stepText = feedbackLabels[ancrerFeedback] || "pas sûr";
    }

    // Étape 4 — construire le texte depuis le choix besoin
    if (stepId === "conscientiser" && ecouterChoice) {
      const label = ecouterChoice === "je ne sais pas" && ecouterOther ? ecouterOther : ecouterChoice;
      stepText = ecouterConfirm === "appelle" ? `${label} (appelle)` : label;
    }

    // Étape 5 — construire le texte depuis le choix micro-action
    if (stepId === "emerger" && emergerChoice) {
      stepText = emergerChoice === "autre" && emergerOther.trim() ? `autre: ${emergerOther.trim()}` : emergerChoice;
    }

    // Étape 6 — combiner geste (étape 5) + engagement (étape 6)
    if (stepId === "aligner") {
      const geste = emergerChoice === "autre" && emergerOther.trim() ? emergerOther.trim() : emergerChoice;
      const engagementLabels: Record<string, string> = {
        "maintenant": "maintenant",
        "plus-petit": "en plus petit",
        "plus-tard": "plus tard",
      };
      const engagement = alignerFeedback ? engagementLabels[alignerFeedback] || "" : "";
      stepText = engagement ? `${geste} (${engagement})` : geste;
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

    trackEvent(userId, "step_complete", { step: stepId, mode: modeTraversee, value: stepText });

    // ── Toutes les étapes : micro-réception puis transition ──
    const ackMap: Record<string, string> = {
      traverser: "Ok",
      ancrer: "Ok",
      conscientiser: "Ça marche",
      emerger: (emergerChoice === "autre" && emergerOther.trim()) ? emergerOther.trim() : emergerChoice || "Ok",
      aligner: "C'est noté",
    };
    triggerAck(ackMap[stepId] || "Ok", () => handleContinueAfterMirror());
    return;

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
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
      // Dernière étape → synthèse finale directe
      if (sessionId) {
        updateSessionDb(sessionId, { intensity_after: intensityAfter });
      }
      setPhase("analysis");
      generateAnalysis();
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
    // Passage direct à l'analyse sans écran de métriques
    if (sessionId) {
      updateSessionDb(sessionId, { intensity_after: intensityAfter });
    }
    setPhase("analysis");
    generateAnalysis();
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
    trackEvent(userId, "session_end", { mode: modeTraversee });

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
    return "Tu as pris un moment pour revenir au corps.\nQuelque chose s'est un peu posé.\nEt tu repars avec un geste.";
  }

  // --- ACK (micro-réception non-bloquante) ---
  const ackOverlay = (
    <div
      className="fixed top-[38%] left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{ opacity: ack ? 1 : 0, transition: "opacity 120ms ease" }}
    >
      <span className="font-inter text-base text-t-beige/70 bg-[rgba(35,25,22,0.85)] px-5 py-2 rounded-xl backdrop-blur-sm">
        {ack}
      </span>
    </div>
  );

  // --- INTRO ---
  if (phase === "intro") {
    const activationOptions = [
      { label: "Très chargé", value: 8 },
      { label: "Assez chargé", value: 6 },
      { label: "Un peu chargé", value: 4 },
      { label: "Plutôt calme", value: 2 },
    ];
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <h1 className="section-title !text-2xl md:!text-4xl">Avant de commencer</h1>
        <p className="text-warm-gray mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
          Là, c&apos;est plutôt :
        </p>

        <div className="space-y-3 mb-8">
          {activationOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setIntensity(opt.value); setPhase("intro-context"); }}
              className="w-full py-4 md:py-3.5 px-6 rounded-2xl bg-beige text-espresso font-medium text-base md:text-sm hover:bg-beige-dark transition-all text-center"
            >
              {opt.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-warm-gray text-center">
          On va rester simple et concret.
        </p>
      </div>
    );
  }

  // --- INTRO-CONTEXT (contexte + parcours) ---
  if (phase === "intro-context") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <h1 className="section-title !text-2xl md:!text-4xl">Traversée complète</h1>

        <p className="font-body text-base text-espresso/80 leading-relaxed mb-3">
          6 étapes pour clarifier ce qui se passe, revenir au corps, et repartir avec un geste juste.
        </p>
        <p className="font-body text-sm text-warm-gray mb-8">
          Environ 5 à 8 minutes
        </p>

        <div className="card-base mb-6 md:mb-8">
          <label className="text-xs font-medium tracking-widest uppercase text-warm-gray block mb-3">
            C&apos;est lié à quoi ?
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

        <button
          onClick={() => { setModeTraversee("complet"); handleStartSession(); }}
          className="btn-primary w-full text-center !py-4 md:!py-3 !text-base md:!text-sm !rounded-2xl"
        >
          Commencer
        </button>
      </div>
    );
  }

  // --- SOFT SWITCH (proposition traversée courte — choix utilisateur) ---
  if (phase === "soft-switch") {
    const softSwitchReason = dontKnowCount >= 2
      ? "dont_know_repeated"
      : emptyAdvanceCount >= 1
        ? "empty_advance"
        : "time_overload";
    const sourceStep = step?.id || "entry-question";

    return (
      <ScreenContainer overlayOpacity={45}>
        <div className="py-12">
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            <div className="text-center space-y-4">
              <h1 className="font-serif text-2xl text-t-beige">
                Continuer
              </h1>
              <p className="font-body text-lg text-t-creme/60 leading-relaxed">
                On peut te proposer une version plus simple de la traversée.
                <br />
                Tu veux continuer ici ou passer à une version plus simple ?
              </p>
            </div>
            <div className="w-full max-w-md space-y-3">
              <PrimaryButton onClick={() => {
                console.info("[TRACEA flow_router]", JSON.stringify({
                  source: "flow_router",
                  current_flow: "long",
                  proposed_flow: "short",
                  router_reason: softSwitchReason,
                  source_step: sourceStep,
                  user_choice: "stay",
                  next_flow: "long",
                  next_screen: sourceStep,
                }));
                setPhase("session");
              }}>
                Continuer ici
              </PrimaryButton>
              <button
                onClick={() => {
                  console.info("[TRACEA flow_router]", JSON.stringify({
                    source: "flow_router",
                    current_flow: "long",
                    proposed_flow: "short",
                    router_reason: softSwitchReason,
                    source_step: sourceStep,
                    user_choice: "switch",
                    next_flow: "short",
                    next_screen: "ressenti",
                  }));
                  router.push("/app/traversee-courte?skip=entree");
                }}
                className="w-full py-4 md:py-3.5 px-6 rounded-2xl border-2 border-terra/30 text-terra font-medium text-base md:text-sm hover:border-terra hover:bg-terra-light/20 transition-all text-center"
              >
                Passer à une version plus simple
              </button>
            </div>
          </div>
        </div>
      </ScreenContainer>
    );
  }

  // --- WELCOME (Section 2) ---
  if (phase === "welcome") {
    return <WelcomeScreen onContinue={() => { setCurrentStep(0); setPhase("session"); }} />;
  }

  // (Écran de transition supprimé — passage direct entre étapes)

  // --- SESSION ---
  if (phase === "session") {
    const hasCachedAI = !!(stepCache[step.id]?.aiResponse && stepCache[step.id]?.validatedText === text.trim());

    // ╔═══════════════════════════════════════════════════════════╗
    // ║  ÉTAPE 1 — TRAVERSER (3 sous-phases : ressenti → corps → texte) ║
    // ╚═══════════════════════════════════════════════════════════╝
    if (step.id === "traverser") {
      return (
        <ScreenContainer className="py-8 md:py-12">
          {ackOverlay}
          <StepIndicator
            currentStep={currentStepIndicateur}
            completedSteps={completedSteps}
            activeSteps={modeTraversee === "court" ? [0, 2, 4] : undefined}
            immersive
          />

          <div className="mt-5 md:mt-6 animate-fade-up" key={`${currentStep}-${traverserPhase}`}>
            <StepCard>
              <StepHeader
                stepNumber={step.number}
                stepName={step.name}
                totalSteps={stepsActifs.length}
                currentIndex={currentStep}
                hasCachedAI={hasCachedAI}
              />

              {/* ── Sous-phase 1 : Ressenti ── */}
              {traverserPhase === "ressenti" && (
                <div className="animate-fade-up">
                  <p className="font-inter text-lg md:text-xl text-t-beige leading-relaxed mb-1">
                    Là, c&apos;est surtout :
                  </p>
                  <p className="font-inter text-sm text-t-creme/50 italic mb-6">
                    Tu peux choisir le plus proche.
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {["serré", "agité", "lourd", "flou", "je ne sais pas"].map((r) => (
                      <ChoiceChip
                        key={r}
                        label={r.charAt(0).toUpperCase() + r.slice(1)}
                        selected={ressentiChoice === r}
                        onClick={() => {
                          setRessentiChoice(r);
                          markFirstInput();
                          if (r === "je ne sais pas") trackDontKnow();
                          triggerAck("Ok", () => setTraverserPhase("corps"));
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Sous-phase 2 : Zone corporelle ── */}
              {traverserPhase === "corps" && (
                <div className="animate-fade-up">
                  <p className="font-inter text-lg md:text-xl text-t-beige leading-relaxed mb-1">
                    Dans le corps
                  </p>
                  <p className="font-inter text-sm text-t-creme/50 italic mb-6">
                    Où c&apos;est le plus marqué ?
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {["poitrine", "ventre", "gorge", "tête", "épaules", "partout", "je ne sais pas"].map((zone) => (
                      <ChoiceChip
                        key={zone}
                        label={zone.charAt(0).toUpperCase() + zone.slice(1)}
                        selected={bodyZone === zone}
                        onClick={() => {
                          setBodyZone(zone);
                          setBodyZoneOther("");
                          markFirstInput();
                          if (zone === "je ne sais pas") trackDontKnow();
                          triggerAck("Noté", () => setTraverserPhase("texte"));
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-10">
                    <button
                      onClick={() => setTraverserPhase("ressenti")}
                      className="t-btn-secondary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                      <span className="hidden sm:inline">Retour</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── Sous-phase 3 : Texte libre facultatif ── */}
              {traverserPhase === "texte" && (
                <div className="animate-fade-up">
                  <p className="font-inter text-lg md:text-xl text-t-beige leading-relaxed mb-1">
                    Tu veux ajouter quelque chose ?
                  </p>
                  <p className="font-inter text-sm text-t-creme/50 italic mb-6">
                    Facultatif. Quelques mots suffisent.
                  </p>
                  <TextCapsuleField
                    value={text}
                    onChange={setText}
                    placeholder="ex : tension, agitation, fatigue…"
                    multiline
                    rows={2}
                    className="h-20 md:h-24"
                  />
                  <div className="flex items-center gap-3 mt-10">
                    <button
                      onClick={() => setTraverserPhase("corps")}
                      className="t-btn-secondary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                      <span className="hidden sm:inline">Retour</span>
                    </button>
                    <PrimaryButton
                      onClick={handleNextStep}
                      className="flex-1"
                    >
                      Continuer
                    </PrimaryButton>
                  </div>
                </div>
              )}

              {/* Aide secondaire */}
              <SoftHelpText trigger="Je bloque">
                Choisis juste ce qui est le plus proche de ce que tu sens.
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
      const mainEmotions = ["tension", "peur", "tristesse", "colère", "fatigue", "confusion"];
      const moreEmotions = ["trop-plein", "vide"];

      const handleEmoSelect = (emo: string) => {
        setEmotionChoice(emo);
        markFirstInput();
        if (emo === "je ne sais pas") trackDontKnow();
      }

      const handleEmoConfirm = () => {
        const stepText = emotionChoice;
        const updatedSteps = { ...steps, reconnaitre: stepText };
        setSteps(updatedSteps);
        if (sessionId) {
          updateSessionDb(sessionId, { steps: updatedSteps, emotion_primaire: stepText.slice(0, 100) } as Parameters<typeof updateSessionDb>[1]);
        }
        triggerAck("D'accord", () => handleContinueAfterMirror());
      }

      return (
        <ScreenContainer className="py-8 md:py-12" overlayOpacity={22}>
          {ackOverlay}
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

              {/* Question */}
              <p className="font-inter text-sm text-t-creme/50 italic mb-6">
                Si tu devais approcher ça avec un mot simple…
              </p>

              {/* Chips émotion — 6 par défaut, reste derrière "Voir plus" */}
              <div className="flex flex-wrap gap-2.5">
                {[...mainEmotions, ...(showMoreEmotions ? moreEmotions : []), "je ne sais pas"].map((emo) => (
                  <ChoiceChip
                    key={emo}
                    label={emo.charAt(0).toUpperCase() + emo.slice(1)}
                    selected={emotionChoice === emo}
                    onClick={() => handleEmoSelect(emo)}
                    className="border-t-creme/25 text-t-creme/90"
                  />
                ))}
                {!showMoreEmotions && (
                  <button
                    onClick={() => setShowMoreEmotions(true)}
                    className="px-3 py-1.5 rounded-full text-sm font-inter border border-t-creme/15 text-t-creme/40 hover:text-t-creme/60 transition-colors"
                  >
                    Voir plus
                  </button>
                )}
              </div>

              {/* Boutons retour + continuer */}
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
                  onClick={handleEmoConfirm}
                  disabled={!emotionChoice}
                  className="flex-1"
                >
                  Continuer
                </PrimaryButton>
              </div>
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
      const handleFeedbackSelect = (key: "calme" | "pareil" | "agite") => {
        setAncrerFeedback(key);
        if (key === "calme") {
          const stepText = "un peu plus calme";
          const updatedSteps = { ...steps, ancrer: stepText };
          setSteps(updatedSteps);
          if (sessionId) {
            updateSessionDb(sessionId, { steps: updatedSteps } as Parameters<typeof updateSessionDb>[1]);
          }
          triggerAck("Ok", () => handleContinueAfterMirror());
        } else {
          setAncrerPostPhase(true);
        }
      }

      return (
        <ScreenContainer className="py-10 md:py-16" overlayOpacity={18}>
          {ackOverlay}
          <StepIndicator
            currentStep={currentStepIndicateur}
            completedSteps={completedSteps}
            activeSteps={modeTraversee === "court" ? [0, 2, 4] : undefined}
            immersive
          />

          <div className="mt-6 md:mt-8 animate-fade-up" key={currentStep}>
            {/* Micro-texte de transition depuis reconnaitre */}
            <p className="font-body text-sm text-warm-gray/70 italic text-center mb-4">
              On va juste revenir au corps, simplement.
            </p>

            <StepCard className={`transition-all duration-1000 ease-in-out ${!ancrerDone && ancrerMethod ? "!bg-[rgba(50,35,28,0.08)] !border-[rgba(232,216,199,0.03)] !shadow-none !backdrop-blur-[40px]" : ""}`}>
              {/* En-tête */}
              <div className={`transition-opacity duration-1000 ${!ancrerDone && ancrerMethod ? "opacity-[0.3]" : "opacity-100"}`}>
                <StepHeader
                  stepNumber={step.number}
                  stepName={step.name}
                  totalSteps={stepsActifs.length}
                  currentIndex={currentStep}
                  hasCachedAI={hasCachedAI}
                />
              </div>

              {/* Choix de méthode d'ancrage */}
              {!ancrerMethod && !ancrerDone && (
                <div className="animate-fade-up">
                  <p className="font-inter text-sm text-t-creme/45 italic mb-2">
                    On va juste ralentir un peu, de la manière la plus simple pour toi.
                  </p>
                  <p className="font-inter text-sm text-t-creme/60 mb-8">
                    Choisis le plus simple maintenant.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => { setAncrerMethod("corps"); setAncrerAlt(false); }}
                      className="t-btn-secondary w-full justify-center"
                    >
                      Sentir les appuis du corps
                    </button>
                    <button
                      onClick={() => { setAncrerMethod("regarder"); setAncrerAlt(false); }}
                      className="t-btn-secondary w-full justify-center"
                    >
                      Regarder autour de moi
                    </button>
                    <button
                      onClick={() => { setAncrerMethod("respirer"); setAncrerAlt(false); }}
                      className="t-btn-secondary w-full justify-center"
                    >
                      Expirer plus lentement
                    </button>
                  </div>
                  <p className="font-inter text-xs text-t-creme/35 text-center mt-5">
                    Si ça n&apos;aide pas, on changera juste de manière.
                  </p>
                </div>
              )}

              {/* Méthode : respirer */}
              {ancrerMethod === "respirer" && !ancrerDone && (
                <div className="py-12 animate-fade-up">
                  <BreathingGuide onComplete={() => setAncrerDone(true)} />
                </div>
              )}

              {/* Méthode : sentir les appuis du corps */}
              {ancrerMethod === "corps" && !ancrerDone && (
                <div className="py-12 animate-fade-up">
                  <GroundingGuide onComplete={() => setAncrerDone(true)} />
                </div>
              )}

              {/* Méthode : regarder autour */}
              {ancrerMethod === "regarder" && !ancrerDone && (
                <div className="py-12 animate-fade-up">
                  <GazeGuide onComplete={() => setAncrerDone(true)} />
                </div>
              )}

              {/* Phase 2 — Feedback post-ancrage (auto-advance) */}
              {ancrerDone && !ancrerPostPhase && (
                <>
                  <p className="font-inter text-lg text-t-beige leading-relaxed mb-2">
                    Maintenant
                  </p>
                  <p className="font-inter text-sm text-t-creme/50 italic mb-6">
                    Il n&apos;y a pas de bonne réponse. On s&apos;adapte à ce que tu sens.
                  </p>
                  <p className="font-inter text-base text-t-beige/80 leading-relaxed mb-4">
                    Là, c&apos;est comment ?
                  </p>
                  <div className="flex flex-wrap gap-2.5 mt-2">
                    {([["calme", "Un peu plus calme"], ["pareil", "Pareil"], ["agite", "Plus agité"]] as const).map(([key, label]) => (
                      <ChoiceChip
                        key={key}
                        label={label}
                        selected={ancrerFeedback === key}
                        onClick={() => handleFeedbackSelect(key)}
                      />
                    ))}
                    <ChoiceChip
                      label="Je ne sais pas trop"
                      selected={false}
                      onClick={() => { setAncrerFeedback("incertain"); setAncrerPostPhase(true); }}
                    />
                  </div>
                </>
              )}

              {/* Bouton retour uniquement */}
              {ancrerDone && !ancrerPostPhase && (
                <div className="flex items-center gap-3 mt-12">
                  <button
                    onClick={handleGoBack}
                    className="t-btn-secondary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    <span className="hidden sm:inline">Retour</span>
                  </button>
                </div>
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
                      <p className="font-inter text-lg text-t-beige leading-relaxed mb-2">
                        On simplifie
                      </p>
                      <p className="font-inter text-sm text-t-creme/55 leading-relaxed whitespace-pre-line mb-10">
                        Ce n&apos;est pas grave si c&apos;est pareil.{"\n"}On va juste faire encore plus simple.
                      </p>
                      <PrimaryButton onClick={handleNextStep} className="w-full">
                        Continuer
                      </PrimaryButton>
                    </>
                  )}

                  {ancrerFeedback === "incertain" && (
                    <>
                      <p className="font-inter text-base text-t-beige/90 leading-relaxed mb-2">
                        C&apos;est ok de ne pas savoir.
                      </p>
                      <p className="font-inter text-sm text-t-creme/55 leading-relaxed mb-10">
                        On continue doucement.
                      </p>
                      <PrimaryButton onClick={handleNextStep} className="w-full">
                        Continuer
                      </PrimaryButton>
                    </>
                  )}

                  {ancrerFeedback === "agite" && (
                    <>
                      <p className="font-inter text-lg text-t-beige leading-relaxed mb-2">
                        On change
                      </p>
                      <p className="font-inter text-sm text-t-creme/50 italic leading-relaxed mb-8 whitespace-pre-line">
                        {`On ne force pas.\nOn change juste de manière.`}
                      </p>
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => {
                            setAncrerMethod("corps");
                            setAncrerDone(false);
                            setAncrerPostPhase(false);
                            setAncrerFeedback("");
                            setAncrerAlt(false);
                          }}
                          className="t-btn-secondary w-full justify-center"
                        >
                          Sentir les appuis du corps
                        </button>
                        <button
                          onClick={() => {
                            setAncrerMethod("regarder");
                            setAncrerDone(false);
                            setAncrerPostPhase(false);
                            setAncrerFeedback("");
                            setAncrerAlt(false);
                          }}
                          className="t-btn-secondary w-full justify-center"
                        >
                          Regarder autour de moi
                        </button>
                        <button
                          onClick={handleNextStep}
                          className="t-btn-secondary w-full justify-center"
                        >
                          Faire une pause quelques secondes
                        </button>
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
    // ║  ÉTAPE 4 — Écouter (immersif, remontée douce)             ║
    // ╚═══════════════════════════════════════════════════════════╝
    if (step.id === "conscientiser") {
      return (
        <ScreenContainer className="py-8 md:py-12" overlayOpacity={4}>
          {ackOverlay}
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
                stepName="Écouter"
                totalSteps={stepsActifs.length}
                currentIndex={currentStep}
                hasCachedAI={hasCachedAI}
              />

              {/* Pont de profondeur */}
              <p className="font-inter text-sm text-t-creme/40 italic mb-4">
                Et là, sous ce qui s&apos;est un peu posé…
              </p>

              {/* Question principale */}
              <p className="font-inter text-lg md:text-xl text-t-beige leading-relaxed whitespace-pre-wrap mb-3">
                {step.question}
              </p>

              {/* Chips besoin */}
              <div className="mt-6">
                <div className="flex flex-wrap gap-2.5">
                  {[...["ralentir", "souffler", "relâcher", "faire une pause"], ...(showMoreNeeds ? ["être rassuré", "avoir de l'espace", "être soutenu"] : []), "je ne sais pas"].map((need) => (
                    <ChoiceChip
                      key={need}
                      label={need.charAt(0).toUpperCase() + need.slice(1)}
                      selected={ecouterChoice === need}
                      onClick={() => { setEcouterChoice(need); setEcouterConfirm(""); setEcouterOther(""); }}
                      className="border-t-creme/30 text-t-creme"
                    />
                  ))}
                  {!showMoreNeeds && (
                    <button
                      onClick={() => setShowMoreNeeds(true)}
                      className="px-3 py-1.5 rounded-full text-sm font-inter border border-t-creme/15 text-t-creme/40 hover:text-t-creme/60 transition-colors"
                    >
                      Voir plus
                    </button>
                  )}
                </div>

                {/* Sous-écran "je ne sais pas" */}
                {ecouterChoice === "je ne sais pas" && (
                  <div className="mt-6 animate-fade-up">
                    <p className="font-inter text-sm text-t-creme/55 mb-4">
                      Tu peux juste approcher :
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {["moins de pression", "plus de soutien", "plus d'air"].map((opt) => (
                        <ChoiceChip
                          key={opt}
                          label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                          selected={ecouterOther === opt}
                          onClick={() => setEcouterOther(opt)}
                          className="border-t-creme/30 text-t-creme"
                        />
                      ))}
                    </div>
                  </div>
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
                  disabled={!ecouterChoice || (ecouterChoice === "je ne sais pas" && !ecouterOther)}
                  className="flex-1"
                >
                  Continuer
                </PrimaryButton>
              </div>
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
          {ackOverlay}
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

              {/* Lien perceptif avec le parcours */}
              <p className="font-inter text-sm text-t-creme/50 italic mb-6">
                À partir de ce qui s&apos;est éclairci…
              </p>

              {/* Question principale */}
              <p className="font-inter text-lg md:text-xl text-t-beige leading-relaxed whitespace-pre-wrap mb-3">
                Qu&apos;est-ce qui semble le plus juste maintenant ?
              </p>

              {/* Chips micro-action — conditionnées par le besoin (étape 4) */}
              <div className="mt-6">
                <div className="flex flex-wrap gap-2.5">
                  {((): string[] => {
                    switch (ecouterChoice === "je ne sais pas" ? ecouterOther : ecouterChoice) {
                      case "ralentir":
                      case "moins de pression":
                        return ["m'asseoir 2 minutes", "respirer encore 3 fois", "enlever une stimulation", "faire une pause"];
                      case "souffler":
                        return ["respirer encore 3 fois", "m'asseoir quelque part au calme", "boire un verre d'eau", "faire une pause"];
                      case "relâcher":
                        return ["étirer mon corps doucement", "secouer mes mains", "m'asseoir 2 minutes", "faire une pause"];
                      case "être rassuré":
                      case "plus de soutien":
                        return ["me parler plus doucement", "envoyer un message simple", "relire une phrase ressource", "rester avec quelque chose de stable"];
                      case "avoir de l'espace":
                      case "plus d'air":
                        return ["sortir prendre l'air", "couper le téléphone 10 min", "m'éloigner un moment", "boire un verre d'eau ailleurs"];
                      case "être soutenu":
                        return ["envoyer un message simple", "me rappeler un moment rassurant", "relire une phrase ressource", "rester avec quelque chose de stable"];
                      case "faire une pause":
                        return ["m'asseoir 2 minutes", "boire un verre d'eau", "faire une pause dehors", "respirer encore 3 fois"];
                      default:
                        return ["m'asseoir 2 minutes", "respirer encore 3 fois", "sortir prendre l'air", "faire une pause"];
                    }
                  })().map((action) => (
                    <ChoiceChip
                      key={action}
                      label={action.charAt(0).toUpperCase() + action.slice(1)}
                      selected={emergerChoice === action}
                      onClick={() => { setEmergerChoice(action); setEmergerOther(""); }}
                      className="border-t-creme/25 text-t-creme/90"
                    />
                  ))}
                </div>

                {/* Bouton secondaire discret */}
                {!emergerOther && emergerChoice !== "autre" && (
                  <button
                    onClick={() => { setEmergerChoice("autre"); setEmergerOther(""); }}
                    className="mt-3 px-3 py-1.5 rounded-full text-sm font-inter border border-t-creme/15 text-t-creme/40 hover:text-t-creme/60 transition-colors"
                  >
                    Autre idée
                  </button>
                )}
                {emergerChoice === "autre" && (
                  <TextCapsuleField
                    value={emergerOther}
                    onChange={setEmergerOther}
                    placeholder="Quelque chose de simple…"
                    className="mt-3.5"
                  />
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
        {ackOverlay}
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

            {/* Rappel du geste choisi */}
            {emergerChoice && emergerChoice !== "je ne sais pas" && (
              <div className="t-card !p-3 !rounded-xl mb-5">
                <p className="font-inter text-base text-t-beige">
                  {emergerChoice === "autre" && emergerOther.trim() ? emergerOther.trim() : emergerChoice}
                </p>
              </div>
            )}

            <p className="font-inter text-sm text-t-creme/55 italic mb-6">
              Choisis la version la plus simple.
            </p>

            {/* 3 choix simples */}
            <div className="flex flex-wrap gap-2.5">
              {([["maintenant", "Maintenant"], ["plus-petit", "En plus petit"], ["plus-tard", "Plus tard"]] as const).map(([key, label]) => (
                <ChoiceChip
                  key={key}
                  label={label}
                  selected={alignerFeedback === key}
                  onClick={() => setAlignerFeedback(key)}
                />
              ))}
            </div>

            {/* Boutons */}
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
                disabled={!alignerFeedback}
                className="flex-1"
              >
                Terminer
              </PrimaryButton>
            </div>
          </StepCard>
          <HelpPanel step={step} />
        </div>
      </ScreenContainer>
    );
  }

  // (Écran mirror supprimé — transition directe entre étapes)
  if (false && phase === "mirror") {
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
            step?.id !== "traverser" && step?.id !== "aligner" ? (
              <div className="text-center py-6">
                <p className="text-sm text-warm-gray italic animate-pulse-gentle">
                  Un instant.
                </p>
              </div>
            ) : null
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
                    ? `Ça semble appeler ${ecouterChoice === "être rassuré" ? "d'être rassuré" : ecouterChoice === "relâcher" ? "à relâcher" : ecouterChoice === "être soutenu" ? "du soutien" : ecouterChoice === "avoir de l'espace" ? "de l'espace" : ecouterChoice === "faire une pause" ? "une pause" : ecouterChoice === "ralentir" ? "à ralentir" : ecouterChoice === "souffler" ? "à souffler" : ecouterChoice === "je ne sais pas" && ecouterOther ? ecouterOther : ecouterChoice}.`
                    : step?.id === "emerger" && emergerChoice
                    ? (emergerChoice === "autre" && emergerOther.trim()
                        ? `${emergerOther.trim().charAt(0).toUpperCase() + emergerOther.trim().slice(1)}.`
                        : `${emergerChoice.charAt(0).toUpperCase() + emergerChoice.slice(1)}.`)
                    : mirrorData?.mirror}
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
              {mirrorData?.progress_signal &&
                ["conscientiser", "emerger", "aligner"].includes(step?.id || "") && (
                <div className="flex items-start gap-2 pl-6 py-2">
                  <span className="text-sage text-sm mt-0.5">↗</span>
                  <div>
                    <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-sage mb-1">
                      Ce qui évolue en toi
                    </p>
                    <p className="font-body text-sm text-sage leading-relaxed">
                      {mirrorData?.progress_signal}
                    </p>
                  </div>
                </div>
              )}

              {/* Hypothèse — "Ce que ça pourrait dire" (masqué étapes 1, 2, 4, 5 et 6) */}
              {mirrorData?.hypothesis && !["traverser", "reconnaitre", "conscientiser", "emerger", "aligner"].includes(step?.id || "") && (
                <div className="pl-6">
                  <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-sage/70 mb-2">
                    Ce que ça pourrait dire
                  </p>
                  <p className="font-body text-base text-espresso/80 leading-relaxed italic">
                    {mirrorData?.hypothesis}
                  </p>
                </div>
              )}

              {/* Éclairage — pas de label */}
              {mirrorData?.insight && (
                <p className="font-body text-base text-espresso leading-relaxed pl-6">
                  {mirrorData?.insight}
                </p>
              )}

              {/* Question ouverte — choix corporel rapide pour étape 1 (si non déjà sélectionné), "À explorer" pour les autres */}
              {step?.id === "traverser" ? (
                !bodyZone ? (
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
                ) : null
              ) : ["reconnaitre", "conscientiser", "emerger"].includes(step?.id || "") ? null : mirrorData?.question ? (
                <div className="pl-6">
                  <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-terra/70 mb-2">
                    À explorer
                  </p>
                  <p className="font-serif text-lg text-terra leading-relaxed">
                    {mirrorData?.question}
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
              ) : mirrorData?.micro_action ? (
                <div className="card-base !p-4 ml-6">
                  <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-1">
                    À essayer maintenant
                  </p>
                  <p className="font-body text-sm text-espresso leading-relaxed">
                    {mirrorData?.micro_action}
                  </p>
                </div>
              ) : null}

              {/* Pattern observation — "Ce que TRACÉA remarque" (Phase 2) */}
              {mirrorData?.pattern_observation && (
                <PatternObservation observation={mirrorData?.pattern_observation ?? ""} />
              )}

              {/* Next step suggestion — "Pour la prochaine fois" (Phase 3 — uniquement étape Aligner) */}
              {mirrorData?.next_step_suggestion && step?.id === "aligner" && (
                <div className="border-l-[3px] border-sage/40 pl-5 py-3 ml-6 bg-sage/5 rounded-r-xl">
                  <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-sage mb-1">
                    Pour la prochaine fois
                  </p>
                  <p className="font-body text-sm text-espresso/80 leading-relaxed italic">
                    {mirrorData?.next_step_suggestion}
                  </p>
                </div>
              )}

              {/* Message de sécurité */}
              {mirrorData?.safety_message && (
                <div className="card-base !border-l-4 !border-l-terra !p-4 ml-6 bg-terra-light/10">
                  <p className="font-body text-sm text-espresso leading-relaxed">
                    {mirrorData?.safety_message}
                  </p>
                </div>
              )}

              {/* Ressources d'urgence si risk_level = high */}
              {mirrorData?.showSafetyResources && <SafetyResources />}
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
              {step?.id === "aligner" ? "Voir ma synthèse" : currentStep < stepsActifs.length - 1 ? "Continuer" : "Étape suivante"}
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

  // (Écran intégration supprimé — passage direct à la synthèse finale)

  // (Écran intensity-after supprimé — check final intégré dans l'écran integration)

  // --- ANALYSIS / COMPLETE ---
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
      <h1 className="section-title !text-2xl md:!text-4xl">Ta traversée</h1>

      {/* Synthèse descriptive */}
      <div className="card-base mb-6 space-y-3">
        {ressentiChoice && (
          <p className="font-body text-sm text-espresso leading-relaxed">
            Ce qui était là : {ressentiChoice}.
          </p>
        )}
        {bodyZone && (
          <p className="font-body text-sm text-espresso leading-relaxed">
            Dans le corps : {bodyZone}.
          </p>
        )}
        {steps.ancrer && (
          <p className="font-body text-sm text-espresso leading-relaxed">
            Ce qui a bougé : {steps.ancrer}.
          </p>
        )}
        {traverserFreeText && (
          <p className="font-body text-sm text-espresso/70 leading-relaxed italic">
            &laquo;&nbsp;{traverserFreeText.slice(0, 200)}&nbsp;&raquo;
          </p>
        )}
        {steps.reconnaitre && (
          <p className="font-body text-sm text-espresso leading-relaxed">
            L&apos;émotion : {steps.reconnaitre}.
          </p>
        )}
        {steps.conscientiser && (
          <p className="font-body text-sm text-espresso leading-relaxed">
            Ce qui aidait : {steps.conscientiser}.
          </p>
        )}
        {steps.aligner && (
          <p className="font-body text-sm text-espresso leading-relaxed">
            Le geste choisi : {steps.aligner.replace(/\s*\(([^)]+)\)/, " — $1")}.
          </p>
        )}
      </div>

      {/* Analyse IA — filtrée pour ne garder que du texte lisible */}
      {analysis && (() => {
        const junkPatterns = /^(Analyse de ta traversée|Contexte\s*:|Intensité\s*:|TRAVERSER\s*·|RECONNAÎTRE\s*·|ANCRER\s*·|CONSCIENTISER\s*·|ÉMERGER\s*·|ALIGNER\s*·|Ton système nerveux|Le protocole t|récupération\s*:)/i;
        const cleaned = analysis
          .split("\n")
          .map(l => l.trim())
          .filter(l => l && !junkPatterns.test(l) && !l.startsWith("«") && !l.includes("/10"))
          .slice(0, 4);
        const displayText = cleaned.join(" ");
        if (!displayText) return null;
        return (
          <div className="card-base mb-6">
            <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-2">
              Ce que TRACÉA retient
            </p>
            <p className="font-body text-sm text-espresso leading-relaxed">
              {displayText}
            </p>
          </div>
        );
      })()}

      {/* Clôture */}
      <div className="text-center py-6 md:py-8">
        <p className="font-body text-base text-espresso/80 leading-relaxed mb-4">
          Tu as pris un moment pour toi.
        </p>
        <p className="font-body text-base text-espresso/50 leading-relaxed mb-10">
          C&apos;est suffisant pour maintenant.
        </p>
        <button
          onClick={() => router.push("/app")}
          className="btn-primary w-full md:w-auto mb-3 !py-4 md:!py-3 !text-base md:!text-sm !rounded-2xl"
        >
          Retour à l&apos;accueil
        </button>
        <div className="mt-3">
          <button
            onClick={() => router.push("/app/historique")}
            className="text-sm text-warm-gray hover:text-terra transition-colors underline underline-offset-2"
          >
            Voir mes traversées
          </button>
        </div>
      </div>
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
