"use client";

import { useState, useEffect } from "react";
import { getReminderPreference, setReminderPreference } from "@/lib/reminder";

export function ReminderPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getReminderPreference() !== null) return;
    if (sessionStorage.getItem("reminder_dismissed") === "1") return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  function handlePick(hour: number) {
    setReminderPreference(hour);
    setVisible(false);
  }

  function handleDismiss() {
    sessionStorage.setItem("reminder_dismissed", "1");
    setVisible(false);
  }

  return (
    <div className="w-full rounded-2xl border border-[rgba(232,216,199,0.15)] bg-white/5 px-5 py-4 space-y-3">
      <p className="font-body text-sm t-text-secondary leading-relaxed text-center">
        Un rappel de temps en temps ?
        <br />
        <span className="t-text-ghost text-xs">
          L&apos;app sera là si tu en as envie.
        </span>
      </p>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => handlePick(9)}
          className="w-full rounded-xl bg-t-beige/10 border border-t-beige/20 py-2.5 font-inter text-sm t-text-secondary hover:bg-t-beige/15 transition-colors"
        >
          Vers 9h
        </button>
        <button
          type="button"
          onClick={() => handlePick(18)}
          className="w-full rounded-xl bg-t-beige/10 border border-t-beige/20 py-2.5 font-inter text-sm t-text-secondary hover:bg-t-beige/15 transition-colors"
        >
          Vers 18h
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="w-full text-center font-inter text-xs t-text-ghost py-1.5 opacity-60 hover:opacity-100 transition-opacity"
        >
          Pas pour l&apos;instant
        </button>
      </div>
    </div>
  );
}
