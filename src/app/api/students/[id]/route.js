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

export async function DELETE(req, { params }) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const id = resolvedParams.id

    // On supprime l'élève uniquement s'il appartient à l'utilisateur
    const deletedStudent = await Student.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    })

    if (!deletedStudent) {
      return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })
    }

    // Optionnel : Tu pourrais aussi vouloir supprimer les horaires (Schedules) 
    // liés à cet élève ici si ton modèle ne le fait pas en cascade.

    return NextResponse.json({ message: 'Alumno eliminado correctamente' })
  } catch (error) {
    console.error('❌ Error API Student DELETE:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}