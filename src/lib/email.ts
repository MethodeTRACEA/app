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
  // Chantier 60 (billing Option A) : l'app Android Play Store ne vend
  // rien, l'email devient le canal de conversion. Lien direct vers la
  // souscription web, verbatim audité doctrine. L'ancienne formulation
  // « t'abonner depuis l'app » serait fausse pour une utilisatrice TWA.
  const text = `Bonjour,

Ton essai gratuit se termine aujourd'hui.

Si tu veux continuer avec TRACÉA Premium, tu peux t'abonner ici :
https://www.methodetracea.fr/app/subscribe

L'abonnement est de 5,99 € par mois ou 49,99 € par an, résiliable en ligne à tout moment.

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

// Accusé de réception de résiliation (Code conso L215-1-1 : support
// durable). Stripe n'envoie pas cet email, il est donc généré ici.
// `periodEnd` = date de fin d'accès effective (current_period_end /
// cancel_at côté Stripe).
export async function emailSubscriptionCanceled(
  userEmail: string,
  periodEnd: Date
): Promise<void> {
  const formatted = periodEnd.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const text = `Bonjour,

Ta demande de résiliation de l'abonnement TRACÉA Premium a bien été enregistrée.

Ton accès Premium reste actif jusqu'au ${formatted}. À cette date, il prendra fin, sans renouvellement ni nouveau paiement.

Ton compte, lui, reste ouvert : tes traces et tes repères ne sont pas effacés, et tu peux revenir quand tu veux.

Si tu n'es pas à l'origine de cette demande, écris-nous à contact@methodetracea.fr.

À bientôt,
TRACÉA`;

  await sendEmail({
    from: FROM,
    to: userEmail,
    subject: "Ta résiliation TRACÉA est bien prise en compte",
    text,
  });
}
