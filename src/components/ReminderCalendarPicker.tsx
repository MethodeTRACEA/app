"use client";

import { useState } from "react";

// ════════════════════════════════════════════════════════════
// TRACÉA — Chantier 57 « Ancrage contextuel » — Brique 57-8
// Calendrier sobre pour le mode « Une date précise » des rappels.
// Aucune dépendance externe (aucun date-picker déjà présent dans le
// projet — vérifié avant construction). Ton volontairement neutre : pas de
// couleurs vives d'alerte, pas de patron « outil de planification » façon
// agenda — même palette/typo que le reste de l'écran /app/rappels.
// Les dates strictement antérieures à aujourd'hui (fuseau du navigateur) ne
// sont pas sélectionnables : un rappel ponctuel dans le passé serait
// immédiatement redésarmé par la logique de 57-7.
// ════════════════════════════════════════════════════════════

interface ReminderCalendarPickerProps {
  value: string | null; // "YYYY-MM-DD"
  onChange: (date: string) => void;
}

const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
const JOURS_ENTETE = ["L", "M", "M", "J", "V", "S", "D"];

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const navBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "1px solid rgba(232,216,199,0.15)",
  background: "transparent",
  color: "rgba(240,230,214,0.70)",
  fontSize: 16,
  cursor: "pointer",
};

export function ReminderCalendarPicker({ value, onChange }: ReminderCalendarPickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = toDateKey(today);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  // getDay() : 0=dimanche…6=samedi → décalage pour démarrer la semaine lundi.
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

  const isCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  function goPrev() {
    if (isCurrentMonth) return; // pas de mois passé
    setViewMonth((m) => (m === 0 ? 11 : m - 1));
    setViewYear((y) => (viewMonth === 0 ? y - 1 : y));
  }
  function goNext() {
    setViewMonth((m) => (m === 11 ? 0 : m + 1));
    setViewYear((y) => (viewMonth === 11 ? y + 1 : y));
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <button
          type="button"
          onClick={goPrev}
          disabled={isCurrentMonth}
          style={{ ...navBtnStyle, opacity: isCurrentMonth ? 0.25 : 1, cursor: isCurrentMonth ? "not-allowed" : "pointer" }}
          aria-label="Mois précédent"
        >
          ‹
        </button>
        <span
          className="font-sans"
          style={{ fontSize: 13, color: "rgba(240,230,214,0.75)", letterSpacing: "0.04em" }}
        >
          {MOIS[viewMonth]} {viewYear}
        </span>
        <button type="button" onClick={goNext} style={navBtnStyle} aria-label="Mois suivant">
          ›
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
        {JOURS_ENTETE.map((j, i) => (
          <div
            key={i}
            style={{ textAlign: "center", fontSize: 11, color: "rgba(240,230,214,0.35)" }}
          >
            {j}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = toDateKey(d);
          const disabled = key < todayKey;
          const selected = value === key;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onChange(key)}
              style={{
                aspectRatio: "1",
                borderRadius: 10,
                border: selected
                  ? "1px solid rgba(214,165,106,0.6)"
                  : "1px solid rgba(232,216,199,0.10)",
                background: selected ? "rgba(214,165,106,0.15)" : "rgba(111,106,100,0.15)",
                color: disabled
                  ? "rgba(240,230,214,0.20)"
                  : selected
                    ? "#D6A56A"
                    : "rgba(240,230,214,0.80)",
                fontSize: 13,
                fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
