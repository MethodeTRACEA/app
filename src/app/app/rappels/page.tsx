"use client";

// ════════════════════════════════════════════════════════════
// TRACÉA — Chantier 57 « Ancrage contextuel » — Brique 57-3
// Écran d'armement / désarmement des rappels.
// Wordings figés (spec chantier57_0b) : NE RIEN reformuler ci-dessous.
// Aucun gate premium. Aucune écriture hors reminders (table déjà couverte
// par les 2 chemins d'effacement RGPD — 57-1).
// ════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { useAuth } from "@/lib/auth-context";
import {
  getArmedRemindersDb,
  createReminderDb,
  disarmReminderDb,
  type Reminder,
  type ReminderCategorie,
  type ReminderCreneau,
} from "@/lib/supabase-store";
import { subscribeToPush } from "@/lib/push";
import {
  PrimaryButton,
  SecondaryButton,
  ChoiceChip,
  TextCapsuleField,
  ExitLink,
} from "@/components/ui";

type Phase = "liste" | "genre" | "moment" | "confirmation" | "confirme";

const GENRES: {
  value: ReminderCategorie;
  titre: string;
  description: string;
}[] = [
  {
    value: "entrainement",
    titre: "M'entraîner",
    description: "un moment calme pour t'exercer, quand tu veux.",
  },
  {
    value: "moment_sensible",
    titre: "Un moment sensible",
    description: "un moment que tu sais difficile, ponctuel ou qui revient.",
  },
];

const CRENEAUX: { value: ReminderCreneau; label: string }[] = [
  { value: "matin", label: "Matin" },
  { value: "midi", label: "Midi" },
  { value: "soir", label: "Soir" },
];

// ISO 8601 : 1=lundi … 7=dimanche (cf. sql/add_reminders_push_subscriptions.sql)
const JOURS: { iso: number; label: string }[] = [
  { iso: 1, label: "Lun" },
  { iso: 2, label: "Mar" },
  { iso: 3, label: "Mer" },
  { iso: 4, label: "Jeu" },
  { iso: 5, label: "Ven" },
  { iso: 6, label: "Sam" },
  { iso: 7, label: "Dim" },
];

const blockStyle: React.CSSProperties = {
  background: "rgba(111,106,100,0.18)",
  border: "1px solid rgba(240,230,214,0.10)",
  borderRadius: 24,
  padding: "28px 26px",
  boxShadow:
    "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
};

const kickerStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
  fontSize: 12,
  fontWeight: 400,
  color: "#C97B6A",
  letterSpacing: "0.20em",
  textTransform: "uppercase",
  marginBottom: 18,
};

const textStyle: React.CSSProperties = {
  fontFamily: "var(--font-body, 'Cormorant Garamond', serif)",
  fontSize: "1.05rem",
  fontWeight: 300,
  color: "#F0E6D6",
  lineHeight: 1.6,
};

function genreTitre(c: ReminderCategorie) {
  return GENRES.find((g) => g.value === c)?.titre ?? c;
}
function creneauLabel(c: ReminderCreneau) {
  return CRENEAUX.find((x) => x.value === c)?.label ?? c;
}
function joursAffiches(jours: number[]) {
  return JOURS.filter((j) => jours.includes(j.iso))
    .map((j) => j.label)
    .join(", ");
}

