"use client";

// ===================================================================
// /app/ecrits — « Tes écrits » : relecture du journal (action_traces).
//
// - Accessible à TOUTE utilisatrice connectée (pas de gate premium :
//   c'est sa donnée, en lecture conservée).
// - Lit UNIQUEMENT ses action_traces kind='write' avec content non vide,
//   triées created_at desc, via le client browser (RLS owner).
// - Affichage PUREMENT mécanique : le content est rendu VERBATIM depuis
//   la base. Jamais passé à un LLM ni à aucune API. Aucune analyse.
// - Suppression par entrée : delete RLS owner de CETTE ligne (distinct
//   du global « Effacer ma mémoire »).
// ===================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

type Ecrit = {
  id: string;
  created_at: string;
  besoin: string | null;
  content: string;
};

function formatDateFr(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function EcritsPage() {
  const { user, loading: authLoading } = useAuth();
  const [ecrits, setEcrits] = useState<Ecrit[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("action_traces")
        .select("id, created_at, besoin, content")
        .eq("user_id", userId)
        .eq("kind", "write")
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (error) {
        Sentry.captureException(new Error(error.message), {
          tags: { feature: "ecrits_list" },
        });
        setLoading(false);
        return;
      }

      const rows = ((data ?? []) as Ecrit[]).filter(
        (r) => typeof r.content === "string" && r.content.trim().length > 0
      );
      setEcrits(rows);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleDelete(id: string) {
    const { error } = await supabase
      .from("action_traces")
      .delete()
      .eq("id", id);
    if (error) {
      Sentry.captureException(new Error(error.message), {
        tags: { feature: "ecrits_delete" },
      });
      return;
    }
    setEcrits((prev) => prev.filter((e) => e.id !== id));
    setConfirmId(null);
  }

  if (authLoading || loading) {
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
          Connecte-toi pour retrouver tes écrits.
        </p>
        <Link href="/app/connexion" className="btn-primary inline-block">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "calc(100svh - 56px)",
        background:
          "radial-gradient(ellipse at 50% 100%, rgba(184,99,79,0.13) 0%, rgba(184,99,79,0.05) 34%, transparent 66%), " +
          "radial-gradient(ellipse at 15% 0%, rgba(111,106,100,0.16) 0%, transparent 58%), " +
          "#1A120D",
      }}
    >
      <div className="max-w-[640px] mx-auto px-5 pt-12 pb-16 flex flex-col gap-6">
        <h1
          className="font-body"
          style={{
            fontSize: "clamp(1.75rem, 5vw, 2.25rem)",
            fontWeight: 300,
            color: "#F0E6D6",
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
          }}
        >
          Tes écrits
        </h1>

        {ecrits.length === 0 ? (
          <p
            className="font-body"
            style={{
              fontSize: "1rem",
              fontWeight: 300,
              color: "rgba(240,230,214,0.60)",
              lineHeight: 1.5,
            }}
          >
            Rien ici pour l&apos;instant. Quand tu écris pour poser une action,
            ça reste là.
          </p>
        ) : (
          ecrits.map((e) => (
            <article
              key={e.id}
              style={{
                background: "rgba(111,106,100,0.15)",
                border: "1px solid rgba(240,230,214,0.085)",
                borderRadius: 24,
                padding: "24px 22px",
              }}
            >
              <p className="font-inter text-xs t-text-ghost mb-3">
                {e.besoin
                  ? `Le ${formatDateFr(e.created_at)} — pour ${e.besoin}, tu avais écrit :`
                  : `Le ${formatDateFr(e.created_at)}, tu avais écrit :`}
              </p>

              <p
                className="font-body whitespace-pre-line"
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 300,
                  color: "#F0E6D6",
                  lineHeight: 1.6,
                }}
              >
                {e.content}
              </p>

              <div className="mt-4 text-right">
                {confirmId === e.id ? (
                  <div className="flex items-center justify-end gap-4">
                    <span className="font-inter text-xs t-text-ghost">
                      Supprimer cet écrit ?
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(e.id)}
                      className="font-inter text-xs"
                      style={{
                        color: "#C97B6A",
                        textDecoration: "underline",
                        textUnderlineOffset: 3,
                      }}
                    >
                      Supprimer
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      className="font-inter text-xs"
                      style={{ color: "rgba(240,230,214,0.45)" }}
                    >
                      Garder
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(e.id)}
                    className="font-inter text-xs t-text-ghost hover:t-text-secondary transition-colors"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
