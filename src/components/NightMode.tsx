"use client";

import { useEffect, useState } from "react";

export function NightMode() {
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("tracea_night_mode");
    if (saved === "true") {
      setIsNight(true);
      document.documentElement.classList.add("night");
    }
  }, []);

  function toggle() {
    const next = !isNight;
    setIsNight(next);
    localStorage.setItem("tracea_night_mode", String(next));
    if (next) {
      document.documentElement.classList.add("night");
    } else {
      document.documentElement.classList.remove("night");
    }
  }

  return (
    <button
      onClick={toggle}
      title={isNight ? "Passer en mode clair" : "Passer en mode sombre"}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "16px",
        opacity: 0.6,
        transition: "opacity 0.2s",
        padding: "4px",
        lineHeight: 1,
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "0.6")}
    >
      {isNight ? "☀️" : "🌙"}
    </button>
  );
}
