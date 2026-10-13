import type { Metadata } from "next";
import { colors, containerStyle, h1Style, linkStyle, pStyle } from "../_ui";
import { EffacerBrouillon } from "./EffacerBrouillon";

// Le Cercle TRACÉA en ligne — page après paiement réussi.
// Texte d'Alyson, mot pour mot.
export const metadata: Metadata = {
  title: "Ta place est réservée · Le Cercle TRACÉA en ligne",
};

export default function CercleMerciPage() {
  return (
    <div style={containerStyle}>
      <EffacerBrouillon />
      <h1 style={h1Style}>{"Ta place est réservée."}</h1>
      <p style={{ ...pStyle, marginTop: 24, color: colors.heading }}>
        {"Merci d'avoir osé ce premier pas."}
      </p>
      <p style={pStyle}>
        {"Le 13 novembre, je te confirme ton créneau par email."}
      </p>
      <p style={pStyle}>
        {"D'ici là, si quelque chose devient trop lourd, le "}
        <a href="tel:3114" style={linkStyle}>
          3114
        </a>
        {" répond jour et nuit."}
      </p>
    </div>
  );
}
