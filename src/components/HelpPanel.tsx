"use client";

import { useState } from "react";
import { StepDefinition } from "@/lib/types";

interface HelpPanelProps {
  step: StepDefinition;
}

type Tab = "comprendre" | "sousQuestions" | "exemples" | "bloque";

const tabs: { id: Tab; label: string }[] = [
  { id: "comprendre", label: "Comprendre" },
  { id: "sousQuestions", label: "Sous-questions" },
  { id: "exemples", label: "Exemples" },
  { id: "bloque", label: "Bloqué ?" },
];

export function HelpPanel({ step }: HelpPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("comprendre");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-terra font-medium hover:text-terra-dark transition-colors"
      >
        <span
          className={`inline-block transition-transform duration-200 ${
            isOpen ? "rotate-90" : ""
          }`}
        >
          ▸
        </span>
        Besoin d&apos;aide pour cette étape ?
      </button>

      {isOpen && (
        <div className="mt-3 card-base animate-fade-up">
          <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium tracking-wide rounded-full whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-terra text-cream"
                    : "bg-beige text-warm-gray hover:bg-beige-dark"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-sm leading-relaxed">
            {activeTab === "comprendre" && (
              <p className="font-body text-base text-espresso leading-relaxed">
                {step.help.comprendre}
              </p>
            )}
            {activeTab === "sousQuestions" && (
              <ul className="space-y-2">
                {step.help.sousQuestions.map((q, i) => (
                  <li key={i} className="flex gap-2 text-espresso">
                    <span className="text-terra font-medium">·</span>
                    <span className="font-body">{q}</span>
                  </li>
                ))}
              </ul>
            )}
            {activeTab === "exemples" && (
              <ul className="space-y-3">
                {step.help.exemples.map((ex, i) => (
                  <li
                    key={i}
                    className="card-accent text-sm font-body italic text-espresso"
                  >
                    &ldquo;{ex}&rdquo;
                  </li>
                ))}
              </ul>
            )}
            {activeTab === "bloque" && (
              <div className="card-sage">
                <p className="font-body text-base text-espresso leading-relaxed">
                  {step.help.bloque}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
