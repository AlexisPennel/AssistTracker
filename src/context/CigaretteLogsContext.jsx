// context/CigaretteLogsContext.js
'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const CigaretteLogsContext = createContext()

export const CigaretteLogsProvider = ({ children }) => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  // On isole la logique de récupération des données
  const fetchLogs = useCallback(async () => {
    try {
      // On force le rafraîchissement en ignorant le cache navigateur si besoin
      const response = await fetch('/api/logs', { cache: 'no-store' })
      const data = await response.json()
      setLogs(data)
    } catch (error) {
      console.error('Erreur lors du fetch des logs:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Chargement initial
  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // La fonction "magic" à appeler après une Server Action
  const refreshLogs = async () => {
    await fetchLogs()
  }

  const lastCigarette = logs.length > 0 ? logs[logs.length - 1].smokedAt : null

  return (
    <CigaretteLogsContext.Provider
      value={{
        logs,
        loading,
        refreshLogs, // On l'expose ici
        lastCigarette,
      }}
    >
      {children}
    </CigaretteLogsContext.Provider>
  )
}

export const useCigaretteLogs = () => useContext(CigaretteLogsContext)
