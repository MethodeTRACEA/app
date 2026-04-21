"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AuthTab = "login" | "signup";
type SuccessView = "check-email-magic" | "check-email-confirm" | "reset-sent" | null;

/* ═══ Design tokens ═══ */
const DS = {
  fond: "#1C1410",
  fondSecondaire: "#251A14",
  surface: "#2E1F17",
  cuivre: "#C9907C",
  terracotta: "#835E54",
  texte: "#F5EFE6",
  texteMuted: "#A89080",
  bordure: "#3D2A22",
  inputBg: "#251A14",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  background: DS.inputBg,
  borderRadius: 12,
  color: DS.texte,
  fontSize: 14,
  border: `1px solid ${DS.bordure}`,
  outline: "none",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: DS.texteMuted,
  marginBottom: 8,
};

const btnPrimary: React.CSSProperties = {
  width: "100%",
  padding: "18px",
  background: DS.cuivre,
  color: DS.fond,
  fontWeight: 600,
  fontSize: 15,
  borderRadius: 40,
  border: "none",
  cursor: "pointer",
  boxShadow: "0 8px 32px rgba(201,144,124,0.18), 0 2px 8px rgba(0,0,0,0.15)",
  transition: "transform 0.2s, box-shadow 0.2s",
};

const linkBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 12,
  color: DS.texteMuted,
  cursor: "pointer",
  transition: "color 0.2s",
  padding: 0,
};

