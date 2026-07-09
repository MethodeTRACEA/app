import { Resend } from "resend";

const FROM = "TRACÉA <bonjour@methodetracea.fr>";

// Instanciation paresseuse : évite que new Resend() soit appelé au niveau
// module lors du build Next.js (next build évalue les imports à froid et
// lève "Missing API key" si RESEND_API_KEY est absente au build time).
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("[email] RESEND_API_KEY manquante");
  return new Resend(key);
}

export async function sendEmail(params: {
  from: string;
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  try {
    const resend = getResend();
    const { error } = await resend.emails.send(params);
    if (error) console.error("[email] send failed", error);
  } catch (err) {
    console.error("[email] send threw", err);
  }
}

export async function emailTrialStarted(
  userEmail: string,
  trialEndsAt: Date
): Promise<void> {
  const formatted = trialEndsAt.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const text = `Bonjour,

Ton essai gratuit vient de démarrer.

Tu as 14 jours et jusqu'à 5 traversées approfondies pour explorer TRACÉA quand tu en as envie.

Il se termine le ${formatted}.

Si tu veux continuer après ça, un abonnement est disponible à 5,99 €/mois, sans engagement, résiliable à tout moment.

À bientôt,
Tracéa`;

  await sendEmail({
    from: FROM,
    to: userEmail,
    subject: "Ton essai TRACÉA a commencé",
    text,
  });
}

export async function emailTrialExpiring(userEmail: string): Promise<void> {
  const text = `Bonjour,

Ton essai gratuit se termine aujourd'hui.

Si TRACÉA t'a été utile et que tu veux continuer, tu peux t'abonner depuis l'app — 5,99 €/mois, sans engagement.

Sinon, tu gardes accès aux traversées courtes et à l'urgence, gratuitement.

À bientôt,
Tracéa`;

  await sendEmail({
    from: FROM,
    to: userEmail,
    subject: "Ton essai TRACÉA se termine aujourd'hui",
    text,
  });
}
