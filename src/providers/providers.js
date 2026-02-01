'use client'

import { AttendanceProvider } from '@/context/AttendanceContext'
import { ScheduleProvider } from '@/context/ScheduleContext'
import { SessionProvider } from 'next-auth/react'

export function Providers({ children }) {
  return (
    <SessionProvider>
      <ScheduleProvider>
        <AttendanceProvider>{children}</AttendanceProvider>
      </ScheduleProvider>
    </SessionProvider>
  )
}