export default function ConnexionPage() {
  const { user, signInWithPassword, signUp, signInWithMagicLink, resetPassword } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<AuthTab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successView, setSuccessView] = useState<SuccessView>(null);
  const [showResetForm, setShowResetForm] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);

  if (user) {
    router.push("/app");
    return null;
  }

  // ── Handlers ──

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    setError(null);
    const { error: err } = await signInWithPassword(email.trim(), password);
    setSubmitting(false);
    if (err) setError(err);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    if (password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }
    if (password !== passwordConfirm) { setError("Les mots de passe ne correspondent pas."); return; }
    setSubmitting(true);
    setError(null);
    const { error: err, needsConfirmation } = await signUp(email.trim(), password);
    setSubmitting(false);
    if (err) setError(err);
    else if (needsConfirmation) setSuccessView("check-email-confirm");
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    const { error: err } = await resetPassword(email.trim());
    setSubmitting(false);
    if (err) setError(err);
    else setSuccessView("reset-sent");
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    const { error: err } = await signInWithMagicLink(email.trim());
    setSubmitting(false);
    if (err) setError(err);
    else setSuccessView("check-email-magic");
  }

  function resetToLogin() {
    setSuccessView(null);
    setShowResetForm(false);
    setShowMagicLink(false);
    setError(null);
    setPassword("");
    setPasswordConfirm("");
    setTab("login");
  }

  // ── Écrans de succès ──

  if (successView === "check-email-magic") {
    return (
      <SuccessScreen
        title="Vérifie ton email"
        message={<>Un lien de connexion a été envoyé à <strong style={{ color: DS.cuivre }}>{email}</strong>. Clique dessus pour accéder à TRACÉA.</>}
        hint="Le lien est valide pendant 1 heure. Vérifie tes spams si tu ne le trouves pas."
        onBack={resetToLogin}
      />
    );
  }

  if (successView === "check-email-confirm") {
    return (
      <SuccessScreen
        title="Confirme ton inscription"
        message={<>Un email de confirmation a été envoyé à <strong style={{ color: DS.cuivre }}>{email}</strong>. Clique sur le lien pour activer ton compte.</>}
        hint="Vérifie tes spams si tu ne trouves pas l'email."
        onBack={resetToLogin}
      />
    );
  }

  if (successView === "reset-sent") {
    return (
      <SuccessScreen
        title="Email envoyé"
        message={<>Un lien de réinitialisation a été envoyé à <strong style={{ color: DS.cuivre }}>{email}</strong>.</>}
        hint="Clique dessus pour choisir un nouveau mot de passe."
        onBack={resetToLogin}
      />
    );
  }

  // ── Formulaire réinitialisation ──

  if (showResetForm) {
    return (
      <PageWrapper>
        <AuthHeader />
        <Card>
          <h1 className="font-body" style={{ fontSize: 20, fontWeight: 500, color: DS.texte, marginBottom: 4 }}>
            Mot de passe oublié
          </h1>
          <p className="font-sans" style={{ fontSize: 13, color: DS.texteMuted, marginBottom: 24 }}>
            Entre ton email pour recevoir un lien de réinitialisation.
          </p>
          <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <EmailField email={email} setEmail={setEmail} />
            {error && <ErrorBox message={error} />}
            <button type="submit" disabled={submitting || !email.trim()} className="font-sans" style={{ ...btnPrimary, opacity: submitting || !email.trim() ? 0.4 : 1 }}>
              {submitting ? "Envoi..." : "Envoyer le lien"}
            </button>
          </form>
          <button onClick={resetToLogin} style={{ ...linkBtn, width: "100%", textAlign: "center", marginTop: 16 }}>
            Retour à la connexion
          </button>
        </Card>
      </PageWrapper>
    );
  }

  // ── Formulaire magic link ──

  if (showMagicLink) {
    return (
      <PageWrapper>
        <AuthHeader />
        <Card>
          <h1 className="font-body" style={{ fontSize: 20, fontWeight: 500, color: DS.texte, marginBottom: 4 }}>
            Connexion par lien magique
          </h1>
          <p className="font-sans" style={{ fontSize: 13, color: DS.texteMuted, marginBottom: 24 }}>
            Reçois un lien de connexion sécurisé par email. Pas de mot de passe nécessaire.
          </p>
          <form onSubmit={handleMagicLink} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <EmailField email={email} setEmail={setEmail} />
            {error && <ErrorBox message={error} />}
            <button type="submit" disabled={submitting || !email.trim()} className="font-sans" style={{ ...btnPrimary, opacity: submitting || !email.trim() ? 0.4 : 1 }}>
              {submitting ? "Envoi..." : "Recevoir le lien de connexion"}
            </button>
          </form>
          <button onClick={resetToLogin} style={{ ...linkBtn, width: "100%", textAlign: "center", marginTop: 16 }}>
            Retour à la connexion
          </button>
        </Card>
      </PageWrapper>
    );
  }

  // ── Formulaire principal ──

  return (
    <PageWrapper>
      <AuthHeader />

      <Card>
        {/* Onglets */}
        <div style={{ display: "flex", borderRadius: 12, background: DS.fondSecondaire, padding: 4, marginBottom: 24 }}>
          <button
            onClick={() => { setTab("login"); setError(null); }}
            className="font-sans"
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.03em",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              background: tab === "login" ? DS.surface : "transparent",
              color: tab === "login" ? DS.texte : DS.texteMuted,
              boxShadow: tab === "login" ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
            }}
          >
            Connexion
          </button>
          <button
            onClick={() => { setTab("signup"); setError(null); }}
            className="font-sans"
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.03em",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              background: tab === "signup" ? DS.surface : "transparent",
              color: tab === "signup" ? DS.texte : DS.texteMuted,
              boxShadow: tab === "signup" ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
            }}
          >
            Inscription
          </button>
        </div>

        {/* ── Connexion ── */}
        {tab === "login" && (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <EmailField email={email} setEmail={setEmail} />

            <div>
              <label htmlFor="password" className="font-sans" style={labelStyle}>Mot de passe</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ton mot de passe"
                  required
                  className="font-sans"
                  style={{ ...inputStyle, paddingRight: 56 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  style={{ ...linkBtn, position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}
                >
                  {showPassword ? "Masquer" : "Voir"}
                </button>
              </div>
            </div>

            {error && <ErrorBox message={error} />}

            <button
              type="submit"
              disabled={submitting || !email.trim() || !password}
              className="font-sans"
              style={{ ...btnPrimary, opacity: submitting || !email.trim() || !password ? 0.4 : 1 }}
            >
              {submitting ? "Connexion..." : "Se connecter"}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4 }}>
              <button type="button" onClick={() => { setShowResetForm(true); setError(null); }} style={linkBtn}>
                Mot de passe oublié ?
              </button>
              <button type="button" onClick={() => { setShowMagicLink(true); setError(null); }} style={linkBtn}>
                Connexion par lien magique
              </button>
            </div>
          </form>
        )}

        {/* ── Inscription ── */}
        {tab === "signup" && (
          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <EmailField email={email} setEmail={setEmail} />

            <div>
              <label htmlFor="signup-password" className="font-sans" style={labelStyle}>Mot de passe</label>
              <div style={{ position: "relative" }}>
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6 caractères minimum"
                  required
                  minLength={6}
                  className="font-sans"
                  style={{ ...inputStyle, paddingRight: 56 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  style={{ ...linkBtn, position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}
                >
                  {showPassword ? "Masquer" : "Voir"}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="signup-password-confirm" className="font-sans" style={labelStyle}>Confirmer le mot de passe</label>
              <input
                id="signup-password-confirm"
                type={showPassword ? "text" : "password"}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Répète ton mot de passe"
                required
                minLength={6}
                className="font-sans"
                style={inputStyle}
              />
            </div>

            {error && <ErrorBox message={error} />}

            <button
              type="submit"
              disabled={submitting || !email.trim() || !password || !passwordConfirm}
              className="font-sans"
              style={{ ...btnPrimary, opacity: submitting || !email.trim() || !password || !passwordConfirm ? 0.4 : 1 }}
            >
              {submitting ? "Inscription..." : "Créer mon compte"}
            </button>

            <p className="font-sans" style={{ fontSize: 12, color: DS.texteMuted, textAlign: "center", paddingTop: 4 }}>
              Tu as déjà un compte ?{" "}
              <button
                type="button"
                onClick={() => { setTab("login"); setError(null); }}
                style={{ ...linkBtn, color: DS.cuivre, textDecoration: "underline" }}
              >
                Connecte-toi
              </button>
            </p>
          </form>
        )}
      </Card>

      <p className="font-sans" style={{ fontSize: 12, color: DS.texteMuted, textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
        En te connectant, tu acceptes nos{" "}
        <Link href="/conditions-utilisation" style={{ color: DS.cuivre, textDecoration: "underline" }}>CGU</Link>
        {" "}et notre{" "}
        <Link href="/politique-confidentialite" style={{ color: DS.cuivre, textDecoration: "underline" }}>Politique de confidentialité</Link>.
      </p>
    </PageWrapper>
  );
}

// ═══════════════════════════════════════════════════
// Composants
// ═══════════════════════════════════════════════════

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100%",
        background: `
          radial-gradient(ellipse 70% 50% at 30% 30%, rgba(201,144,124,0.06) 0%, transparent 65%),
          radial-gradient(ellipse 60% 40% at 70% 70%, rgba(131,94,84,0.04) 0%, transparent 60%),
          ${DS.fond}
        `,
        padding: "48px 16px 64px",
      }}
    >
      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        {children}
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: DS.surface,
        border: "1px solid rgba(61,42,34,0.6)",
        borderRadius: 20,
        padding: "32px 24px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      {children}
    </div>
  );
}

