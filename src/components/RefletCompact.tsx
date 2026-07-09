"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getCompletedSessionsDb } from "@/lib/supabase-store";
import {
  getMemoryProfileClient,
  getRecurringEmotions,
  type MemoryProfile,
} from "@/lib/memory";
import { supabase } from "@/lib/supabase";
import { ReflectRecurrent } from "@/components/ReflectRecurrent";

// Composant en lecture seule.
// Réutilise les mêmes sources de données que /app/ce-qui-change (Bloc 1
// "Ce qui revient souvent" + "Tu nommes souvent"). Aucun nouveau calcul.
// N'affiche rien tant qu'il n'y a pas au moins 3 traversées et au moins
// un élément récurrent à montrer. Rendu délégué à ReflectRecurrent
// (mode "compact") — composant partagé avec /app/ce-qui-change (Chantier 58, P1).

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

  return (
    <ReflectRecurrent mode="compact" items={items} recurringEmotion={recurringEmotion} />
  );
}
