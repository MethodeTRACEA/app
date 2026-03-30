"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AuthTab = "login" | "signup";
type SuccessView = "check-email-magic" | "check-email-confirm" | "reset-sent" | null;

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

  // Déjà connecté → rediriger
  if (user) {
    router.push("/");
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

    if (err) {
      setError(err);
    }
    // Si pas d'erreur, onAuthStateChange redirigera via le contexte
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: err, needsConfirmation } = await signUp(email.trim(), password);
    setSubmitting(false);

    if (err) {
      setError(err);
    } else if (needsConfirmation) {
      setSuccessView("check-email-confirm");
    }
    // Si pas de confirmation requise, connecté directement
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setError(null);

    const { error: err } = await resetPassword(email.trim());
    setSubmitting(false);

    if (err) {
      setError(err);
    } else {
      setSuccessView("reset-sent");
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setError(null);

    const { error: err } = await signInWithMagicLink(email.trim());
    setSubmitting(false);

    if (err) {
      setError(err);
    } else {
      setSuccessView("check-email-magic");
    }
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
        message={<>Un lien de connexion a été envoyé à <strong className="text-espresso">{email}</strong>. Clique dessus pour accéder à TRACÉA.</>}
        hint="Le lien est valide pendant 1 heure. Vérifie tes spams si tu ne le trouves pas."
        onBack={resetToLogin}
      />
    );
  }

  if (successView === "check-email-confirm") {
    return (
      <SuccessScreen
        title="Confirme ton inscription"
        message={<>Un email de confirmation a été envoyé à <strong className="text-espresso">{email}</strong>. Clique sur le lien pour activer ton compte.</>}
        hint="Vérifie tes spams si tu ne trouves pas l'email."
        onBack={resetToLogin}
      />
    );
  }

  if (successView === "reset-sent") {
    return (
      <SuccessScreen
        title="Email envoyé"
        message={<>Un lien de réinitialisation a été envoyé à <strong className="text-espresso">{email}</strong>.</>}
        hint="Clique dessus pour choisir un nouveau mot de passe."
        onBack={resetToLogin}
      />
    );
  }

  // ── Formulaire de réinitialisation de mot de passe ──

  if (showResetForm) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 md:py-16">
        <AuthHeader />

        <div className="card-base">
          <h1 className="font-serif text-xl text-espresso mb-1">Mot de passe oublié</h1>
          <p className="text-sm text-warm-gray mb-6">
            Entre ton email pour recevoir un lien de réinitialisation.
          </p>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <EmailField email={email} setEmail={setEmail} />

            {error && <ErrorBox message={error} />}

            <button
              type="submit"
              disabled={submitting || !email.trim()}
              className="btn-primary w-full text-center !py-4 md:!py-3 !rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Envoi..." : "Envoyer le lien"}
            </button>
          </form>

          <button
            onClick={resetToLogin}
            className="w-full text-sm text-warm-gray hover:text-terra transition-colors mt-4 text-center"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  // ── Formulaire magic link ──

  if (showMagicLink) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 md:py-16">
        <AuthHeader />

        <div className="card-base">
          <h1 className="font-serif text-xl text-espresso mb-1">Connexion par lien magique</h1>
          <p className="text-sm text-warm-gray mb-6">
            Reçois un lien de connexion sécurisé par email. Pas de mot de passe nécessaire.
          </p>

          <form onSubmit={handleMagicLink} className="space-y-4">
            <EmailField email={email} setEmail={setEmail} />

            {error && <ErrorBox message={error} />}

            <button
              type="submit"
              disabled={submitting || !email.trim()}
              className="btn-primary w-full text-center !py-4 md:!py-3 !rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Envoi..." : "Recevoir le lien de connexion"}
            </button>
          </form>

          <button
            onClick={resetToLogin}
            className="w-full text-sm text-warm-gray hover:text-terra transition-colors mt-4 text-center"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  // ── Formulaire principal : onglets Connexion / Inscription ──

  return (
    <div className="max-w-md mx-auto px-4 py-10 md:py-16">
      <AuthHeader />

      <div className="card-base">
        {/* Onglets */}
        <div className="flex rounded-xl bg-beige/60 p-1 mb-6">
          <button
            onClick={() => { setTab("login"); setError(null); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all ${
              tab === "login"
                ? "bg-white text-espresso shadow-sm"
                : "text-warm-gray hover:text-espresso"
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => { setTab("signup"); setError(null); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all ${
              tab === "signup"
                ? "bg-white text-espresso shadow-sm"
                : "text-warm-gray hover:text-espresso"
            }`}
          >
            Inscription
          </button>
        </div>

        {/* ── Connexion ── */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <EmailField email={email} setEmail={setEmail} />

            <div>
              <label
                htmlFor="password"
                className="text-xs font-medium tracking-widest uppercase text-warm-gray block mb-2"
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ton mot de passe"
                  required
                  className="w-full px-4 py-3.5 md:py-3 bg-beige/50 rounded-xl text-espresso font-sans text-sm border border-beige-dark focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra/20 transition-all placeholder:text-warm-gray/40 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray hover:text-terra transition-colors text-xs"
                  tabIndex={-1}
                >
                  {showPassword ? "Masquer" : "Voir"}
                </button>
              </div>
            </div>

            {error && <ErrorBox message={error} />}

            <button
              type="submit"
              disabled={submitting || !email.trim() || !password}
              className="btn-primary w-full text-center !py-4 md:!py-3 !text-base md:!text-sm !rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Connexion..." : "Se connecter"}
            </button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => { setShowResetForm(true); setError(null); }}
                className="text-xs text-warm-gray hover:text-terra transition-colors"
              >
                Mot de passe oublié ?
              </button>
              <button
                type="button"
                onClick={() => { setShowMagicLink(true); setError(null); }}
                className="text-xs text-warm-gray hover:text-terra transition-colors"
              >
                Connexion par lien magique
              </button>
            </div>
          </form>
        )}

        {/* ── Inscription ── */}
        {tab === "signup" && (
          <form onSubmit={handleSignup} className="space-y-4">
            <EmailField email={email} setEmail={setEmail} />

            <div>
              <label
                htmlFor="signup-password"
                className="text-xs font-medium tracking-widest uppercase text-warm-gray block mb-2"
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6 caractères minimum"
                  required
                  minLength={6}
                  className="w-full px-4 py-3.5 md:py-3 bg-beige/50 rounded-xl text-espresso font-sans text-sm border border-beige-dark focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra/20 transition-all placeholder:text-warm-gray/40 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray hover:text-terra transition-colors text-xs"
                  tabIndex={-1}
                >
                  {showPassword ? "Masquer" : "Voir"}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-password-confirm"
                className="text-xs font-medium tracking-widest uppercase text-warm-gray block mb-2"
              >
                Confirmer le mot de passe
              </label>
              <input
                id="signup-password-confirm"
                type={showPassword ? "text" : "password"}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Répète ton mot de passe"
                required
                minLength={6}
                className="w-full px-4 py-3.5 md:py-3 bg-beige/50 rounded-xl text-espresso font-sans text-sm border border-beige-dark focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra/20 transition-all placeholder:text-warm-gray/40"
              />
            </div>

            {error && <ErrorBox message={error} />}

            <button
              type="submit"
              disabled={submitting || !email.trim() || !password || !passwordConfirm}
              className="btn-primary w-full text-center !py-4 md:!py-3 !text-base md:!text-sm !rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Inscription..." : "Créer mon compte"}
            </button>

            <p className="text-xs text-warm-gray text-center pt-1">
              Tu as déjà un compte ?{" "}
              <button
                type="button"
                onClick={() => { setTab("login"); setError(null); }}
                className="text-terra hover:text-terra-dark underline"
              >
                Connecte-toi
              </button>
            </p>
          </form>
        )}
      </div>

      <p className="text-xs text-warm-gray text-center mt-6 leading-relaxed">
        En te connectant, tu acceptes nos{" "}
        <Link
          href="/conditions-utilisation"
          className="text-terra hover:text-terra-dark underline"
        >
          CGU
        </Link>{" "}
        et notre{" "}
        <Link
          href="/politique-confidentialite"
          className="text-terra hover:text-terra-dark underline"
        >
          Politique de confidentialité
        </Link>
        .
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// Composants réutilisables
// ═══════════════════════════════════════════════════

function AuthHeader() {
  return (
    <div className="text-center mb-8">
      <div className="font-serif text-3xl md:text-4xl text-terra mb-2">TRACÉA</div>
      <p className="font-body text-sm md:text-base text-warm-gray italic">
        Stabilité émotionnelle · Entraînement physiologique
      </p>
    </div>
  );
}

function EmailField({ email, setEmail }: { email: string; setEmail: (v: string) => void }) {
  return (
    <div>
      <label
        htmlFor="email"
        className="text-xs font-medium tracking-widest uppercase text-warm-gray block mb-2"
      >
        Adresse email
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ton@email.fr"
        required
        autoComplete="email"
        className="w-full px-4 py-3.5 md:py-3 bg-beige/50 rounded-xl text-espresso font-sans text-sm border border-beige-dark focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra/20 transition-all placeholder:text-warm-gray/40"
      />
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="text-sm text-terra-dark bg-terra-light/50 rounded-xl p-3">
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
    <div className="max-w-md mx-auto px-4 py-10 md:py-16 text-center">
      <div className="w-16 h-16 bg-sage rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-white text-2xl">✓</span>
      </div>
      <h1 className="font-serif text-xl md:text-2xl text-espresso mb-3">
        {title}
      </h1>
      <p className="font-body text-sm md:text-base text-warm-gray leading-relaxed mb-6">
        {message}
      </p>
      <p className="text-xs text-warm-gray">{hint}</p>
      <button onClick={onBack} className="btn-ghost mt-6 !rounded-2xl">
        Retour à la connexion
      </button>
    </div>
  );
}
