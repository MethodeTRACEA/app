// TRACÉA — Web Push, socle client (chantier 57, brique 57-2)
// Fonctions prêtes à l'emploi, PAS un flux exposé à une utilisatrice réelle :
// subscribeToPush() ne doit être appelée que depuis un vrai geste utilisateur
// (clic), jamais automatiquement au chargement — sinon la demande de
// permission navigateur est bloquée/dégradée. L'écran qui contient ce clic
// (armement d'un 1er rappel) arrive en 57-3.

export type PushSubscribeResult =
  | { status: "unsupported" }
  | { status: "permission_denied" }
  | { status: "permission_dismissed" }
  | { status: "success"; alreadySubscribed: boolean }
  | { status: "error"; reason: string };

// Conversion standard clé VAPID base64url -> Uint8Array, requise par
// PushManager.subscribe (applicationServerKey).
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Demande la permission de notification (geste utilisateur requis), crée
 * l'abonnement push du navigateur, puis l'enregistre dans push_subscriptions
 * via /api/push/subscribe. Ne lève jamais d'exception : retourne toujours un
 * statut clair, exploité par 57-3/57-5 pour basculer sur le repli in-app.
 */
export async function subscribeToPush(
  accessToken: string
): Promise<PushSubscribeResult> {
  try {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      return { status: "unsupported" };
    }

    const permission = await Notification.requestPermission();
    if (permission === "denied") {
      return { status: "permission_denied" };
    }
    if (permission !== "granted") {
      return { status: "permission_dismissed" };
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      return { status: "error", reason: "vapid_public_key_missing" };
    }

    // Idempotent si déjà enregistré (RegisterServiceWorker l'a normalement
    // déjà fait) ; on ne dépend pas de l'ordre de montage.
    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();
    const alreadySubscribed = subscription !== null;
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // Cast : TS 5.7+ resserre Uint8Array<ArrayBufferLike> vs le
        // ArrayBufferView<ArrayBuffer> attendu par le DOM lib ; sans impact
        // runtime (BufferSource accepte bien un Uint8Array standard).
        applicationServerKey: urlBase64ToUint8Array(
          vapidPublicKey
        ) as BufferSource,
      });
    }

    const json = subscription.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
      return { status: "error", reason: "invalid_subscription" };
    }

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      }),
    });

    if (!res.ok) {
      return { status: "error", reason: `api_${res.status}` };
    }

    return { status: "success", alreadySubscribed };
  } catch (err) {
    return {
      status: "error",
      reason: err instanceof Error ? err.message : "unknown",
    };
  }
}
