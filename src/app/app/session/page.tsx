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

type Phase = "intro" | "welcome" | "entry-question" | "session" | "mirror" | "transitioning" | "integration" | "intensity-after" | "analysis" | "complete";

// Messages de transition entre étapes (Section 4)
const TRANSITION_MESSAGES: Record<string, string> = {
  "traverser→reconnaitre": "Tu as posé ce qui était là. Maintenant, regardons de plus près.",
  "reconnaitre→ancrer": "Tu as nommé ce que tu ressens. Maintenant, ralentis.",
  "ancrer→conscientiser": "Ton corps a trouvé un appui. Maintenant, on peut regarder ce qui se joue.",
  "conscientiser→emerger": "Tu as vu ce qui était en jeu. Voyons ce qui émerge.",
  "emerger→aligner": "Quelque chose s'est clarifié. Maintenant, on le traduit en geste concret.",
  // Transitions pour le mode court
  "traverser→ancrer": "Tu as posé ce qui était là. Maintenant, ralentis.",
  "ancrer→emerger": "Ton corps a trouvé un appui. Voyons ce qui émerge.",
};

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
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="font-serif text-2xl text-espresso mb-4">
          Connexion requise
        </h1>
        <p className="text-warm-gray mb-6">
          Connecte-toi pour commencer une session TRACÉA et sauvegarder ta
          progression.
        </p>
        <Link href="/app/connexion" className="btn-primary inline-block">
          Se connecter
        </Link>
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
  const [depotText, setDepotText] = useState("");
  const [showDepot, setShowDepot] = useState(true);
  const [hadDoNotStore, setHadDoNotStore] = useState(false);
  const [lastNextStepSuggestion, setLastNextStepSuggestion] = useState("");
  const [lastMicroAction, setLastMicroAction] = useState("");
  const [lastInsight, setLastInsight] = useState("");
  const [entryQuestion, setEntryQuestion] = useState("");
  const [transitionMessage, setTransitionMessage] = useState("");
  const [integrationResponse, setIntegrationResponse] = useState<"yes" | "no" | "unsure" | null>(null);
  const [integrationMessage, setIntegrationMessage] = useState("");
  const [mirrorNote, setMirrorNote] = useState("");
  const [mirrorNotes, setMirrorNotes] = useState<Record<string, string>>({});

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
      setPhase("welcome");
    }
  }

  async function handleNextStep() {
    if (!sessionId) return;

    const stepId = step.id as StepId;
    const updatedSteps = { ...steps, [stepId]: text };
    setSteps(updatedSteps);

    const updates: Record<string, unknown> = { steps: updatedSteps };

    if (stepId === "reconnaitre") {
      updates.emotion_primaire = text.slice(0, 100);
    }
    if (stepId === "emerger") {
      updates.verite_interieure = text.slice(0, 200);
      setVeriteInterieure(text.slice(0, 200));
    }
    if (stepId === "aligner") {
      updates.action_alignee = text.slice(0, 200);
    }

    await updateSessionDb(sessionId, updates as Parameters<typeof updateSessionDb>[1]);

    // ── Vérifier si le cache contient déjà une réponse IA pour ce texte ──
    const cached = stepCache[stepId];
    const textUnchanged = cached?.validatedText === text.trim() && cached.aiResponse;

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
        [stepId]: { ...prev[stepId], text },
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
        stepResponse: text,
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
          [stepId]: { text, validatedText: text.trim(), aiResponse: null, aiError: errorMsg, stepName: step.name },
        }));
      } else {
        const data = await res.json() as TraceaAIResponse;
        if (data.mirror) {
          setMirrorData(data);
          setLastStepSnapshot(data.user_state_snapshot);
          // Sauvegarder la réponse IA dans le cache
          setStepCache(prev => ({
            ...prev,
            [stepId]: { text, validatedText: text.trim(), aiResponse: data, aiError: "", stepName: step.name },
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
          if (stepId === "emerger" && data.insight) {
            setLastInsight(data.insight);
          }
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

      // Transition entre étapes (Section 4)
      const key = `${currentStepId}→${nextStepId}`;
      const message = TRANSITION_MESSAGES[key] || "";
      setMirrorNote("");
      if (message) {
        setTransitionMessage(message);
        setPhase("transitioning");
        setTimeout(() => {
          setCurrentStep(nextIndex);
          setText(restoredText);
          setPhase("session");
        }, 2000);
      } else {
        setCurrentStep(nextIndex);
        setText(restoredText);
        setPhase("session");
      }
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
      parts.push("CONSCIENTISER · Le message profond :");
      parts.push(steps.conscientiser.slice(0, 200));
      parts.push("");
    }
    if (steps.emerger) {
      parts.push("ÉMERGER · La vérité qui a émergé :");
      parts.push(`« ${steps.emerger.slice(0, 200)} »`);
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

  // --- TRANSITIONING (Section 4) ---
  if (phase === "transitioning") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 animate-fade-in">
        <div className="text-center min-h-[40vh] flex items-center justify-center">
          <p className="font-body text-lg text-cream italic leading-relaxed max-w-md">
            {transitionMessage}
          </p>
        </div>
      </div>
    );
  }

  // --- SESSION ---
  if (phase === "session") {
    const hasCachedAI = !!(stepCache[step.id]?.aiResponse && stepCache[step.id]?.validatedText === text.trim());

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
        <StepIndicator
          currentStep={currentStepIndicateur}
          completedSteps={completedSteps}
          activeSteps={modeTraversee === "court" ? [0, 2, 4] : undefined}
        />

        <div className="mt-3 md:mt-4 animate-fade-up" key={currentStep}>
          <div className="card-base !p-5 md:!p-6">
            {/* En-tête d'étape intégré dans la carte */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-terra rounded-full flex items-center justify-center font-serif text-base md:text-lg text-cream flex-shrink-0">
                  {step.number}
                </div>
                <div>
                  <h2 className="font-serif text-xl md:text-2xl text-espresso leading-tight">{step.name}</h2>
                  <p className="text-xs text-warm-gray mt-0.5">
                    Étape {currentStep + 1} sur {stepsActifs.length}
                  </p>
                </div>
              </div>
              {hasCachedAI && (
                <span className="text-[10px] tracking-wider uppercase text-sage bg-sage/10 px-2 py-0.5 rounded-full flex-shrink-0">
                  Reflet disponible
                </span>
              )}
            </div>

            <p className="text-sm text-warm-gray italic mb-4">
              {step.description}
            </p>

            {/* Guide de respiration pour l'etape Ancrer */}
            {step.id === "ancrer" && <BreathingGuide />}

            {/* Instruction corporelle avant Conscientiser */}
            {step.id === "conscientiser" && (
              <div className="bg-sage/5 border border-sage/15 rounded-xl px-4 py-3 mb-4">
                <p className="font-body text-sm text-espresso/70 leading-relaxed">
                  Laisse l&apos;attention descendre dans ton corps.
                  <br />
                  Pose tes mains sur tes cuisses.
                </p>
              </div>
            )}

            {/* Instruction corporelle avant Aligner */}
            {step.id === "aligner" && (
              <div className="bg-sage/5 border border-sage/15 rounded-xl px-4 py-3 mb-4">
                <p className="font-body text-sm text-espresso/70 leading-relaxed">
                  Prends ce moment.
                  <br />
                  Laisse ton corps faire ce qui lui ferait du bien maintenant.
                </p>
              </div>
            )}

            <p className={`font-body text-base md:text-lg text-espresso leading-relaxed whitespace-pre-wrap ${(step.id === "traverser" || step.id === "reconnaitre") ? "mb-2" : "mb-4"}`}>
              {step.question}
            </p>
            {step.id === "reconnaitre" && (
              <p className="font-body text-sm text-warm-gray/70 mb-4">
                Tu peux rester simple. Même vague.
              </p>
            )}
            {step.id === "traverser" && (
              <>
                <p className="font-body text-sm text-warm-gray/70 mb-3">
                  Pas besoin de bien répondre. Juste ce qui est là.
                </p>
                <p className="font-body text-xs text-warm-gray/50 italic mb-1">
                  Tu peux partir du corps si c&apos;est plus simple.
                </p>
                <p className="font-body text-xs text-warm-gray/50 italic mb-2">
                  Prends une seconde. Sens ton corps là, maintenant.
                </p>
              </>
            )}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Écris ici, à ton rythme..."
              className="w-full h-36 md:h-40 bg-beige/50 rounded-xl p-4 text-espresso font-body text-base leading-relaxed resize-none border border-beige-dark focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra/20 transition-all placeholder:text-warm-gray/40"
            />
            {step.id === "aligner" && (
              <p className="font-body text-sm text-terra/70 italic mt-2">
                Fais-le maintenant, même quelques secondes.
              </p>
            )}

            {/* Boutons */}
            <div className="flex items-center gap-3 mt-5">
              {currentStep > 0 && (
                <button
                  onClick={handleGoBack}
                  className="flex items-center justify-center gap-1.5 px-5 py-3.5 md:py-3 rounded-2xl border-2 border-beige-dark text-warm-gray text-sm font-medium hover:border-warm-gray hover:bg-beige transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  <span className="hidden sm:inline">Retour</span>
                </button>
              )}
              <button
                onClick={handleNextStep}
                disabled={text.trim().length < 3}
                className="btn-primary flex-1 text-center !py-4 md:!py-3 !text-base md:!text-sm !rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {currentStep < stepsActifs.length - 1 ? "Continuer" : "J\u2019ai fait mon geste"}
              </button>
            </div>
          </div>
          <HelpPanel step={step} />
        </div>
      </div>
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
            <div className="card-accent text-center py-8">
              <div className="font-serif text-xl text-terra mb-3 animate-pulse-gentle">
                TRACEA
              </div>
              <p className="text-sm text-warm-gray italic">
                TRACÉA prend le temps de te lire...
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
              {/* Miroir — "Ce que tu vis" */}
              <div className="border-l-[3px] border-sage pl-6 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-sage" />
                  <p className="text-xs font-medium tracking-widest uppercase text-sage">
                    Ce que tu vis
                  </p>
                </div>
                <p className="font-body text-base text-espresso leading-relaxed">
                  {mirrorData.mirror}
                </p>
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

              {/* Hypothèse — "Ce que ça pourrait dire" */}
              {mirrorData.hypothesis && (
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

              {/* Question ouverte — "À explorer" */}
              {mirrorData.question && (
                <div className="pl-6">
                  <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-terra/70 mb-2">
                    À explorer
                  </p>
                  <p className="font-serif text-lg text-terra leading-relaxed">
                    {mirrorData.question}
                  </p>
                </div>
              )}

              {/* Champ de dépôt — visible sauf étape Aligner */}
              {step?.id !== "aligner" && (
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

              {/* Micro-action — "À essayer maintenant" */}
              {mirrorData.micro_action && (
                <div className="card-base !p-4 ml-6">
                  <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-1">
                    À essayer maintenant
                  </p>
                  <p className="font-body text-sm text-espresso leading-relaxed">
                    {mirrorData.micro_action}
                  </p>
                </div>
              )}

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
              {currentStep < stepsActifs.length - 1 ? "Continuer" : "Je continue à m\u2019écouter"}
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
              <p className="font-serif text-2xl text-espresso mb-6">
                Prends 10 secondes.
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
        {intensity > intensityAfter ? (
          <div className="text-center mb-4">
            <p className="font-body text-sm text-sage italic">
              Tu viens de faire redescendre ton corps.
            </p>
            <p className="font-body text-sm text-sage italic">
              Ce mouvement compte.
            </p>
          </div>
        ) : (
          <div className="text-center mb-4">
            <p className="font-body text-sm text-warm-gray italic">
              Ton corps a commencé à relâcher.
            </p>
            <p className="font-body text-sm text-warm-gray italic">
              Ce mouvement compte.
            </p>
          </div>
        )}
        <div className="card-base mb-6">
          <IntensitySlider
            value={intensityAfter}
            onChange={setIntensityAfter}
            label="Intensité après la traversée"
          />
        </div>
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
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
        <button onClick={handleIntensityAfterDone} className="btn-primary w-full text-center !py-4 md:!py-3 !text-base md:!text-sm !rounded-2xl">
          Revoir ma traversée
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
          <div className="card-base mb-6">
            <div className="font-body text-sm md:text-base text-espresso leading-relaxed whitespace-pre-wrap">
              {analysis}
            </div>
          </div>

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

          {/* Résumé post-session enrichi (Phase 3) — ton incarné */}
          {lastStepSnapshot && (
            <div className="card-base mb-6">
              <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">
                Ce que TRACÉA a repéré
              </p>
              <div className="space-y-2">
                <p className="font-body text-sm text-espresso">
                  {lastStepSnapshot.dominant_emotion}
                </p>
                <p className="font-body text-sm text-espresso">
                  La tension est descendue à {lastStepSnapshot.tension_level}/10.
                </p>
              </div>
            </div>
          )}

          {/* Une chose à retenir */}
          {lastInsight && (
            <div className="card-base mb-6">
              <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-2">
                Une chose à retenir
              </p>
              <p className="font-body text-base text-espresso leading-relaxed">
                {lastInsight}
              </p>
            </div>
          )}

          {veriteInterieure && (
            <div className="border-l-[3px] border-terra pl-6 py-3 mb-6">
              <p className="font-body text-xl italic text-espresso">
                {veriteInterieure.toLowerCase().includes("je ne sais pas") || veriteInterieure.toLowerCase().includes("sais pas") || veriteInterieure.trim().length < 10
                  ? "Quelque chose est encore en train de se déposer."
                  : <>&ldquo;{veriteInterieure}&rdquo;</>}
              </p>
            </div>
          )}

          {/* Micro-action + Next step suggestion (Phase 3) */}
          {(lastMicroAction || lastNextStepSuggestion) && (
            <div className="card-base mb-6 space-y-4">
              {lastMicroAction && (
                <div>
                  <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-2">
                    À essayer maintenant
                  </p>
                  <p className="font-body text-sm text-espresso leading-relaxed">
                    {lastMicroAction}
                  </p>
                </div>
              )}
              {lastNextStepSuggestion && (
                <div className="border-l-[3px] border-sage/40 pl-4 py-2">
                  <p className="text-xs font-medium tracking-widest uppercase text-sage mb-1">
                    Pour la prochaine fois
                  </p>
                  <p className="font-body text-sm text-espresso/80 leading-relaxed italic">
                    {lastNextStepSuggestion}
                  </p>
                </div>
              )}
            </div>
          )}

          {showDepot ? (
            <div className="card-base mb-6 !p-5 md:!p-6">
              <p className="font-body text-xs text-warm-gray/60 tracking-wider uppercase mb-3">
                Avant de repartir&hellip;
              </p>
              <p className="font-serif text-base md:text-lg text-espresso mb-4">
                Qu&apos;est-ce que tu gardes avec toi ?
              </p>
              <textarea
                value={depotText}
                onChange={(e) => setDepotText(e.target.value)}
                placeholder="Ce que je garde avec moi..."
                className="w-full px-4 py-3 bg-beige/50 rounded-xl text-espresso font-sans text-base border border-beige-dark focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra/20 transition-all placeholder:text-warm-gray/40 resize-none mb-4"
                rows={3}
              />
              <button
                onClick={() => setShowDepot(false)}
                className="btn-primary w-full text-center !py-4 md:!py-3 !text-base md:!text-sm !rounded-2xl"
              >
                Terminer la traversée
              </button>
            </div>
          ) : (
            /* Écran de fin (Section 6) */
            <div className="text-center py-6 md:py-8 animate-fade-in">
              <h2 className="font-serif text-xl md:text-2xl text-espresso mb-4">
                Ta traversée est terminée.
              </h2>
              <p className="font-body text-sm md:text-base text-espresso/70 leading-relaxed mb-6 md:mb-8">
                Plus tu pratiques, plus ça devient naturel.
              </p>
              <button
                onClick={() => router.push("/app")}
                className="btn-primary w-full md:w-auto mb-3 !py-4 md:!py-3 !text-base md:!text-sm !rounded-2xl"
              >
                Je continue à m&apos;écouter
              </button>
              <p className="font-body text-sm text-warm-gray/60 italic mb-4">
                Reviens quand quelque chose bouge en toi.
              </p>
              <div>
                <Link
                  href="/app/profil"
                  className="text-sm text-warm-gray hover:text-terra transition-colors underline underline-offset-2"
                >
                  Voir mon profil
                </Link>
              </div>
            </div>
          )}

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
