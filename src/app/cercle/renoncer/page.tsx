import type { Metadata } from "next";
import { containerStyle, h1Style } from "../_ui";

// Le Cercle TRACÉA en ligne — « Renoncer au contrat ici ».
// Étape 1 : titre provisoire seulement. Le formulaire de rétractation et
// l'accusé de réception arrivent à l'étape 3.
export const metadata: Metadata = {
  title: "Renoncer au contrat · Le Cercle TRACÉA en ligne",
};

export default function CercleRenoncerPage() {
  return (
    <div style={containerStyle}>
      <h1 style={h1Style}>{"Renoncer au contrat"}</h1>
    </div>
  );
}
