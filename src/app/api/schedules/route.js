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

export async function PUT(req) {
  try {
    await connectDB()
    const data = await req.json()
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    // Convertimos dayOfWeek a número si viene en el updateData
    if (updateData.dayOfWeek) {
      updateData.dayOfWeek = parseInt(updateData.dayOfWeek)
    }

    // Para fechas únicas, aseguramos que se guarden como objeto Date
    if (updateData.occurrence === 'once' && updateData.date) {
      updateData.date = new Date(updateData.date)
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true } // Retorna el documento actualizado
    )

    return NextResponse.json(updatedSchedule)
  } catch (error) {
    console.error('❌ Error actualizando horario:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await req.json()

    // Formateamos los datos para asegurar compatibilidad con el esquema
    const newSchedule = await Schedule.create({
      userId: session.user.id,
      studentId: data.studentId,
      occurrence: data.occurrence,
      startTime: data.startTime,
      endTime: data.endTime,
      // Convertimos a número si es semanal, o a Date si es una vez
      dayOfWeek: data.occurrence === 'weekly' ? parseInt(data.dayOfWeek) : null,
      date: data.occurrence === 'once' ? new Date(data.date) : null,
    })

    return NextResponse.json(newSchedule, { status: 201 })
  } catch (error) {
    console.error('❌ Error creando horario:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtenemos el ID del horario desde los parámetros de la URL (?id=...)
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 })
    }

    // Buscamos y eliminamos el horario, asegurándonos de que pertenezca al usuario actual
    const deletedSchedule = await Schedule.findOneAndDelete({
      _id: id,
      userId: session.user.id, // Seguridad extra
    })

    if (!deletedSchedule) {
      return NextResponse.json({ error: 'Horario no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Horario eliminado con éxito' })
  } catch (error) {
    console.error('❌ Error eliminando horario:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
