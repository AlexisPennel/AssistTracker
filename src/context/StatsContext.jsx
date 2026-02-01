'use client'

import { useSession } from 'next-auth/react'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const StatsContext = createContext()

export const StatsProvider = ({ children }) => {
  const { status } = useSession()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    if (status !== 'authenticated') return

    try {
      // On crée une route API /api/stats pour récupérer le document Stats
      const res = await fetch('/api/stats', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erreur stats:', error)
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Permet de rafraîchir les chiffres après l'action addCigarette
  const refreshStats = async () => {
    await fetchStats()
  }

  return (
    <StatsContext.Provider value={{ stats, loading, refreshStats }}>
      {children}
    </StatsContext.Provider>
  )
}

export const useStats = () => useContext(StatsContext)
