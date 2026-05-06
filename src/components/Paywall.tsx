"use client";

import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

interface PaywallProps {
  onContinue: () => void;
}

export function Paywall({ onContinue }: PaywallProps) {
  const router = useRouter();

  return (
    <div className="w-full max-w-md mx-auto px-5 py-10 flex flex-col items-center text-center gap-6">
      {/* Carte enveloppe TRACÉA */}
      <div
        className="w-full flex flex-col items-center gap-6"
        style={{
          background: "rgba(111,106,100,0.18)",
          border: "1px solid rgba(240,230,214,0.10)",
          borderRadius: 24,
          padding: "28px 24px",
          boxShadow:
            "0 14px 30px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Titre */}
        <h2
          className="font-light text-[26px] leading-[32px] tracking-[-0.01em]"
          style={{
            fontFamily: "'Cormorant Garamond', 'EB Garamond', serif",
            color: "#F0E6D6",
          }}
        >
          Tu peux continuer à t&apos;entraîner
        </h2>

        {/* Phrase contenante */}
        <p
          className="font-sans text-[14px] leading-[20px]"
          style={{ color: "rgba(240,230,214,0.62)" }}
        >
          Le parcours approfondi peut devenir un repère quand tu as besoin de
          traverser plus en profondeur.
        </p>

        {/* Bénéfices */}
        <div className="w-full text-left">
          <p
            className="font-sans text-[13px] leading-[18px] mb-3"
            style={{ color: "rgba(240,230,214,0.55)" }}
          >
            Avec l&apos;abonnement, tu peux&nbsp;:
          </p>
          <ul
            className="space-y-2 font-sans text-[13px] leading-[18px]"
            style={{ color: "rgba(240,230,214,0.62)" }}
          >
            <li className="flex items-start gap-2">
              <span
                aria-hidden="true"
                style={{ color: "#C97B6A", marginTop: 6, fontSize: 6 }}
              >
                ●
              </span>
              <span>lancer des sessions approfondies régulièrement</span>
            </li>
            <li className="flex items-start gap-2">
              <span
                aria-hidden="true"
                style={{ color: "#C97B6A", marginTop: 6, fontSize: 6 }}
              >
                ●
              </span>
              <span>revenir autant de fois que nécessaire</span>
            </li>
            <li className="flex items-start gap-2">
              <span
                aria-hidden="true"
                style={{ color: "#C97B6A", marginTop: 6, fontSize: 6 }}
              >
                ●
              </span>
              <span>observer ce qui t&apos;aide dans le temps</span>
            </li>
          </ul>
        </div>

        {/* Mention essai gratuit, au-dessus du CTA */}
        <p
          className="font-sans text-[12px] leading-[16px]"
          style={{ color: "rgba(240,230,214,0.55)" }}
        >
          7 jours gratuits · 5 traversées incluses · sans carte bancaire
        </p>

        {/* CTA principal — entrée dans l'essai */}
        <PrimaryButton onClick={() => router.push("/app/subscribe")}>
          Commencer mon essai gratuit
        </PrimaryButton>

        {/* Prix transparent, sous le CTA */}
        <p
          className="font-sans text-[11px]"
          style={{ color: "rgba(240,230,214,0.38)" }}
        >
          Puis 9€/mois · sans engagement · résiliable à tout moment
        </p>
      </div>

      {/* Sortie libre — digne, hors carte */}
      <SecondaryButton onClick={onContinue}>Continuer librement</SecondaryButton>
    </div>
  );
}
