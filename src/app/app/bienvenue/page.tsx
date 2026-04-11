"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { updateProfileDb } from "@/lib/supabase-store";

const steps = [
  { letter: "T", name: "Traverser", desc: "Accueillir la vague émotionnelle sans la fuir", color: "bg-terra text-cream" },
  { letter: "R", name: "Reconnaître", desc: "Nommer ce qui se passe en toi", color: "bg-terra/80 text-cream" },
  { letter: "A", name: "Ancrer", desc: "Revenir dans le corps par la respiration", color: "bg-sage text-cream" },
  { letter: "C", name: "Écouter", desc: "Comprendre le message de l'émotion", color: "bg-espresso/80 text-cream" },
  { letter: "É", name: "Émerger", desc: "Laisser venir une nouvelle compréhension", color: "bg-dusty text-cream" },
  { letter: "A", name: "Aligner", desc: "Choisir un geste aligné avec ta vérité", color: "bg-terra-dark text-cream" },
];

export default function BienvenuePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [prenom, setPrenom] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/app/connexion");
      return;
    }
    setReady(true);
  }, [user, authLoading, router]);

  async function handleStart(withName: boolean) {
    if (!user) return;
    setSaving(true);

    try {
      if (withName && prenom.trim()) {
        await updateProfileDb(user.id, { display_name: prenom.trim() });
      }
    } catch {
      // Ne pas bloquer l'onboarding si la sauvegarde échoue
    }

    localStorage.setItem("tracea_onboarding_done", "true");
    router.push("/app/session");
  }

  if (authLoading || !ready) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="font-serif text-2xl text-terra animate-pulse-gentle">
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Warm welcome */}
        <div className="text-center mb-10 animate-reveal animate-reveal-delay-1">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-terra-light mb-6">
            <span className="font-serif text-4xl text-terra">T</span>
          </div>
          <h1 className="font-serif text-4xl text-espresso mb-4 leading-tight">
            Bienvenue dans TRACÉA
          </h1>
          <p className="font-body text-lg text-warm-gray leading-relaxed max-w-lg mx-auto">
            Tu n&apos;as pas besoin d&apos;aller bien pour entrer ici. Tu peux arriver comme tu es — avec ce qui pèse, ce qui confuse, ce qui ne trouve pas encore de mots. TRACÉA est un espace pour traverser ce que tu ressens, pas pour le corriger.
          </p>
        </div>

        {/* Comment arrives-tu */}
        <div className="card-base mb-8 p-6 animate-reveal animate-reveal-delay-2">
          <p className="font-serif text-lg text-espresso mb-2">
            Comment arrives-tu là aujourd&apos;hui ?
          </p>
          <p className="font-body text-sm text-warm-gray leading-relaxed mb-4">
            Quelques mots, ou rien. C&apos;est juste pour toi — pour poser ce que tu portes avant d&apos;entrer.
          </p>
          <textarea
            placeholder="Je me sens... / Ce qui m'amène ici c'est... / Je ne sais pas encore..."
            className="w-full px-4 py-3 bg-beige/50 rounded-xl text-espresso font-sans text-base border border-beige-dark focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra/20 transition-all placeholder:text-warm-gray/40 resize-none"
            rows={3}
          />
        </div>

        {/* 6 steps visual */}
        <div className="card-base mb-8 p-6 animate-reveal animate-reveal-delay-3">
          <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-5 text-center">
            Les 6 étapes du protocole
          </p>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div
                key={i}
                className="flex items-center gap-4"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-serif text-lg flex-shrink-0 ${step.color}`}
                >
                  {step.letter}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-lg text-espresso">
                      {step.name}
                    </span>
                    <span className="text-xs text-warm-gray hidden sm:inline">
                      ·
                    </span>
                    <span className="text-sm text-warm-gray font-body hidden sm:inline">
                      {step.desc}
                    </span>
                  </div>
                  <span className="text-xs text-warm-gray font-body sm:hidden">
                    {step.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gentle disclaimer */}
        <div className="rounded-[18px] border border-terra/15 bg-terra-light/20 px-6 py-5 mb-8 animate-reveal animate-reveal-delay-4">
          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-terra flex-shrink-0 mt-1.5" />
            <p className="font-body text-sm text-espresso/80 leading-relaxed">
              TRACÉA est un outil d&apos;entraînement à la stabilité émotionnelle.
              Il ne remplace en aucun cas un suivi psychologique, psychiatrique ou
              thérapeutique. Si tu traverses une crise, appelle le{" "}
              <span className="font-medium text-terra">3114</span> (numéro national
              de prévention du suicide, 24h/24).
            </p>
          </div>
        </div>

        {/* Prénom — optionnel */}
        <div className="card-base mb-8 p-6 animate-reveal animate-reveal-delay-5">
          <p className="font-serif text-lg text-espresso mb-2">
            Comment souhaites-tu être appelé(e) ?
          </p>
          <p className="font-body text-sm text-warm-gray leading-relaxed mb-5">
            Un prénom, un surnom, un mot qui te représente. Ce que tu veux.
            C&apos;est juste pour que l&apos;espace te ressemble un peu plus.
            Rien d&apos;obligatoire.
          </p>
          <input
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            placeholder="Ton prénom ou un nom qui t'appartient..."
            className="w-full px-4 py-3 bg-beige/50 rounded-xl text-espresso font-sans text-base border border-beige-dark focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra/20 transition-all placeholder:text-warm-gray/40"
            onKeyDown={(e) => {
              if (e.key === "Enter" && prenom.trim()) handleStart(true);
            }}
            disabled={saving}
          />
        </div>

        {/* CTA */}
        <div className="space-y-3 animate-reveal animate-reveal-delay-6">
          <button
            onClick={() => handleStart(true)}
            disabled={saving}
            className="btn-primary w-full text-center text-lg py-4 shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {saving ? "Un instant..." : "Commencer ma traversée"}
          </button>
          <button
            onClick={() => handleStart(false)}
            disabled={saving}
            className="btn-ghost w-full text-center text-sm"
          >
            Continuer sans prénom
          </button>
        </div>

        <p className="text-center text-xs text-warm-gray mt-4 font-body">
          Tu pourras toujours modifier ton prénom dans ton profil.
        </p>
      </div>
    </div>
  );
}
