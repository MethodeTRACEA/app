import type { Metadata } from "next";
import { SimpleHeader, containerStyle } from "../_ui";
import { RenoncerForm } from "./RenoncerForm";

// Le Cercle TRACÉA en ligne — « Renoncer au contrat ici ».
// Textes d'Alyson, mot pour mot. Le formulaire envoie la demande à
// /api/cercle/retractation (notification à Alyson + accusé de réception).
export const metadata: Metadata = {
  title: "Renoncer au contrat · Le Cercle TRACÉA en ligne",
};

export default function CercleRenoncerPage() {
  return (
    <>
      <SimpleHeader
        title="Renoncer au contrat"
        sub="Tu peux changer d'avis pendant quatorze jours après ton inscription, sans avoir à te justifier."
      />
      <div style={{ ...containerStyle, paddingBottom: 80 }}>
        <RenoncerForm />
      </div>
    </>
  );
}
