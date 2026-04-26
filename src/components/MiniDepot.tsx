"use client";

import { useState } from "react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

// ════════════════════════════════════════════════════════════
// MiniDepot — dépôt facultatif avant l'entrée dans un flow.
// Le texte n'est pas analysé, pas envoyé, pas stocké.
// onContinue(text) transmet le texte brut au parent pour
// un matching local optionnel — sans IA, sans API.
// ════════════════════════════════════════════════════════════

export function MiniDepot({ onContinue }: { onContinue: (text: string) => void }) {
  const [text, setText] = useState("");

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 px-2">
      <p className="font-serif text-2xl text-t-beige text-center leading-relaxed">
        Si tu veux, tu peux écrire ce qui se passe pour toi en ce moment.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="..."
        rows={4}
        className="w-full rounded-2xl border border-[rgba(232,216,199,0.18)] bg-white/5 px-4 py-3 font-body text-base t-text-primary placeholder:opacity-30 resize-none focus:outline-none focus:border-[rgba(232,216,199,0.35)]"
      />

      <div className="w-full space-y-3">
        <PrimaryButton onClick={() => onContinue(text)}>
          Continuer
        </PrimaryButton>
        <button
          type="button"
          onClick={() => onContinue(text)}
          className="w-full text-center font-inter text-sm t-text-ghost py-2"
        >
          Passer directement
        </button>
      </div>
    </div>
  );
}
