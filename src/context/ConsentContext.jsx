/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { AnalyticsScripts } from '@/components/analytics/AnalyticsScripts'
import { createContext, useContext, useEffect, useState } from 'react'

const ConsentContext = createContext({
  consent: null,
  setConsent: () => {},
  ready: false,
})

export const ConsentProvider = ({ children }) => {
  const [consent, setConsent] = useState(null)
  const [ready, setReady] = useState(false)

  // Lire le cookie au démarrage
  useEffect(() => {
    const cookie = document.cookie.split('; ').find((c) => c.startsWith('analytics_consent='))
    if (cookie) {
      setConsent(cookie.split('=')[1] === 'true')
    }
    setReady(true)
  }, [])

  // Enregistrer le consentement + supprimer GA si refus
  useEffect(() => {
    if (!ready || consent === null) return

    document.cookie = `analytics_consent=${consent}; Path=/; Max-Age=${
      60 * 60 * 24 * 365
    }; SameSite=Lax`

    if (!consent) {
      document.cookie.split(';').forEach((c) => {
        if (c.trim().startsWith('_ga')) {
          document.cookie = `${c.split('=')[0]}=; Max-Age=0; Path=/;`
        }
      })
    }
  }, [consent, ready])

  return (
    <ConsentContext.Provider value={{ consent, setConsent, ready }}>
      {children}
      <AnalyticsScripts consent={consent} />
    </ConsentContext.Provider>
  )
}

export const useConsentContext = () => useContext(ConsentContext)
