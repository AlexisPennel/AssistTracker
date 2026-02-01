// public/sw.js

const CACHE_NAME = 'attendify-v1'

// 1. Instalación y activación inmediata
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

// 2. EL FILTRO DE FETCH (CRÍTICO PARA LA INSTALACIÓN)
// Aunque no guardes nada en caché, este evento DEBE existir.
self.addEventListener('fetch', (event) => {
  // Aquí podrías añadir lógica de caché más adelante
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request)
    })
  )
})

// 3. Tu lógica de Notificaciones Push (Adaptada)
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json()

    const options = {
      body: data.body,
      icon: '/web-app-manifest-192x192.png',
      badge: '/web-app-manifest-192x192.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/',
      },
      tag: 'attendify-notification',
      renotify: true,
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

// 4. Gestión del clic
self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(event.notification.data.url)
    })
  )
})
