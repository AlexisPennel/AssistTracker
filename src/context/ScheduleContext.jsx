'use client'

import { useSession } from 'next-auth/react'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const ScheduleContext = createContext()

export function ScheduleProvider({ children }) {
  const { data: session, status } = useSession() // Monitoreamos la sesión
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTodaySchedules = useCallback(async () => {
    // Si la sesión aún se está cargando o no hay usuario, no disparamos el fetch
    if (status !== 'authenticated') return

    setLoading(true)
    try {
      const response = await fetch('/api/schedules/today')

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()

      // Verificamos si la data es realmente un array (seguridad extra)
      setSchedules(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('❌ Error cargando horarios en el Context:', error)
      setSchedules([]) // Limpiamos en caso de error
    } finally {
      setLoading(false)
    }
  }, [status]) // Re-creamos la función si el estatus de la sesión cambia

  // Efecto principal: cargar datos cuando la sesión esté lista
  useEffect(() => {
    if (status === 'authenticated') {
      fetchTodaySchedules()
    } else if (status === 'unauthenticated') {
      setLoading(false)
      setSchedules([])
    }
  }, [status, fetchTodaySchedules])

  return (
    <ScheduleContext.Provider
      value={{
        schedules,
        loading: loading || status === 'loading',
        refreshSchedules: fetchTodaySchedules,
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
