// TRACÉA — Service worker (chantier 57, brique 57-2)
// Deux responsabilités seulement : afficher une notification push reçue,
// et amener l'app au premier plan quand on clique dessus. Aucune logique
// de cache ici (pas de next-pwa, pas de mise en cache offline — hors
// périmètre 57-2).

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
