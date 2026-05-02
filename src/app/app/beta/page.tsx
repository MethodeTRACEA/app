"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

// ===================================================================
// Page d'activation bêta testeur
// URL : /app/beta
// À partager dans ton groupe WhatsApp.
// ===================================================================

export default function BetaPage() {
  const router = useRouter();
  const { user, session, hasPremiumAccess, isBetaTester, isTrialActive, refreshProfile } = useAuth();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Déjà activé
  if (hasPremiumAccess) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center space-y-4">
        <p className="font-serif text-2xl text-espresso">
          {isBetaTester
            ? "Accès bêta actif."
            : isTrialActive
              ? "Essai Premium en cours."
              : "Accès premium actif."}
        </p>
        <p className="font-body text-warm-gray">
          Tu as déjà accès à toutes les fonctionnalités.
        </p>
        <button
          onClick={() => router.push("/app")}
          className="btn-primary mt-4"
        >
          Retour
        </button>
      </div>
    );
  }

  // Non connecté
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center space-y-4">
        <p className="font-serif text-2xl text-espresso">Connexion requise</p>
        <p className="font-body text-warm-gray">
          Connecte-toi d&apos;abord, puis reviens ici.
        </p>
        <button
          onClick={() => router.push("/app/connexion")}
          className="btn-primary mt-4"
        >
          Se connecter
        </button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/beta/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          res.status === 403
            ? "Ce mot de passe ne correspond pas."
            : data.error || "Une erreur est survenue."
        );
        return;
      }

      // Rafraîchir le profil pour que hasPremiumAccess soit à jour immédiatement
      await refreshProfile();
      setSuccess(true);
    } catch {
      setError("Erreur réseau. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center space-y-4">
        <p className="font-serif text-2xl text-espresso">Accès activé.</p>
        <p className="font-body text-warm-gray">
          Bienvenue dans la bêta. Toutes les fonctionnalités sont disponibles.
        </p>
        <button
          onClick={() => router.push("/app")}
          className="btn-primary mt-4"
        >
          Commencer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="font-serif text-2xl text-espresso mb-2">Accès bêta</h1>
      <p className="font-body text-warm-gray mb-8">
        Entre le mot de passe partagé dans le groupe pour activer l&apos;accès complet.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe bêta"
          autoFocus
          className="w-full px-4 py-3 bg-beige/50 rounded-xl text-espresso font-sans
                     border border-beige-dark focus:border-terra focus:outline-none
                     focus:ring-1 focus:ring-terra/20 transition-all
                     placeholder:text-warm-gray/40"
        />

        {error && (
          <p className="text-sm text-terra-dark">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !password.trim()}
          className="btn-primary w-full disabled:opacity-40"
        >
          {loading ? "Vérification…" : "Activer"}
        </button>
      </form>
    </div>
  );
}
