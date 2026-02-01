export const sendLocalNotification = (title, options = {}) => {
  if (typeof window === 'undefined') return

  // 1. Vibration (Feedback immédiat sur Android)
  if (navigator.vibrate) navigator.vibrate([100, 50, 100])

  // 2. Envoi via le Service Worker (Nécessaire pour Android/PWA)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.showNotification(title, {
          icon: '/web-app-manifest-192x192.png',
          badge: '/web-app-manifest-192x192.png', // Petite icône dans la barre de status
          vibrate: [100, 50, 100],
          ...options,
        })
      })
      .catch((err) => console.error('Erreur Notification SW:', err))
  }
  // 3. Fallback Desktop (Chrome/Safari Mac/Windows)
  else if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options)
  }
}
