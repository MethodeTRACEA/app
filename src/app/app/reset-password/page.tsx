"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const { user, updatePassword } = useAuth();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Supabase injecte un token dans l'URL quand l'utilisateur clique sur le lien.
  // Le SDK le traite automatiquement via onAuthStateChange (PASSWORD_RECOVERY event).
  // À ce stade, l'utilisateur a une session temporaire qui permet updateUser().

  // Si déjà connecté normalement (pas via reset), rediriger
  useEffect(() => {
    // Laisser 2s pour que Supabase traite le token de recovery
    const timer = setTimeout(() => {
      // Ne rien faire — on reste sur la page pour le formulaire
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

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

    const { error: err } = await updatePassword(password);
    setSubmitting(false);

    if (err) {
      setError(err);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 md:py-16 text-center">
        <div className="w-16 h-16 bg-sage rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-2xl">✓</span>
        </div>
        <h1 className="font-serif text-xl md:text-2xl text-espresso mb-3">
          Mot de passe mis à jour
        </h1>
        <p className="font-body text-sm md:text-base text-warm-gray leading-relaxed mb-6">
          Ton nouveau mot de passe est actif. Tu peux maintenant utiliser TRACÉA.
        </p>
        <button
          onClick={() => router.push("/app")}
          className="btn-primary !py-4 md:!py-3 !rounded-2xl"
        >
          Accéder à TRACÉA
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10 md:py-16">
      <div className="text-center mb-8">
        <div className="font-serif text-3xl md:text-4xl text-terra mb-2">TRACÉA</div>
        <p className="font-body text-sm md:text-base text-warm-gray italic">
          Choisis ton nouveau mot de passe
        </p>
      </div>

      <div className="card-base">
        <h1 className="font-serif text-xl text-espresso mb-1">
          Nouveau mot de passe
        </h1>
        <p className="text-sm text-warm-gray mb-6">
          Choisis un mot de passe sécurisé d&apos;au moins 6 caractères.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="new-password"
              className="text-xs font-medium tracking-widest uppercase text-warm-gray block mb-2"
            >
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6 caractères minimum"
                required
                minLength={6}
                autoFocus
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
              htmlFor="confirm-password"
              className="text-xs font-medium tracking-widest uppercase text-warm-gray block mb-2"
            >
              Confirmer le mot de passe
            </label>
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Répète ton mot de passe"
              required
              minLength={6}
              className="w-full px-4 py-3.5 md:py-3 bg-beige/50 rounded-xl text-espresso font-sans text-sm border border-beige-dark focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra/20 transition-all placeholder:text-warm-gray/40"
            />
          </div>

          {error && (
            <div className="text-sm text-terra-dark bg-terra-light/50 rounded-xl p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !password || !passwordConfirm}
            className="btn-primary w-full text-center !py-4 md:!py-3 !text-base md:!text-sm !rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Mise à jour..." : "Enregistrer le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}
