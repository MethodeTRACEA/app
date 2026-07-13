// TRACÉA — Service worker (chantier 57, brique 57-2 + chantier 60, C5)
// Trois responsabilités seulement : afficher une notification push reçue,
// amener l'app au premier plan quand on clique dessus, et servir une page
// hors-ligne sobre quand une navigation échoue faute de réseau. Pas de
// next-pwa, pas de precache du site : seul /offline.html est mis en cache,
// et le handler fetch ne touche qu'aux navigations (jamais aux API, aux
// assets ni aux requêtes en arrière-plan).

const OFFLINE_CACHE = "tracea-offline-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then((cache) => cache.add(OFFLINE_URL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("tracea-offline-") && k !== OFFLINE_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // Navigations uniquement : le reste du trafic passe au réseau sans
  // interception (important pour la TWA : aucune réécriture de requête).
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(() =>
      caches
        .match(OFFLINE_URL)
        .then((cached) => cached || Response.error())
    )
  );
});

self.addEventListener("push", (event) => {
  // ⚠️ Le corps par défaut ci-dessous est un PLACEHOLDER de test 57-2.
  // Le wording réel (titre/corps figés, audités doctrine) arrive en 57-4/57-5 :
  // ne jamais laisser ce texte de test partir vers une utilisatrice réelle.
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  const title = payload.title || "TRACÉA";
  const body = payload.body || "[test 57-2] Ceci est un rappel de test.";
  const url = payload.url || "/app";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/images/tracea-icon-192.png",
      badge: "/images/tracea-icon-192.png",
      data: { url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/app";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsList) => {
        for (const client of clientsList) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});
