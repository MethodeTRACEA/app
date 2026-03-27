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
}

export interface UserProfile {
  name: string;
  sessionsCount: number;
  firstSessionDate: string | null;
  lastSessionDate: string | null;
}
