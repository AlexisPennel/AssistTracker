// context/AttendanceContext.jsx
'use client'

import { toggleAttendance } from '@/app/actions/attendance-actions'
import { useSession } from 'next-auth/react'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const AttendanceContext = createContext()

export function AttendanceProvider({ children }) {
  const { data: session } = useSession()
  const [attendances, setAttendances] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchAttendances = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/attendances/today')

      if (res.ok) {
        const data = await res.json()

        const attendancesByDate = data.reduce((acc, curr) => {
          const dateKey = new Date(curr.date).toISOString().split('T')[0]
          if (!acc[dateKey]) acc[dateKey] = {}
          acc[dateKey][curr.scheduleId] = curr.status
          return acc
        }, {})

        setAttendances(attendancesByDate)
      }
    } catch (err) {
      console.error('❌ Error fetching attendances:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchAttendances()
    }
  }, [session?.user?.id, fetchAttendances])

  const updateStatus = useCallback(
    async (scheduleId, studentId, newStatus, date) => {
      const dateKey = date.toISOString().split('T')[0]
      const oldStatus = attendances[dateKey]?.[scheduleId]

      // Mise à jour optimiste
      setAttendances((prev) => ({
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          [scheduleId]: newStatus,
        },
      }))

      // ✅ IMPORTANT : Passer la date à toggleAttendance
      const result = await toggleAttendance(scheduleId, studentId, newStatus, dateKey)

      if (!result.success) {
        // Rollback
        setAttendances((prev) => ({
          ...prev,
          [dateKey]: {
            ...prev[dateKey],
            [scheduleId]: oldStatus,
          },
        }))
        console.error('Error updating status')
      }
    },
    [attendances]
  )

  return (
    <AttendanceContext.Provider
      value={{ attendances, updateStatus, loading, refresh: fetchAttendances }}
    >
      {children}
    </AttendanceContext.Provider>
  )
}

export const useAttendance = () => {
  const context = useContext(AttendanceContext)
  if (!context) {
    throw new Error('useAttendance must be used within AttendanceProvider')
  }
  return context
}
