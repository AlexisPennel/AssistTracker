import { useEffect, useState } from 'react'

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    // 1. Manejador del evento
    const handler = (e) => {
      console.log('✅ Evento beforeinstallprompt capturado')
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    // 2. Escuchar el evento
    window.addEventListener('beforeinstallprompt', handler)

    // 3. Verificar si ya está instalada
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setIsInstallable(false)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.error('❌ No hay evento de instalación guardado')
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setIsInstallable(false)
      setDeferredPrompt(null)
    }
  }

  return { isInstallable, handleInstallClick }
}
