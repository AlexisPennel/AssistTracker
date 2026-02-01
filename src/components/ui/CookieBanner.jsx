/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { Button } from '@/components/ui/button'
import { useConsentContext } from '@/context/ConsentContext'
import { useEffect, useState } from 'react'

export default function CookieBanner() {
  const { consent, setConsent, ready } = useConsentContext()
  const [open, setOpen] = useState(false)

  // Afficher le bandeau uniquement si consent pas encore défini
  useEffect(() => {
    let timer
    if (consent === null) {
      // Retarde l'affichage de 500ms
      timer = setTimeout(() => setOpen(true), 500)
    } else {
      setOpen(false)
    }

    // Nettoyage du timer si le composant se démonte ou consent change
    return () => clearTimeout(timer)
  }, [consent])

  const handleConsent = (value) => {
    setConsent(value) // le context s’occupe maintenant du cookie et GA
    setOpen(false)
  }

  // Ne rien afficher tant que ready est false
  if (!ready || consent !== null) return null

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-banner-title"
      className="fixed bottom-4 left-4 z-50 w-[95%] max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl"
    >
      <h2 id="cookie-banner-title" className="text-lg font-semibold text-zinc-900">
        Ce site utilise des cookies
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-700">
        Nous utilisons des cookies pour améliorer les performances du site et analyser son
        utilisation. Conformément au RGPD, aucune donnée ne sera collectée sans votre consentement
        explicite. Vous pouvez modifier vos préférences à tout moment.
      </p>
      <div className="mt-5 flex w-full gap-3">
        <Button
          variant="secondary"
          className={'w-1/3 bg-zinc-300 hover:bg-zinc-300/90'}
          onClick={() => handleConsent(false)}
        >
          Refuser
        </Button>
        <Button onClick={() => handleConsent(true)} className={'w-2/3'}>
          Accepter
        </Button>
      </div>
    </div>
  )
}
