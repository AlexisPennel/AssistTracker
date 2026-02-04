import { authOptions } from '@/lib/next-auth/auth'
import { connectDB } from '@/lib/next-auth/mongodb'
import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'

import Schedule from '@/mongo/models/Schedule'
import Student from '@/mongo/models/Student'

// GET : Récupération (déjà fonctionnelle, le prix sera inclus automatiquement par Mongoose)
export async function GET(req) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(req.url)
    const dateQuery = searchParams.get('date')

    let targetDate = dateQuery
      ? new Date(
          dateQuery.split('-').map(Number)[0],
          dateQuery.split('-').map(Number)[1] - 1,
          dateQuery.split('-').map(Number)[2]
        )
      : new Date()
    const targetDayOfWeek = targetDate.getDay()
    const startOfTarget = new Date(targetDate).setHours(0, 0, 0, 0)
    const endOfTarget = new Date(targetDate).setHours(23, 59, 59, 999)

    const schedules = await Schedule.find({
      userId: userId,
      $or: [
        { occurrence: 'weekly', dayOfWeek: targetDayOfWeek },
        { occurrence: 'once', date: { $gte: startOfTarget, $lte: endOfTarget } },
      ],
    })
      .populate({ path: 'studentId', model: Student })
      .sort({ startTime: 1 })

    return NextResponse.json(schedules.filter((s) => s.studentId !== null))
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT : Mise à jour du créneau (incluant le prix)
export async function PUT(req) {
  try {
    await connectDB()
    const data = await req.json()
    const { id, ...updateData } = data

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    // Conversion des types pour la sécurité
    if (updateData.dayOfWeek !== undefined) updateData.dayOfWeek = parseInt(updateData.dayOfWeek)
    if (updateData.price !== undefined) updateData.price = Number(updateData.price) // <--- AJOUT

    if (updateData.occurrence === 'once' && updateData.date) {
      updateData.date = new Date(updateData.date)
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )

    return NextResponse.json(updatedSchedule)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST : Création d'un nouveau créneau (incluant le prix)
export async function POST(req) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const data = await req.json()

    const newSchedule = await Schedule.create({
      userId: session.user.id,
      studentId: data.studentId,
      occurrence: data.occurrence,
      startTime: data.startTime,
      endTime: data.endTime,
      price: Number(data.price) || 50, // <--- AJOUT (avec valeur par défaut)
      dayOfWeek: data.occurrence === 'weekly' ? parseInt(data.dayOfWeek) : null,
      date: data.occurrence === 'once' ? new Date(data.date) : null,
    })

    return NextResponse.json(newSchedule, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE : Suppression (inchangé mais reste nécessaire)
export async function DELETE(req) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    const deletedSchedule = await Schedule.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    })

    return NextResponse.json({ message: 'Eliminado' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
