// components/NotificationPrompt.jsx
'use client'

import { Button } from '@/components/ui/button'
import { Bell, Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export const NotificationPrompt = () => {
  const [permission, setPermission] = useState('default')
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Vérifie l'état actuel au montage du composant
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const handleRequest = async () => {
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  // Si déjà accepté, refusé, ou que l'utilisateur a fermé le bandeau, on ne montre rien
  if (permission !== 'default' || !isVisible) return null

  return (
    <div className="bg-background animate-in slide-in-from-top-2 flex items-center justify-between gap-4 rounded-lg border border-none p-3">
      <div className="flex items-center gap-3">
        <Bell className="size-5 animate-pulse" />
        <div className="flex flex-col">
          <p className="text-sm font-semibold">Activer les rappels ?</p>
          <p className="text-muted-foreground text-[11px]">
            Sois prévenu dès que l&apos;intervalle est terminé.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="destructive"
          className={'h-7 w-7 rounded-sm'}
          onClick={() => setIsVisible(false)}
        >
          <X />
        </Button>
        <Button
          size="icon"
          onClick={handleRequest}
          className="h-7 w-7 rounded-sm bg-white text-xs text-black hover:bg-white/80"
        >
          <Check />
        </Button>
      </div>
    </div>
  )
}
