'use server'

import { authOptions } from '@/lib/next-auth/auth'
import { connectDB } from '@/lib/next-auth/mongodb'
import Attendance from '@/mongo/models/Attendance'
import { getServerSession } from 'next-auth/next'
import { revalidatePath } from 'next/cache'

export async function toggleAttendance(scheduleId, studentId, status) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      throw new Error('Non autorisé')
    }

    await connectDB()

    const userId = session.user.id

    // Normalisation de la date pour le fuseau horaire du Mexique (UTC minuit)
    const now = new Date()
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))

    // Mise à jour ou Création (upsert)
    await Attendance.findOneAndUpdate(
      {
        scheduleId,
        date: today,
        userId: userId,
      },
      {
        status,
        studentId,
        userId: userId,
        date: today,
      },
      { upsert: true, new: true }
    )

    // On rafraîchit les données du client
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('❌ Erreur Attendance:', error)
    return { success: false, error: error.message }
  }
}