export default function RappelsPage() {
  const { user, session, loading: authLoading } = useAuth();

  const [phase, setPhase] = useState<Phase>("liste");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [justRemovedId, setJustRemovedId] = useState<string | null>(null);

  // Formulaire en cours de composition
  const [categorie, setCategorie] = useState<ReminderCategorie | null>(null);
  const [creneau, setCreneau] = useState<ReminderCreneau | null>(null);
  const [jours, setJours] = useState<number[]>([]);
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getArmedRemindersDb(user.id).then((r) => {
      if (!cancelled) {
        setReminders(r);
        setListLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (authLoading || listLoading) {
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
          Connecte-toi pour gérer tes rappels.
        </p>
      </div>
    );
  }

  function resetForm() {
    setCategorie(null);
    setCreneau(null);
    setJours([]);
    setLabel("");
    setSaveError(false);
  }

  function toggleJour(iso: number) {
    setJours((prev) =>
      prev.includes(iso) ? prev.filter((j) => j !== iso) : [...prev, iso]
    );
  }

  async function confirmerRappel() {
    if (!user || !categorie || !creneau || jours.length === 0 || saving) {
      return;
    }
    setSaving(true);
    setSaveError(false);

    const fuseau = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const created = await createReminderDb(user.id, {
      categorie,
      creneau,
      jours,
      label: label.trim() || null,
      fuseau,
    });

    if (!created) {
      setSaving(false);
      setSaveError(true);
      return;
    }

    // Le rappel est sauvegardé dans tous les cas, quel que soit le statut du
    // push (accordée / refusée / indisponible) — jamais bloquant, jamais de
    // message d'erreur ici. subscribeToPush ne lève jamais d'exception, mais
    // on protège quand même l'enchaînement du flux par précaution.
    if (session?.access_token) {
      try {
        await subscribeToPush(session.access_token);
      } catch {
        // Volontairement silencieux : voir commentaire ci-dessus.
      }
    }

    setSaving(false);
    setPhase("confirme");
  }

  async function retirerRappel(id: string) {
    await disarmReminderDb(id);
    setJustRemovedId(id);
    setTimeout(() => {
      setReminders((prev) => prev.filter((r) => r.id !== id));
      setJustRemovedId((cur) => (cur === id ? null : cur));
    }, 1400);
  }

  async function refreshListAndReturn() {
    if (user) {
      const r = await getArmedRemindersDb(user.id);
      setReminders(r);
    }
    resetForm();
    setPhase("liste");
  }

  return (
    <div
      style={{
        minHeight: "calc(100svh - 56px)",
        background:
          "radial-gradient(ellipse at 50% 100%, rgba(184,99,79,0.13) 0%, rgba(184,99,79,0.05) 34%, transparent 66%), " +
          "radial-gradient(ellipse at 15% 0%, rgba(111,106,100,0.16) 0%, transparent 58%), " +
          "#1A120D",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 640,
          margin: "0 auto",
          padding: "48px 20px 64px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* ══════════════ Phase : liste ══════════════ */}
        {phase === "liste" && (
          <>
            <div style={blockStyle}>
              <p className="font-sans" style={kickerStyle}>
                Rappels
              </p>
              <p className="font-body" style={textStyle}>
                Tu peux te poser un rappel, pour un moment que tu connais
                comme sensible, ou juste pour t&apos;entraîner au calme.
                C&apos;est toi qui choisis quand.
              </p>
            </div>

            {reminders.map((r) => (
              <div key={r.id} style={blockStyle}>
                {justRemovedId === r.id ? (
                  <p className="font-body" style={textStyle}>
                    Rappel retiré.
                  </p>
                ) : (
                  <>
                    <p className="font-body" style={textStyle}>
                      {genreTitre(r.categorie)} · {creneauLabel(r.creneau)} ·{" "}
                      {joursAffiches(r.jours)}
                    </p>
                    {r.label && (
                      <p
                        className="font-body"
                        style={{
                          ...textStyle,
                          fontStyle: "italic",
                          opacity: 0.7,
                          marginTop: 6,
                        }}
                      >
                        {r.label}
                      </p>
                    )}
                    <div style={{ marginTop: 16 }}>
                      <SecondaryButton onClick={() => retirerRappel(r.id)}>
                        Retirer ce rappel
                      </SecondaryButton>
                    </div>
                  </>
                )}
              </div>
            ))}

            <PrimaryButton
              onClick={() => {
                resetForm();
                setPhase("genre");
              }}
            >
              {reminders.length === 0
                ? "Poser un rappel"
                : "Poser un nouveau rappel"}
            </PrimaryButton>
          </>
        )}

        {/* ══════════════ Écran 1 : le genre ══════════════ */}
        {phase === "genre" && (
          <>
            <div style={blockStyle}>
              <p className="font-body" style={{ ...textStyle, marginBottom: 20 }}>
                Quel genre de rappel veux-tu poser ?
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {GENRES.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => {
                      setCategorie(g.value);
                      setPhase("moment");
                    }}
                    className="w-full text-left rounded-[18px] px-5 py-4 font-body text-base transition-all duration-200 border bg-t-brume/15 border-[rgba(232,216,199,0.18)] t-text-secondary hover:bg-t-brume/30 hover:border-[rgba(232,216,199,0.30)]"
                  >
                    <span style={{ display: "block", fontWeight: 500 }}>
                      {g.titre}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "0.85rem",
                        opacity: 0.75,
                        marginTop: 4,
                      }}
                    >
                      {g.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <ExitLink label="Retour" onClick={() => setPhase("liste")} />
          </>
        )}

        {/* ══════════════ Écran 2 : le moment ══════════════ */}
        {phase === "moment" && (
          <>
            <div style={blockStyle}>
              <p className="font-body" style={{ ...textStyle, marginBottom: 20 }}>
                Quel moment veux-tu marquer ?
              </p>

              <p
                className="font-sans"
                style={{ ...kickerStyle, fontSize: 11, marginBottom: 10 }}
              >
                Créneau
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
                {CRENEAUX.map((c) => (
                  <ChoiceChip
                    key={c.value}
                    label={c.label}
                    selected={creneau === c.value}
                    onClick={() => setCreneau(c.value)}
                  />
                ))}
              </div>

              <p
                className="font-sans"
                style={{ ...kickerStyle, fontSize: 11, marginBottom: 10 }}
              >
                Jours
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
                {JOURS.map((j) => (
                  <ChoiceChip
                    key={j.iso}
                    label={j.label}
                    selected={jours.includes(j.iso)}
                    onClick={() => toggleJour(j.iso)}
                  />
                ))}
              </div>

              <TextCapsuleField
                value={label}
                onChange={setLabel}
                placeholder="tu peux lui donner un nom, si tu veux"
              />
            </div>

            <PrimaryButton
              disabled={!creneau || jours.length === 0}
              onClick={() => setPhase("confirmation")}
            >
              Continuer
            </PrimaryButton>
            <ExitLink label="Retour" onClick={() => setPhase("genre")} />
          </>
        )}

        {/* ══════════════ Confirmation + permission ══════════════ */}
        {phase === "confirmation" && (
          <>
            <div style={blockStyle}>
              <p className="font-body" style={textStyle}>
                Pour t&apos;envoyer ce rappel, ton téléphone va te demander
                l&apos;autorisation d&apos;afficher une notification. Tu peux
                accepter, ou le garder juste dans l&apos;app.
              </p>
              {saveError && (
                <p
                  className="font-body"
                  style={{ ...textStyle, marginTop: 16, color: "#E8A87C" }}
                >
                  Une erreur est survenue. Réessaie.
                </p>
              )}
            </div>

            <PrimaryButton onClick={confirmerRappel} disabled={saving}>
              Poser ce rappel
            </PrimaryButton>
            <ExitLink label="Retour" onClick={() => setPhase("moment")} />
          </>
        )}

        {/* ══════════════ Confirmation finale ══════════════ */}
        {phase === "confirme" && (
          <>
            <div style={blockStyle}>
              <p className="font-body" style={textStyle}>
                Rappel posé.
              </p>
            </div>
            <PrimaryButton onClick={refreshListAndReturn}>
              Voir tes rappels
            </PrimaryButton>
          </>
        )}
      </div>
    </div>
  );
}
