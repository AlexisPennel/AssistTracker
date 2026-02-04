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

    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      throw new Error('Debes iniciar sesión para realizar esta acción')
    }

    const userId = session.user.id

    // 1. Crear el estudiante (Ya no guardamos el precio aquí)
    const student = await Student.create({
      name: studentData.name,
      userId: userId,
    })

    // 2. Preparar los horarios incluyendo el campo 'price' de cada slot
    const scheduleEntries = schedules.map((slot) => ({
      userId: userId,
      studentId: student._id,
      occurrence: slot.occurrence,
      startTime: slot.startTime,
      endTime: slot.endTime,
      price: Number(slot.price), // <--- On récupère le prix spécifique au turno
      ...(slot.occurrence === 'weekly'
        ? { dayOfWeek: Number(slot.dayOfWeek) }
        : { date: new Date(slot.date) }),
    }))

    // 3. Guardar en la colección Schedule
    await Schedule.insertMany(scheduleEntries)

    revalidatePath('/')
    // On peut aussi revalider le chemin des élèves spécifiquement
    revalidatePath('/students')

    return { success: true }
  } catch (error) {
    console.error('❌ Error en createStudentWithSchedule:', error)
    return { success: false, error: error.message }
  }
}

export async function addStudentNote(studentId, content) {
  try {
    await connectDB()
    
    // On utilise $push pour ajouter la note au tableau sans écraser les anciennes
    await Student.findByIdAndUpdate(studentId, {
      $push: { notes: { content: content } }
    })

    revalidatePath(`/students/${studentId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}