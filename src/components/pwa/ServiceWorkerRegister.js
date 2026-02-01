'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      ('serviceWorker' in navigator && window.location.protocol === 'https:') ||
      window.location.hostname === 'localhost'
    ) {
      const registerSW = async () => {
        try {
          // On enregistre le fichier sw.js qui est à la racine de /public
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          })
          console.log('SW enregistré avec succès, scope:', registration.scope)
        } catch (error) {
          console.error("Échec de l'enregistrement du SW:", error)
        }
      }

      registerSW()
    }
  }, [])

  return null // Ce composant ne rend rien visuellement
}
