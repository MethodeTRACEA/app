"use client";

import { useEffect } from "react";
import { BROUILLON_KEY } from "@/lib/cercle/config";

// Paiement réussi : on efface le brouillon du formulaire gardé dans le
// navigateur (prénom, téléphone, commune…). Rien ne doit y rester.
export function EffacerBrouillon() {
  useEffect(() => {
    try {
      sessionStorage.removeItem(BROUILLON_KEY);
    } catch {
      // stockage indisponible : rien à effacer
    }
  }, []);
  return null;
}
