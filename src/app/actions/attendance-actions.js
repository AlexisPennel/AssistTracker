// app/actions/attendance-actions.js
'use server'

import { authOptions } from '@/lib/next-auth/auth'
import { connectDB } from '@/lib/next-auth/mongodb'
import Attendance from '@/mongo/models/Attendance'
import { getServerSession } from 'next-auth'

export async function toggleAttendance(scheduleId, studentId, newStatus, dateString) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)

    if (!session) {
      return { success: false, error: 'Non authentifié' }
    }

    // ✅ Utiliser la date passée en paramètre (format: "2026-02-08")
    const [year, month, day] = dateString.split('-').map(Number)
    const attendanceDate = new Date(year, month - 1, day, 0, 0, 0, 0)

    console.log('📅 Toggle attendance for date:', dateString, attendanceDate)

    // Chercher si une attendance existe déjà pour ce schedule à cette date
    const existing = await Attendance.findOne({
      scheduleId,
      userId: session.user.id,
      date: attendanceDate,
    })

    if (existing) {
      // ✅ Mettre à jour le statut existant
      existing.status = newStatus
      await existing.save()
      console.log('✅ Updated existing attendance:', existing)
    } else {
      // ✅ Créer une nouvelle attendance
      const newAttendance = await Attendance.create({
        scheduleId,
        studentId,
        userId: session.user.id,
        date: attendanceDate,
        status: newStatus,
      })
      console.log('✅ Created new attendance:', newAttendance)
    }

    return { success: true }
  } catch (error) {
    console.error('❌ Error in toggleAttendance:', error)
    return { success: false, error: error.message }
  }
}
