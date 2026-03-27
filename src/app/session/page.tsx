"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STEPS } from "@/lib/steps";
import { useAuth } from "@/lib/auth-context";
import {
  createSessionDb,
  updateSessionDb,
} from "@/lib/supabase-store";
import type { SessionData, StepId } from "@/lib/types";
import { IntensitySlider } from "@/components/IntensitySlider";
import { StepIndicator } from "@/components/StepIndicator";
import { HelpPanel } from "@/components/HelpPanel";
import { SafetyBanner } from "@/components/SafetyBanner";
import { ConsentGate } from "@/components/ConsentGate";
import { BreathingGuide } from "@/components/BreathingGuide";
import Link from "next/link";

type Phase = "intro" | "session" | "mirror" | "intensity-after" | "analysis" | "complete";

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
          Connectez-vous pour commencer une session TRACEA et sauvegarder votre
          progression.
        </p>
        <Link href="/connexion" className="btn-primary inline-block">
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
  const [mirrorText, setMirrorText] = useState("");
  const [mirrorLoading, setMirrorLoading] = useState(false);
  const [mirrorStepName, setMirrorStepName] = useState("");
  const [mirrorError, setMirrorError] = useState("");

  const step = STEPS[currentStep];
  const completedSteps = Array.from({ length: currentStep }, (_, i) => i);

  async function handleStartSession() {
    const s = await createSessionDb(userId, intensity, context);
    if (s) {
      setSessionId(s.id);
      setPhase("session");
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

    // Trigger mirror reflection via API Claude
    setMirrorStepName(step.name);
    setMirrorLoading(true);
    setMirrorText("");
    setMirrorError("");
    setPhase("mirror");

    try {
      const res = await fetch("/api/tracea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "step-mirror",
          stepId,
          stepResponse: text,
          previousSteps: updatedSteps,
          context,
          intensity,
          userId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("API TRACEA error:", res.status, errData);
        setMirrorError(
          errData.error || `Erreur API (${res.status}). Le reflet n'a pas pu être généré.`
        );
      } else {
        const data = await res.json();
        if (data.mirror) {
          setMirrorText(data.mirror);
        } else {
          setMirrorError("La réponse de l'IA est vide. Vous pouvez continuer.");
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setMirrorError("Impossible de contacter l'IA. Vérifiez votre connexion.");
    }
    setMirrorLoading(false);
  }

  function handleContinueAfterMirror() {
    setText("");
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setPhase("session");
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
    setAnalysisLoading(false);
    setPhase("complete");
  }

  function generateFallbackAnalysis(): string {
    const recovery = intensity - intensityAfter;
    const parts: string[] = [];

    parts.push(
      `Analyse de votre traversée · ${new Date().toLocaleDateString("fr-FR", {
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
      parts.push("TRAVERSER · Ce que vous avez vécu :");
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
        `Votre système nerveux a récupéré ${recovery} points d'intensité. Le protocole vous a permis de traverser cette émotion de manière structurée.`
      );
    } else if (recovery === 0) {
      parts.push(
        "Votre intensité est restée stable. Certaines émotions demandent plus d'une traversée."
      );
    } else {
      parts.push(
        "Votre intensité a augmenté. Cela peut arriver lors de prises de conscience profondes."
      );
    }

    return parts.join("\n");
  }

  // --- INTRO ---
  if (phase === "intro") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="section-label">Nouvelle session</p>
        <h1 className="section-title">Préparer votre traversée</h1>
        <p className="text-warm-gray mb-8 leading-relaxed">
          Avant de commencer, évaluez votre état actuel.
        </p>

        <div className="card-base mb-6">
          <IntensitySlider value={intensity} onChange={setIntensity} />
        </div>

        <SafetyBanner intensity={intensity} />

        <div className="card-base mb-8">
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
                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
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

        <button onClick={handleStartSession} className="btn-primary w-full text-center">
          Commencer la traversée
        </button>
      </div>
    );
  }

  // --- SESSION ---
  if (phase === "session") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />
        <div className="mt-8 animate-fade-up" key={currentStep}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-terra rounded-full flex items-center justify-center font-serif text-lg text-cream">
              {step.number}
            </div>
            <h2 className="font-serif text-2xl text-espresso">{step.name}</h2>
          </div>
          <p className="text-sm text-warm-gray italic mb-6 ml-[52px]">
            {step.description}
          </p>

          {/* Guide de respiration pour l'etape Ancrer */}
          {step.id === "ancrer" && <BreathingGuide />}

          <div className="card-base">
            <p className="font-body text-lg text-espresso leading-relaxed mb-4">
              {step.question}
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Écrivez ici, à votre rythme..."
              className="w-full h-40 bg-beige/50 rounded-xl p-4 text-espresso font-body text-base leading-relaxed resize-none border border-beige-dark focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra/20 transition-all placeholder:text-warm-gray/40"
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-warm-gray">
                Étape {currentStep + 1} sur {STEPS.length}
              </span>
              <button
                onClick={handleNextStep}
                disabled={text.trim().length < 3}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {currentStep < STEPS.length - 1 ? "Étape suivante" : "Terminer"}
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <StepIndicator currentStep={currentStep} completedSteps={[...completedSteps, currentStep]} />
        <div className="mt-8 animate-fade-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-sage rounded-full flex items-center justify-center font-serif text-lg text-cream">
              ✓
            </div>
            <h2 className="font-serif text-2xl text-espresso">{mirrorStepName}</h2>
          </div>

          {mirrorLoading ? (
            <div className="card-accent text-center py-8">
              <div className="font-serif text-xl text-terra mb-3 animate-pulse-gentle">
                TRACEA
              </div>
              <p className="text-sm text-warm-gray italic">
                Écoute en cours...
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
          ) : mirrorText ? (
            <div className="border-l-[3px] border-sage pl-6 py-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-sage" />
                <p className="text-xs font-medium tracking-widest uppercase text-sage">
                  Reflet
                </p>
              </div>
              <div className="font-body text-base text-espresso leading-relaxed whitespace-pre-wrap">
                {mirrorText}
              </div>
            </div>
          ) : null}

          <button
            onClick={handleContinueAfterMirror}
            disabled={mirrorLoading}
            className="btn-primary w-full text-center disabled:opacity-40"
          >
            {currentStep < STEPS.length - 1 ? "Passer à l'étape suivante" : "Évaluer mon intensité"}
          </button>

          {mirrorLoading && (
            <button
              onClick={handleContinueAfterMirror}
              className="btn-ghost w-full text-center mt-2 text-sm"
            >
              Passer le reflet
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- INTENSITY AFTER ---
  if (phase === "intensity-after") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="section-label">Fin de traversée</p>
        <h1 className="section-title">Réévaluez votre intensité</h1>
        <div className="card-base mb-6">
          <IntensitySlider
            value={intensityAfter}
            onChange={setIntensityAfter}
            label="Intensité après la traversée"
          />
        </div>
        <div className="flex items-center gap-4 mb-8">
          <div className="card-terra flex-1 text-center">
            <div className="text-xs text-terra-dark tracking-widest uppercase mb-1">Avant</div>
            <div className="font-serif text-2xl text-espresso">{intensity}/10</div>
          </div>
          <div className="font-serif text-xl text-warm-gray">→</div>
          <div className="card-sage flex-1 text-center">
            <div className="text-xs text-[#4A6B3A] tracking-widest uppercase mb-1">Après</div>
            <div className="font-serif text-2xl text-espresso">{intensityAfter}/10</div>
          </div>
        </div>
        <button onClick={handleIntensityAfterDone} className="btn-primary w-full text-center">
          Voir mon analyse
        </button>
      </div>
    );
  }

  // --- ANALYSIS / COMPLETE ---
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <p className="section-label">Analyse de session</p>
      <h1 className="section-title">Votre traversée</h1>
      {analysisLoading ? (
        <div className="card-base text-center py-16">
          <div className="font-serif text-3xl text-terra mb-4 animate-pulse-gentle">TRACEA</div>
          <p className="text-warm-gray">Génération de votre analyse...</p>
          <p className="text-xs text-warm-gray/60 mt-2 italic">
            L&apos;IA miroir analyse votre parcours...
          </p>
        </div>
      ) : (
        <>
          <div className="card-base mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-sage" />
              <span className="text-xs font-medium tracking-widest uppercase text-sage">
                Analyse miroir · IA non projective
              </span>
            </div>
            <div className="font-body text-base text-espresso leading-relaxed whitespace-pre-wrap">
              {analysis}
            </div>
          </div>

          {/* Intensity summary */}
          <div className="flex items-center gap-4 mb-6">
            <div className="card-terra flex-1 text-center">
              <div className="text-xs text-terra-dark tracking-widest uppercase mb-1">Avant</div>
              <div className="font-serif text-2xl text-espresso">{intensity}/10</div>
            </div>
            <div className="font-serif text-xl text-warm-gray">→</div>
            <div className="card-sage flex-1 text-center">
              <div className="text-xs text-[#4A6B3A] tracking-widest uppercase mb-1">Après</div>
              <div className="font-serif text-2xl text-espresso">{intensityAfter}/10</div>
            </div>
            <div className="flex-1 text-center">
              {intensity - intensityAfter > 0 ? (
                <>
                  <div className="text-xs text-sage tracking-widest uppercase mb-1">Régulation</div>
                  <div className="font-serif text-2xl text-sage">
                    {intensity - intensityAfter} <span className="text-base">pts gagnés</span>
                  </div>
                </>
              ) : intensity - intensityAfter === 0 ? (
                <>
                  <div className="text-xs text-warm-gray tracking-widest uppercase mb-1">Évolution</div>
                  <div className="font-serif text-2xl text-warm-gray">
                    Stabilité maintenue
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs text-terra tracking-widest uppercase mb-1">Évolution</div>
                  <div className="font-serif text-2xl text-terra">
                    Traversée en cours
                  </div>
                </>
              )}
            </div>
          </div>

          {veriteInterieure && (
            <div className="border-l-[3px] border-terra pl-6 py-3 mb-6">
              <p className="text-xs font-medium tracking-widest uppercase text-terra mb-2">
                Votre vérité intérieure
              </p>
              <p className="font-body text-xl italic text-espresso">
                &ldquo;{veriteInterieure}&rdquo;
              </p>
            </div>
          )}
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => router.push("/historique")} className="btn-secondary">
              Voir mon historique
            </button>
            <button
              onClick={() => {
                setPhase("intro");
                setCurrentStep(0);
                setText("");
                setSessionId(null);
                setSteps({
                  traverser: "", reconnaitre: "", ancrer: "",
                  conscientiser: "", emerger: "", aligner: "",
                });
                setIntensity(5);
                setIntensityAfter(3);
                setAnalysis("");
                setVeriteInterieure("");
                setMirrorText("");
              }}
              className="btn-primary"
            >
              Nouvelle session
            </button>
          </div>

          <p className="text-xs text-warm-gray text-center mt-8 italic">
            Cette analyse est un reflet structuré de ce que vous avez exprimé.
            Elle ne constitue ni un diagnostic, ni un conseil thérapeutique.
          </p>
        </>
      )}
    </div>
  );
}
