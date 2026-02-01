'use client'

import { toggleAttendance } from '@/app/actions/attendance-actions'
import { useSession } from 'next-auth/react'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const AttendanceContext = createContext()

export function AttendanceProvider({ children }) {
  const { data: session } = useSession()
  const [attendances, setAttendances] = useState({}) // Format: { scheduleId: status }
  const [loading, setLoading] = useState(true)

  const fetchAttendances = useCallback(async () => {
    if (!session) return
    try {
      setLoading(true)
      const res = await fetch('/api/attendances/today')
      if (res.ok) {
        const data = await res.json()
        // On transforme le tableau en objet pour un accès rapide : { id: 'present' }
        const attendanceMap = data.reduce((acc, curr) => {
          acc[curr.scheduleId] = curr.status
          return acc
        }, {})
        setAttendances(attendanceMap)
      }
    } catch (err) {
      console.error('Error fetching attendances:', err)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    fetchAttendances()
  }, [fetchAttendances])

  const updateStatus = async (scheduleId, studentId, newStatus) => {
    // Mise à jour optimiste (UI immédiate)
    const oldStatus = attendances[scheduleId]
    setAttendances((prev) => ({ ...prev, [scheduleId]: newStatus }))

    const result = await toggleAttendance(scheduleId, studentId, newStatus)

    if (!result.success) {
      // Revenir en arrière en cas d'erreur
      setAttendances((prev) => ({ ...prev, [scheduleId]: oldStatus }))
      alert('Error al guardar')
    }
  }

  return (
    <AttendanceContext.Provider
      value={{ attendances, updateStatus, loading, refresh: fetchAttendances }}
    >
      {children}
    </AttendanceContext.Provider>
  )
}

export const useAttendance = () => useContext(AttendanceContext)
