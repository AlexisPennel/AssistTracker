'use client'

import { useSession } from 'next-auth/react'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const ScheduleContext = createContext()

export function ScheduleProvider({ children }) {
  const { status } = useSession()
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  // 1. Nouvel état pour la date sélectionnée (par défaut : aujourd'hui)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const fetchSchedules = useCallback(
    async (date) => {
      if (status !== 'authenticated') return

      setLoading(true)
      try {
        // 2. Formatage de la date en YYYY-MM-DD pour l'API
        const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
        // On utilise un endpoint plus générique ou on passe la date en query param
        const response = await fetch(`/api/schedules?date=${dateStr}`)

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`)
        }

        const data = await response.json()
        setSchedules(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('❌ Error cargando horarios:', error)
        setSchedules([])
      } finally {
        setLoading(false)
      }
    },
    [status]
  )

  // 3. Re-charger les données dès que la date sélectionnée change
  useEffect(() => {
    if (status === 'authenticated') {
      fetchSchedules(selectedDate)
    } else if (status === 'unauthenticated') {
      setLoading(false)
      setSchedules([])
    }
  }, [status, selectedDate, fetchSchedules])

  return (
    <ScheduleContext.Provider
      value={{
        schedules,
        loading: loading || status === 'loading',
        selectedDate, // On expose la date actuelle
        setSelectedDate, // On expose la fonction pour changer de date
        refreshSchedules: () => fetchSchedules(selectedDate),
      }}
    >
      {children}
    </ScheduleContext.Provider>
  )
}

export const useSchedules = () => {
  const context = useContext(ScheduleContext)
  if (!context) {
    throw new Error('useSchedules debe usarse dentro de un ScheduleProvider')
  }
  return context
}
