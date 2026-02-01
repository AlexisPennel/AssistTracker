'use server'

import { authOptions } from '@/lib/next-auth/auth'
import { connectDB } from '@/lib/next-auth/mongodb'
import Schedule from '@/mongo/models/Schedule'
import Student from '@/mongo/models/Student'
import { getServerSession } from 'next-auth/next'
import { revalidatePath } from 'next/cache'

export async function createStudentWithSchedule(studentData, schedules) {
  try {
    await connectDB()

    // 1. Obtener la sesión para identificar al usuario
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      throw new Error('Debes iniciar sesión para realizar esta acción')
    }

    const userId = session.user.id

    // 2. Crear el estudiante vinculado al userId
    const student = await Student.create({
      name: studentData.name,
      price: Number(studentData.price),
      userId: userId, // Vínculo de propiedad
    })

    // 3. Preparar los horarios con el userId y studentId
    const scheduleEntries = schedules.map((slot) => ({
      userId: userId, // Vínculo de propiedad
      studentId: student._id,
      occurrence: slot.occurrence,
      startTime: slot.startTime,
      endTime: slot.endTime,
      ...(slot.occurrence === 'weekly'
        ? { dayOfWeek: Number(slot.dayOfWeek) }
        : { date: new Date(slot.date) }),
    }))

    // 4. Guardar en la colección Schedule
    await Schedule.insertMany(scheduleEntries)

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('❌ Error en createStudentWithSchedule:', error)
    return { success: false, error: error.message }
  }
}
