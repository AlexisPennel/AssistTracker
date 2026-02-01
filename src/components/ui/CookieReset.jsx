/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { useConsentContext } from '@/context/ConsentContext'
import { useEffect, useState } from 'react'

export default function CookieReset() {
  const { consent, setConsent } = useConsentContext()
  const [open, setOpen] = useState(false)
  const [localConsent, setLocalConsent] = useState(false)

  // Synchroniser localConsent avec le consent du context dès qu'il est disponible
  useEffect(() => {
    if (consent !== null && consent !== undefined) {
      setLocalConsent(consent)
    }
  }, [consent])

  const handleSave = () => {
    setConsent(localConsent)

    if (localConsent) {
      document.cookie = `analytics_consent=true; Path=/; Max-Age=${
        60 * 60 * 24 * 365
      }; SameSite=Lax`
    } else {
      document.cookie =
        'analytics_consent=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
      // Supprimer les cookies GA existants
      document.cookie.split(';').forEach((c) => {
        if (c.trim().startsWith('_ga')) {
          document.cookie = `${c.split('=')[0]}=; Max-Age=0; Path=/;`
        }
      })
    }

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="cursor-pointer px-0 text-base font-normal text-zinc-200">
          Cookies
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Préférences cookies</DialogTitle>
          <DialogDescription>
            Gérez vos préférences en matière de cookies. Vous pouvez choisir d&apos;activer ou de
            désactiver les cookies analytics selon vos préférences.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-6">
          <span>Accepter les cookies analytics</span>
          <Switch
            checked={localConsent}
            onCheckedChange={(checked) => setLocalConsent(checked === true)}
          />
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
