"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  getProfileDb,
  updateProfileDb,
  getUserStatsDb,
  exportUserData,
  deleteAccount,
} from "@/lib/supabase-store";
import { getConsent } from "@/lib/consent";
import { logConsent } from "@/lib/supabase-store";
import { RevokeConsentButton } from "@/components/ConsentGate";
import {
  getMemoryProfileClient,
  deleteMemoryData,
  type MemoryProfile,
} from "@/lib/memory";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// ── Styles V3 partagés dans ce fichier ───────────────────────────
const blockStyle: React.CSSProperties = {
  background: "rgba(111,106,100,0.18)",
  border: "1px solid rgba(240,230,214,0.10)",
  borderRadius: 24,
  padding: "28px 26px",
  boxShadow: "0 22px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
};

const kickerStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
  fontSize: 12,
  fontWeight: 400,
  color: "#C97B6A",
  letterSpacing: "0.20em",
  textTransform: "uppercase" as const,
  marginBottom: 18,
  textAlign: "center" as const,
};

const blockTextStyle: React.CSSProperties = {
  fontFamily: "var(--font-body, 'Cormorant Garamond', serif)",
  fontSize: "1.05rem",
  fontWeight: 300,
  color: "#F0E6D6",
  lineHeight: 1.6,
};

export default function ProfilPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    avgRecovery: 0,
    topEmotions: [] as string[],
    lastWeekCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([getProfileDb(user.id), getUserStatsDb(user.id)]).then(
      ([profile, s]) => {
        setDisplayName(profile?.display_name ?? "");
        setNameInput(profile?.display_name ?? "");
        setStats(s);
        setLoading(false);
      }
    );
  }, [user]);

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
        <Link href="/app/connexion" className="btn-primary inline-block">
          Se connecter
        </Link>
      </div>
    );
  }

  async function handleSaveName() {
    if (!user) return;
    await updateProfileDb(user.id, { display_name: nameInput.trim() });
    setDisplayName(nameInput.trim());
    setEditingName(false);
  }

  async function handleExport() {
    if (!user) return;
    const data = await exportUserData(user.id);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tracea-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDeleteAccount() {
    if (!user) return;
    if (
      !confirm(
        "Supprimer définitivement ton compte et toutes tes données ? Cette action est irréversible."
      )
    )
      return;
    if (!confirm("Es-tu vraiment sûr(e) ? Toutes tes sessions seront perdues."))
      return;

    await deleteAccount(user.id);
    await signOut();
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
      {/* Halo V3 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background: "radial-gradient(circle at 50% 32%, rgba(201,123,106,0.22) 0%, rgba(201,123,106,0.12) 25%, rgba(26,18,13,0.85) 55%, rgba(26,18,13,1) 75%)",
        }}
      />

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
        {/* ── Identité ── */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: "50%",
              background: "#B8634F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
              boxShadow: "0 8px 28px rgba(184,99,79,0.30)",
            }}
          >
            <span
              className="font-body"
              style={{ fontSize: 42, color: "#F0E6D6", lineHeight: 1 }}
            >
              {displayName ? displayName[0].toUpperCase() : "T"}
            </span>
          </div>

          <h1
            className="font-body"
            style={{
              fontSize: "clamp(1.75rem, 5vw, 2.25rem)",
              fontWeight: 300,
              color: "#F0E6D6",
              lineHeight: 1.1,
              marginBottom: 10,
            }}
          >
            {displayName || "Ton espace"}
          </h1>

          <p
            className="font-sans"
            style={{ fontSize: 14, color: "rgba(240,230,214,0.44)", marginBottom: 8 }}
          >
            {user.email}
          </p>

          {!editingName ? (
            <button
              onClick={() => setEditingName(true)}
              className="font-sans"
              style={{
                fontSize: 14,
                color: "#C97B6A",
                textDecoration: "underline",
                textUnderlineOffset: 3,
                cursor: "pointer",
              }}
            >
              Modifier le pr&eacute;nom
            </button>
          ) : (
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                marginTop: 12,
                maxWidth: 320,
                margin: "12px auto 0",
              }}
            >
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ton prénom"
                className="font-sans"
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  background: "rgba(111,106,100,0.22)",
                  border: "1px solid rgba(240,230,214,0.14)",
                  borderRadius: 12,
                  color: "#F0E6D6",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              />
              <button
                onClick={handleSaveName}
                className="font-sans"
                style={{
                  padding: "10px 18px",
                  background: "#C97B6A",
                  color: "#1A120D",
                  borderRadius: 12,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                OK
              </button>
              <button
                onClick={() => { setEditingName(false); setNameInput(displayName); }}
                className="font-sans"
                style={{ fontSize: "0.85rem", color: "rgba(240,230,214,0.45)", padding: "0 8px", cursor: "pointer" }}
              >
                Annuler
              </button>
            </div>
          )}
        </div>

        {/* ── Mon espace ── */}
        <div style={blockStyle}>
          <p className="font-sans" style={kickerStyle}>Mon espace</p>
          <p className="font-body" style={{ ...blockTextStyle, textAlign: "center", whiteSpace: "pre-line" }}>
            {stats.total >= 3
              ? "Tu es déjà revenu ici plusieurs fois.\n\nEt quelque chose en toi commence à bouger."
              : "Ton espace TRACÉA se construit au fil de tes traversées."}
          </p>
        </div>

        {/* ── Mémoire TRACÉA ── */}
        <MemoryProfileSection
          userId={user.id}
          topEmotions={stats.topEmotions}
          totalSessions={stats.total}
          lastWeekCount={stats.lastWeekCount}
        />

        {/* ── Consentement RGPD ── */}
        <ConsentSection userId={user.id} />

        {/* ── Tes droits RGPD ── */}
        <div style={blockStyle}>
          <p className="font-sans" style={kickerStyle}>Tes droits RGPD</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <button
              onClick={handleExport}
              className="font-sans"
              style={{
                width: "100%",
                padding: "16px 22px",
                border: "1px solid #C97B6A",
                borderRadius: 999,
                color: "#C97B6A",
                fontSize: 15,
                fontWeight: 400,
                lineHeight: 1.35,
                textAlign: "center",
                cursor: "pointer",
                background: "transparent",
              }}
            >
              Exporter mes donn&eacute;es (portabilit&eacute;)
            </button>
            <button
              onClick={handleDeleteAccount}
              className="font-sans"
              style={{
                width: "100%",
                textAlign: "center",
                fontSize: 14,
                color: "rgba(240,230,214,0.62)",
                textDecoration: "underline",
                textUnderlineOffset: 3,
                padding: "8px 0",
                cursor: "pointer",
              }}
            >
              Supprimer mon compte et toutes mes donn&eacute;es
            </button>
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <div style={blockStyle}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div
              style={{
                width: 11,
                height: 11,
                borderRadius: "50%",
                background: "#C97B6A",
                marginTop: 6,
                flexShrink: 0,
              }}
            />
            <p className="font-body" style={blockTextStyle}>
              TRACEA est un outil d&apos;exploration &eacute;motionnelle structur&eacute;e. Il ne
              remplace pas un suivi psychologique ou th&eacute;rapeutique.
            </p>
          </div>
        </div>

        {/* ── Déconnexion ── */}
        <button
          onClick={signOut}
          className="font-sans"
          style={{
            width: "100%",
            padding: "17px 26px",
            background: "#F0E6D6",
            color: "rgba(184,99,79,0.68)",
            borderRadius: 999,
            fontSize: 16,
            fontWeight: 500,
            textAlign: "center",
            cursor: "pointer",
            marginTop: 8,
          }}
        >
          Se d&eacute;connecter
        </button>
      </div>
    </div>
  );
}

