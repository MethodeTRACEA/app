"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ConnexionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithMagicLink } = useAuth();

  // Already logged in
  if (user) {
    router.push("/");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    setError(null);

    const { error: err } = await signInWithMagicLink(email.trim());
    setSending(false);

    if (err) {
      setError(err);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-sage rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-2xl">✓</span>
        </div>
        <h1 className="font-serif text-2xl text-espresso mb-3">
          Vérifiez votre email
        </h1>
        <p className="font-body text-base text-warm-gray leading-relaxed mb-6">
          Un lien de connexion a été envoyé à{" "}
          <strong className="text-espresso">{email}</strong>. Cliquez dessus
          pour accéder à TRACEA.
        </p>
        <p className="text-xs text-warm-gray">
          Le lien est valide pendant 1 heure. Vérifiez vos spams si vous ne le
          trouvez pas.
        </p>
        <button
          onClick={() => {
            setSent(false);
            setEmail("");
          }}
          className="btn-ghost mt-6"
        >
          Utiliser une autre adresse
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="font-serif text-4xl text-terra mb-2">TRACEA</div>
        <p className="font-body text-base text-warm-gray italic">
          Stabilité émotionnelle · Entraînement physiologique
        </p>
      </div>

      <div className="card-base">
        <h1 className="font-serif text-xl text-espresso mb-1">Connexion</h1>
        <p className="text-sm text-warm-gray mb-6">
          Entrez votre email pour recevoir un lien de connexion sécurisé. Pas de
          mot de passe nécessaire.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="vous@exemple.fr"
              required
              className="w-full px-4 py-3 bg-beige/50 rounded-xl text-espresso font-sans text-sm border border-beige-dark focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra/20 transition-all placeholder:text-warm-gray/40"
            />
          </div>

          {error && (
            <div className="text-sm text-terra-dark bg-terra-light/50 rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={sending || !email.trim()}
            className="btn-primary w-full text-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? "Envoi en cours..." : "Recevoir le lien de connexion"}
          </button>
        </form>
      </div>

      <p className="text-xs text-warm-gray text-center mt-6 leading-relaxed">
        En vous connectant, vous acceptez nos{" "}
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
