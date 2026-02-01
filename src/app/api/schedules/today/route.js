import { authOptions } from '@/lib/next-auth/auth'
import { connectDB } from '@/lib/next-auth/mongodb'
import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'

// Importación de modelos para asegurar el registro en Mongoose
import Schedule from '@/mongo/models/Schedule'
import Student from '@/mongo/models/Student'

export async function GET() {
  try {
    await connectDB()

    // Verificación de sesión
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id

    // --- LÓGICA DE FECHAS ---
    const now = new Date()
    const todayDay = now.getDay() // 0 = Domingo, 1 = Lunes, etc.

    const year = now.getFullYear()
    const month = now.getMonth()
    const day = now.getDate()

    // Rango UTC para cubrir el día completo de hoy
    const startOfToday = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
    const endOfToday = new Date(Date.UTC(year, month, day, 23, 59, 59, 999))

    // --- CONSULTA ---
    // Forzamos a Mongoose a reconocer el modelo Student antes del populate
    const _forceRegister = Student.modelName

    const schedules = await Schedule.find({
      userId: userId, // Filtro por dueño de los datos
      $or: [
        { occurrence: 'weekly', dayOfWeek: todayDay },
        {
          occurrence: 'once',
          date: { $gte: startOfToday, $lte: endOfToday },
        },
      ],
    })
      .populate({
        path: 'studentId',
        model: Student, // Referencia directa al modelo importado
      })
      .sort({ startTime: 1 })

    // Limpiamos resultados donde el estudiante haya sido borrado
    const validSchedules = schedules.filter((s) => s.studentId !== null)

    return NextResponse.json(validSchedules)
  } catch (error) {
    console.error('❌ Error en API Today:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
