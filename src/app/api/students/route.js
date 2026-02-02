import { authOptions } from '@/lib/next-auth/auth'
import { connectDB } from '@/lib/next-auth/mongodb'
import Schedule from '@/mongo/models/Schedule'
import Student from '@/mongo/models/Student'
import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'

// GET: Obtener todos los alumnos del usuario autenticado
export async function GET() {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id

    // Buscamos alumnos que pertenezcan a este profesor
    // Nota: Asegúrate de que tu modelo Student tenga el campo userId
    const students = await Student.find({ userId }).sort({ name: 1 })

    return NextResponse.json(students)
  } catch (error) {
    console.error('❌ Error en GET Students:', error)
    return NextResponse.json({ error: 'Error al obtener alumnos' }, { status: 500 })
  }
}

// POST: Crear un nuevo alumno (si quieres usarlo fuera del diálogo de schedule)
export async function POST(req) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await req.json()
    const { name, price } = data

    const newStudent = await Student.create({
      name,
      price: Number(price),
      userId: session.user.id,
    })

    return NextResponse.json(newStudent, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Eliminar un alumno y todos sus horarios asociados
export async function DELETE(req) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('id')

    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    // 1. Eliminar todos los horarios (Schedules) de este alumno
    await Schedule.deleteMany({ studentId: studentId })

    // 2. Eliminar al alumno
    await Student.findByIdAndDelete(studentId)

    return NextResponse.json({ message: 'Alumno y horarios eliminados correctamente' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
