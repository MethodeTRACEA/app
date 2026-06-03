"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getCompletedSessionsDb } from "@/lib/supabase-store";
import {
  getMemoryProfileClient,
  getRecurringEmotions,
  type MemoryProfile,
} from "@/lib/memory";
import { supabase } from "@/lib/supabase";

// Composant en lecture seule.
// Réutilise les mêmes sources de données que /app/ce-qui-change (Bloc 1
// "Ce qui revient souvent" + "Tu nommes souvent"). Aucun nouveau calcul.
// N'affiche rien tant qu'il n'y a pas au moins 3 traversées et au moins
// un élément récurrent à montrer.

const MIN_SESSIONS = 3;

export function RefletCompact() {
  const { user } = useAuth();
  const [sessionsCount, setSessionsCount] = useState<number | null>(null);
  const [memoryProfile, setMemoryProfile] = useState<MemoryProfile | null>(null);
  const [recurringEmotion, setRecurringEmotion] = useState<{
    emotion: string;
    count: number;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    Promise.all([
      getCompletedSessionsDb(user.id),
      getMemoryProfileClient(supabase, user.id),
      getRecurringEmotions(supabase, user.id),
    ])
      .then(([sessions, profile, emo]) => {
        if (cancelled) return;
        setSessionsCount(sessions.length);
        setMemoryProfile(profile);
        setRecurringEmotion(emo);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user || sessionsCount === null) return null;
  if (sessionsCount < MIN_SESSIONS) return null;

  const recurringPatterns =
    memoryProfile?.recurring_patterns?.filter(Boolean) ?? [];
  const commonTriggers =
    memoryProfile?.common_triggers?.filter(Boolean) ?? [];
  const items =
    recurringPatterns.length > 0
      ? recurringPatterns.slice(0, 3)
      : commonTriggers.slice(0, 3);

  if (items.length === 0 && !recurringEmotion) return null;

  const blockStyle: React.CSSProperties = {
    background: "rgba(111,106,100,0.15)",
    border: "1px solid rgba(240,230,214,0.085)",
    borderRadius: 22,
    padding: "22px 24px",
    boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
  };

  const kickerStyle: React.CSSProperties = {
    fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
    fontSize: 11,
    fontWeight: 400,
    color: "#C97B6A",
    letterSpacing: "0.20em",
    textTransform: "uppercase" as const,
    marginBottom: 12,
  };

  const textStyle: React.CSSProperties = {
    fontFamily: "var(--font-body, 'Cormorant Garamond', serif)",
    fontSize: "1rem",
    fontWeight: 300,
    color: "rgba(240,230,214,0.88)",
    lineHeight: 1.55,
  };

  const listItemStyle: React.CSSProperties = {
    ...textStyle,
    display: "flex",
    gap: 10,
  };

  return (
    <div style={blockStyle}>
      {items.length > 0 && (
        <>
          <p className="font-sans" style={kickerStyle}>
            Ce qui revient souvent
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {items.map((item, i) => (
              <li key={`reflet-${i}`} style={listItemStyle}>
                <span style={{ color: "#C97B6A", flexShrink: 0 }} aria-hidden="true">
                  •
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {recurringEmotion && (
        <div style={{ marginTop: items.length > 0 ? 14 : 0 }}>
          <p className="font-sans" style={kickerStyle}>
            Tu nommes souvent
          </p>
          <p className="font-body" style={textStyle}>
            {recurringEmotion.emotion}
          </p>
        </div>
      )}

      <Link
        href="/app/ce-qui-change"
        className="font-sans"
        style={{
          display: "inline-block",
          marginTop: 16,
          fontSize: 13,
          color: "rgba(240,230,214,0.60)",
          letterSpacing: "0.04em",
          textDecoration: "none",
        }}
      >
        Voir ton reflet ›
      </Link>
    </div>
  );
}
