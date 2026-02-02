import { connectDB } from '@/lib/next-auth/mongodb'
import Schedule from '@/mongo/models/Schedule'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
  try {
    await connectDB()

    // 1. En Next.js 15+, params es una promesa
    const resolvedParams = await params
    const id = resolvedParams.id

    if (!id) {
      console.error('❌ API: No se recibió el ID')
      return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 })
    }

    // 2. Buscar horarios.
    // Asegúrate de que en tu base de datos el campo es 'studentId'
    const schedules = await Schedule.find({ studentId: id }).sort({
      dayOfWeek: 1,
      startTime: 1,
    })

    return NextResponse.json(schedules)
  } catch (error) {
    console.error('❌ Error en la API de schedules por estudiante:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}