function AuthHeader() {
  return (
    <div style={{ textAlign: "center", marginBottom: 36 }}>
      <img
        src="/images/tracea-logo-terra-sans-filigrane.png"
        alt="TRACEA"
        style={{ height: 48, margin: "0 auto 14px", objectFit: "contain" }}
      />
      <p className="font-sans" style={{ fontSize: 13, color: DS.texteMuted, fontStyle: "italic" }}>
        Stabilité émotionnelle · Entraînement physiologique
      </p>
    </div>
  );
}

function EmailField({ email, setEmail }: { email: string; setEmail: (v: string) => void }) {
  return (
    <div>
      <label htmlFor="email" className="font-sans" style={labelStyle}>Adresse email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ton@email.fr"
        required
        autoComplete="email"
        className="font-sans"
        style={inputStyle}
      />
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      className="font-sans"
      style={{
        fontSize: 13,
        color: "#e8a090",
        background: "rgba(201,144,124,0.1)",
        border: `1px solid rgba(201,144,124,0.2)`,
        borderRadius: 12,
        padding: 12,
      }}
    >
      {message}
    </div>
  );
}

function SuccessScreen({
  title,
  message,
  hint,
  onBack,
}: {
  title: string;
  message: React.ReactNode;
  hint: string;
  onBack: () => void;
}) {
  return (
    <PageWrapper>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 64,
            height: 64,
            background: "rgba(201,144,124,0.15)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <span style={{ color: DS.cuivre, fontSize: 28 }}>&#10003;</span>
        </div>
        <h1 className="font-body" style={{ fontSize: 22, color: DS.texte, marginBottom: 12 }}>
          {title}
        </h1>
        <p className="font-sans" style={{ fontSize: 14, color: DS.texteMuted, lineHeight: 1.6, marginBottom: 24 }}>
          {message}
        </p>
        <p className="font-sans" style={{ fontSize: 12, color: DS.texteMuted }}>
          {hint}
        </p>
        <button
          onClick={onBack}
          className="font-sans"
          style={{
            marginTop: 24,
            padding: "12px 32px",
            background: "transparent",
            border: `1px solid ${DS.bordure}`,
            borderRadius: 40,
            color: DS.texteMuted,
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Retour à la connexion
        </button>
      </div>
    </PageWrapper>
  );
}
