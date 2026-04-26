export type StepId =
  | "traverser"
  | "reconnaitre"
  | "ancrer"
  | "conscientiser"
  | "emerger"
  | "aligner";

export interface StepDefinition {
  id: StepId;
  number: number;
  name: string;
  verb: string;
  description: string;
  question: string;
  help: {
    comprendre: string;
    sousQuestions: string[];
    exemples: string[];
    bloque: string;
  };
}

export interface SessionData {
  id: string;
  date: string;
  intensiteBefore: number;
  intensiteAfter: number | null;
  context: "relationnel" | "professionnel" | "existentiel" | "autre";
  steps: Record<StepId, string>;
  currentStep: number;
  completed: boolean;
  analysis: string | null;
  emotionPrimaire: string | null;
  veriteInterieure: string | null;
  actionAlignee: string | null;
  noteEntreSession?: string;
}

export interface UserProfile {
  name: string;
  sessionsCount: number;
  firstSessionDate: string | null;
  lastSessionDate: string | null;
}

// ===================================================================
// TRACEA AI Response (Phase 1 — JSON structuré)
// ===================================================================

export interface TraceaAIResponse {
  tone_level: "soft" | "moderate" | "deep";
  risk_level: "low" | "medium" | "high";
  module: string;
  mirror: string;
  hypothesis: string;
  insight: string;
  question: string;
  micro_action: string;
  pattern_observation: string;
  progress_signal: string;
  next_step_suggestion: string;
  safety_message: string;
  user_state_snapshot: {
    dominant_emotion: string;
    tension_level: number;
    regulation_state: "stable" | "fluctuating" | "overloaded";
    clarity_level: number;
  };
  do_not_store: boolean;
  showSafetyResources: boolean;
}
