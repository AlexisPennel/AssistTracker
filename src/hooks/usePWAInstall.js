/* eslint-disable react-hooks/set-state-in-effect */
// hooks/usePWAInstall.js
import { useEffect, useState } from 'react'

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      // Empêche la bannière par défaut du navigateur
      e.preventDefault()
      // Stocke l'événement pour l'utiliser plus tard
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Vérifie si l'app est déjà en mode "standalone" (déjà installée)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Affiche la fenêtre d'installation native
    deferredPrompt.prompt()

    // Attend la réponse de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setIsInstallable(false)
      setDeferredPrompt(null)
    }
  }

  return { isInstallable, handleInstallClick }
}
