import { authOptions } from '@/lib/next-auth/auth'
import { connectDB } from '@/lib/next-auth/mongodb'
import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'

import Schedule from '@/mongo/models/Schedule'
import Student from '@/mongo/models/Student'

export async function GET(req) {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id

    // 1. OBTENER LA FECHA DE LA QUERY
    const { searchParams } = new URL(req.url)
    const dateQuery = searchParams.get('date') // "YYYY-MM-DD"

    let targetDate
    if (dateQuery) {
      // Importante: parsear manualmente para evitar que JS lo trate como UTC
      const [year, month, day] = dateQuery.split('-').map(Number)
      // Mes es 0-indexado en JS
      targetDate = new Date(year, month - 1, day)
    } else {
      // Si no hay fecha, usamos la hora actual pero ajustada a la zona horaria local
      targetDate = new Date()
    }

    // 2. LÓGICA DE FECHAS EN TIEMPO LOCAL (No UTC)
    const targetDayOfWeek = targetDate.getDay()

    // Definir el inicio y fin del día en la zona horaria del servidor/cliente
    const startOfTarget = new Date(targetDate)
    startOfTarget.setHours(0, 0, 0, 0)

    const endOfTarget = new Date(targetDate)
    endOfTarget.setHours(23, 59, 59, 999)

    // 3. CONSULTA DINÁMICA
    const _forceRegister = Student.modelName

    const schedules = await Schedule.find({
      userId: userId,
      $or: [
        // Clases semanales: usamos el día de la semana local
        { occurrence: 'weekly', dayOfWeek: targetDayOfWeek },
        // Clases únicas: buscamos en el rango local del día
        {
          occurrence: 'once',
          date: {
            $gte: startOfTarget,
            $lte: endOfTarget,
          },
        },
      ],
    })
      .populate({
        path: 'studentId',
        model: Student,
      })
      .sort({ startTime: 1 })

    const validSchedules = schedules.filter((s) => s.studentId !== null)

    return NextResponse.json(validSchedules)
  } catch (error) {
    console.error('❌ Error en API Schedules:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
