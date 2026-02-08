import { authOptions } from '@/lib/next-auth/auth'
import { connectDB } from '@/lib/next-auth/mongodb'
import Schedule from '@/mongo/models/Schedule'
import Student from '@/mongo/models/Student' // Important pour le .populate()
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

// --- GET : Récupérer les horaires ---
export async function GET(req) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const dateQuery = searchParams.get('date')

    let targetDate = dateQuery ? new Date(dateQuery) : new Date()

    const startOfWeek = new Date(targetDate)
    startOfWeek.setDate(
      targetDate.getDate() - targetDate.getDay() + (targetDate.getDay() === 0 ? -6 : 1)
    )
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const schedules = await Schedule.find({
      userId: session.user.id,
      $or: [
        { occurrence: 'weekly' },
        { occurrence: 'once', date: { $gte: startOfWeek, $lte: endOfWeek } },
      ],
    })
      .populate({ path: 'studentId', model: Student })
      .sort({ startTime: 1 })

    return NextResponse.json(schedules.filter((s) => s.studentId !== null))
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// --- PUT : Modifier un horaire ---
export async function PUT(req) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const data = await req.json()
    const { id, ...updateData } = data

    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

    const updatedSchedule = await Schedule.findOneAndUpdate(
      { _id: id, userId: session.user.id }, // Sécurité: vérifie que l'user possède l'item
      updateData,
      { new: true }
    )

    return NextResponse.json(updatedSchedule)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// --- DELETE : Supprimer un horaire ---
export async function DELETE(req) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

    await Schedule.findOneAndDelete({ _id: id, userId: session.user.id })

    return NextResponse.json({ message: 'Horario eliminado' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
