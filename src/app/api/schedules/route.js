import { authOptions } from '@/lib/next-auth/auth'
import { connectDB } from '@/lib/next-auth/mongodb'
import Schedule from '@/mongo/models/Schedule'
import Student from '@/mongo/models/Student'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

// app/api/schedules/route.js
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

    // ✅ Pour les "once", récupérer toute la semaine
    const startOfWeek = new Date(targetDate)
    startOfWeek.setDate(
      targetDate.getDate() - targetDate.getDay() + (targetDate.getDay() === 0 ? -6 : 1)
    )
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    console.log('📅 Fetching schedules for week:', startOfWeek, 'to', endOfWeek)

    const schedules = await Schedule.find({
      userId: userId,
      $or: [
        { occurrence: 'weekly' }, // ✅ Tous les weekly (on filtrera côté client)
        { occurrence: 'once', date: { $gte: startOfWeek, $lte: endOfWeek } }, // ✅ Les "once" de la semaine
      ],
    })
      .populate({ path: 'studentId', model: Student })
      .sort({ startTime: 1 })

    return NextResponse.json(schedules.filter((s) => s.studentId !== null))
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
