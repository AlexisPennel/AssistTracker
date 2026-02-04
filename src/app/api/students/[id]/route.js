import { authOptions } from '@/lib/next-auth/auth'
import { connectDB } from '@/lib/next-auth/mongodb'
import Student from '@/mongo/models/Student'
import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
  // La signature reste la même
  try {
    await connectDB()
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // --- LA CORRECTION EST ICI ---
    const resolvedParams = await params
    const id = resolvedParams.id
    // -----------------------------

    const student = await Student.findOne({
      _id: id,
      userId: session.user.id,
    })

    if (!student) {
      return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('❌ Error API Student ID:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
