// public/sw.js

// 1. Écoute des notifications Push (Serveur -> Téléphone)
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json()

    const options = {
      body: data.body,
      icon: data.icon || '/favicon/web-app-manifest-192x192.png', // Image de l'app
      badge: data.badge || '/pwa/badge.png', // Icône de la barre d'état
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/',
      },
      // Ajoute ceci pour que la notif ne s'empile pas 10 fois
      tag: 'stop-smoking-notification',
      renotify: true,
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

// 2. Gestion du clic sur la notification
self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Si l'app est déjà ouverte, on la focus
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus()
      }
      // Sinon on ouvre une nouvelle fenêtre
      if (clients.openWindow) return clients.openWindow(event.notification.data.url)
    })
  )
})
