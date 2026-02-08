// context/ScheduleContext.jsx
'use client'

import { useSession } from 'next-auth/react'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const ScheduleContext = createContext()

export function ScheduleProvider({ children }) {
  const { data: session } = useSession()
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true) // ✅ Pour l'initial load seulement
  const [selectedDate, setSelectedDate] = useState(new Date())
  const hasFetched = useRef(false)

  const fetchSchedules = useCallback(async () => {
    try {
      if (!hasFetched.current) {
        setLoading(true)
      }

      const res = await fetch('/api/schedules')
      if (res.ok) {
        const data = await res.json()
        setSchedules(data)
        hasFetched.current = true
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ Charger UNE SEULE FOIS au montage
  useEffect(() => {
    if (session && !hasFetched.current) {
      fetchSchedules()
    }
  }, [session]) // Pas de dépendance selectedDate !

  const refreshSchedules = async () => {
    await fetchSchedules()
  }

  return (
    <ScheduleContext.Provider
      value={{
        schedules,
        loading,
        selectedDate,
        setSelectedDate,
        refreshSchedules,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  )
}

export const useSchedules = () => {
  const context = useContext(ScheduleContext)
  if (!context) {
    throw new Error('useSchedules must be used within ScheduleProvider')
  }
  return context
}
