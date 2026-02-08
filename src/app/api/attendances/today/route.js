// app/api/attendances/today/route.js
import { authOptions } from '@/lib/next-auth/auth'
import { connectDB } from '@/lib/next-auth/mongodb'
import Attendance from '@/mongo/models/Attendance'
import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json([], { status: 401 })

    // ✅ Récupérer les 30 derniers jours
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const data = await Attendance.find({
      userId: session.user.id,
      date: { $gte: startDate, $lte: endDate },
    }).lean()

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
