import type { Metadata } from "next";
import {
  accentStyle,
  cardStyle,
  colors,
  containerStyle,
  h1Style,
  linkStyle,
  pStyle,
} from "../_ui";
import { EffacerBrouillon } from "./EffacerBrouillon";
import { getCercleStripe } from "@/lib/cercle/stripe";
import { envoyerEmailsInscription } from "@/lib/cercle/inscriptions";

// Le Cercle TRACÉA en ligne — page après paiement réussi.
// Texte d'Alyson, mot pour mot.
export const metadata: Metadata = {
  title: "Ta place est réservée · Le Cercle TRACÉA en ligne",
};

// Page calculée à chaque visite : elle déclenche l'envoi des emails.
export const dynamic = "force-dynamic";

// Filet de sécurité : le webhook Stripe (/api/cercle/webhook) envoie les
// emails ; cette page fait le même envoi si le webhook n'a pas encore
// répondu (ou n'est pas configuré). Même clé d'idempotence : jamais de
// doublon. Limité aux paiements des deux dernières heures.
async function envoyerSiBesoin(sessionId: string | undefined) {
  if (!sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return;
  const cs = getCercleStripe({ ignorerOuverture: true });
  if (!cs.ok) return;
  try {
    await envoyerEmailsInscription(cs.stripe, cs.live, sessionId, { ageMaxMs: 2 * 3600 * 1000 });
  } catch (err) {
    console.error("[CERCLE] Envoi depuis /merci impossible:", err instanceof Error ? err.message : err);
  }
}

export default async function CercleMerciPage({
  searchParams,
}: {
  searchParams: { s?: string };
}) {
  await envoyerSiBesoin(searchParams?.s);
  return (
    <div style={{ ...containerStyle, maxWidth: 600 }} className="pt-14 pb-20 md:pt-20 md:pb-28">
      <EffacerBrouillon />
      <div style={{ ...cardStyle, padding: "36px 26px", textAlign: "center" }}>
        <h1 style={h1Style}>{"Ta place est réservée."}</h1>
        <p style={{ ...accentStyle, fontSize: "1.2rem", margin: "22px 0 24px" }}>
          {"Merci d'avoir osé ce premier pas."}
        </p>
        <p style={pStyle}>
          {"Le 13 novembre, je te confirme ton créneau par email."}
        </p>
        <p style={{ ...pStyle, margin: 0, color: colors.heading }}>
          {"D'ici là, si quelque chose devient trop lourd, le "}
          <a href="tel:3114" style={{ ...linkStyle, fontWeight: 700, color: colors.title }}>
            3114
          </a>
          {" répond jour et nuit."}
        </p>
      </div>
    </div>
  );
}
