'use client'

import { useConsentContext } from '@/context/ConsentContext' // adapte le chemin
import { useCallback } from 'react'

export default function useAnalyticsEvent() {
  const { consent, ready } = useConsentContext()

  const sendEvent = useCallback(
    (eventName, params = {}) => {
      if (!ready) {
        console.warn('[analytics] Context non prêt, event non envoyé', { eventName, params })
        return
      }

      if (!consent) {
        console.warn('[analytics] Event non envoyé (pas de consentement)', { eventName, params })
        return
      }

      if (typeof window.gtag !== 'function') {
        console.error('[analytics] gtag non défini')
        return
      }

      window.gtag('event', eventName, params)
    },
    [consent, ready]
  )

  return sendEvent
}
