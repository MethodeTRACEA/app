import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// ===================================================================
// POST /api/retour
//
// Reçoit les réponses du formulaire de retour qualitatif (page /retour)
// et envoie un email récap à contact@methodetracea.fr.
// Aucune persistance en base : email uniquement.
// ===================================================================

const FROM = "TRACÉA <bonjour@methodetracea.fr>";
const TO = "contact@methodetracea.fr";

const Q2_LABELS: Record<string, string> = {
  oui_une_fois: "Oui, une fois",
  oui_plusieurs: "Oui, plusieurs fois",
  non: "Non, je me suis arrêté·e en route",
};

type Payload = {
  q1?: unknown;
  q2?: unknown;
  q3?: unknown;
  q4?: unknown;
  q5?: unknown;
  q5b?: unknown;
};

function asString(v: unknown, max = 4000): string {
  if (typeof v !== "string") return "";
  return v.slice(0, max).trim();
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[RETOUR] RESEND_API_KEY manquante");
      return NextResponse.json(
        { error: "Configuration email manquante" },
        { status: 500 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as Payload;

    const q1 = asString(body.q1);
    const q2Raw = asString(body.q2, 64);
    const q3 = asString(body.q3);
    const q4 = asString(body.q4);
    const q5 =
      typeof body.q5 === "number" && body.q5 >= 0 && body.q5 <= 10
        ? Math.round(body.q5)
        : null;
    const q5b = asString(body.q5b);

    if (!q1 || !q2Raw || !q3 || q5 === null) {
      return NextResponse.json(
        { error: "Réponses obligatoires manquantes" },
        { status: 400 }
      );
    }

    const q2Label = Q2_LABELS[q2Raw] ?? q2Raw;

    const text = [
      "Nouveau retour TRACÉA",
      "",
      "— Q1. Ce qu'elle a compris en quelques secondes :",
      q1,
      "",
      "— Q2. A traversé les 6 étapes T·R·A·C·E·A ?",
      q2Label,
      "",
      "— Q3. Comment elle expliquerait TRACÉA en 1-2 phrases :",
      q3,
      "",
      "— Q4. Moment / écran qui a fait hésiter ou décrocher :",
      q4 || "(aucune réponse)",
      "",
      `— Q5. Probabilité de recommandation : ${q5}/10`,
      "",
      "— Q5b. Ce qui explique la note :",
      q5b || "(aucune réponse)",
      "",
    ].join("\n");

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: TO,
      subject: `Retour TRACÉA — NPS ${q5}/10`,
      text,
    });

    if (error) {
      console.error("[RETOUR] Resend error:", error);
      return NextResponse.json(
        { error: "Envoi email échoué" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[RETOUR] Exception:", msg);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