// ===================================================================
// SECTION MÉMOIRE
// ===================================================================

function MemoryProfileSection({
  userId,
  topEmotions,
  totalSessions,
  lastWeekCount,
}: {
  userId: string;
  topEmotions: string[];
  totalSessions: number;
  lastWeekCount: number;
}) {
  const [memoryProfile, setMemoryProfile] = useState<MemoryProfile | null>(null);
  const [memoryLoading, setMemoryLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    getMemoryProfileClient(supabase, userId).then((profile) => {
      setMemoryProfile(profile);
      setMemoryLoading(false);
    });
  }, [userId]);

  async function handleDeleteMemory() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    await deleteMemoryData(supabase, userId);
    setMemoryProfile(null);
    setDeleteConfirm(false);
    setDeleteSuccess(true);
    setTimeout(() => setDeleteSuccess(false), 4000);
  }

  if (memoryLoading) return null;

  const hasMemory = memoryProfile && memoryProfile.total_sessions > 0;

  function normalizeAction(raw: string): string | null {
    const v = raw.toLowerCase();
    if (v.includes("respir")) return "Respirer lentement";
    if (v.includes("corps") || v.includes("appui") || v.includes("ancr")) return "Revenir au corps";
    if (v.includes("regard") || v.includes("pose")) return "Se poser un moment";
    return null;
  }

  const effectiveActions = Array.from(
    new Set(
      (memoryProfile?.effective_actions ?? [])
        .map(normalizeAction)
        .filter((a): a is string => a !== null)
    )
  ).slice(0, 3);

  // Continuité — 1 phrase comportementale (conservatrice)
  const topAction = effectiveActions[0] ?? null;
  function continuitePhraseProfile(): string | null {
    if (totalSessions < 3) return null;
    if (topAction === "Revenir au corps") return "Tu passes par le corps plus souvent.";
    if (effectiveActions.length > 1 && totalSessions >= 5) return "Tu trouves peu à peu ce qui t'apaise.";
    if (lastWeekCount >= 2) return "Tu prends un moment avant de réagir.";
    return "Tu reviens ici quand ça monte.";
  }
  const continuite = continuitePhraseProfile();

  return (
    <div>
      {/* Suppression mémoire RGPD */}
      {hasMemory && (
        <div style={{ textAlign: "center" }}>
          {deleteSuccess ? (
            <p
              className="font-body"
              style={{ fontSize: "0.9rem", color: "#8A9E7A", fontStyle: "italic" }}
            >
              Ta m&eacute;moire TRACEA a &eacute;t&eacute; effac&eacute;e. Tes sessions restent dans ton historique.
            </p>
          ) : deleteConfirm ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p className="font-sans" style={{ fontSize: "0.9rem", color: "rgba(240,230,214,0.70)" }}>
                Es-tu s&ucirc;r(e)&nbsp;? Cette action supprime tout l&apos;historique de tes patterns.
                Tes sessions restent dans ton historique.
              </p>
              <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                <button
                  onClick={handleDeleteMemory}
                  className="font-sans"
                  style={{ fontSize: "0.9rem", color: "#C97B6A", textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}
                >
                  Confirmer la suppression
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="font-sans"
                  style={{ fontSize: "0.9rem", color: "rgba(240,230,214,0.45)", cursor: "pointer" }}
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleDeleteMemory}
              className="font-sans"
              style={{
                fontSize: 12,
                color: "rgba(240,230,214,0.45)",
                textDecoration: "underline",
                textUnderlineOffset: 3,
                cursor: "pointer",
              }}
            >
              Effacer ma m&eacute;moire TRACEA
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ConsentSection({ userId }: { userId: string }) {
  const [consent, setConsent] = useState<ReturnType<typeof getConsent>>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsent(getConsent());
  }, []);

  if (!mounted) return null;

  return (
    <div style={blockStyle}>
      <p className="font-sans" style={kickerStyle}>Consentement RGPD</p>
      {consent ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8A9E7A", flexShrink: 0 }} />
            <span className="font-sans" style={{ fontSize: 14, color: "#F0E6D6" }}>Consentement donn&eacute;</span>
          </div>
          <p className="font-sans" style={{ fontSize: 12, color: "rgba(240,230,214,0.50)", textAlign: "center" }}>
            Le{" "}
            {new Date(consent.date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" · "}Version {consent.version}
          </p>
          <div
            style={{
              background: "rgba(111,106,100,0.20)",
              border: "1px solid rgba(240,230,214,0.07)",
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <p className="font-sans" style={{ fontSize: 12, color: "rgba(240,230,214,0.65)" }}>✓ Traitement des donn&eacute;es personnelles</p>
            <p className="font-sans" style={{ fontSize: 12, color: "rgba(240,230,214,0.65)" }}>✓ Traitement des donn&eacute;es &eacute;motionnelles sensibles (art. 9 RGPD)</p>
            <p className="font-sans" style={{ fontSize: 12, color: "rgba(240,230,214,0.65)" }}>✓ Stockage des donn&eacute;es</p>
          </div>
          <div style={{ paddingTop: 8, borderTop: "1px solid rgba(240,230,214,0.07)" }}>
            <RevokeConsentButton />
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(240,230,214,0.30)", flexShrink: 0 }} />
            <span className="font-sans" style={{ fontSize: 14, color: "rgba(240,230,214,0.60)" }}>Aucun consentement enregistr&eacute;</span>
          </div>
          <p className="font-sans" style={{ fontSize: 12, color: "rgba(240,230,214,0.40)" }}>
            Ton consentement sera demand&eacute; lors de ta premi&egrave;re session.
          </p>
        </div>
      )}
    </div>
  );
}
