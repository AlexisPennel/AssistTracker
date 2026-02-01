import { authOptions } from '@/lib/next-auth/auth'
import { connectDB } from '@/lib/next-auth/mongodb'
import Attendance from '@/mongo/models/Attendance'
import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json([], { status: 401 })

    const now = new Date()
    const start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0))
    const end = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59))

    const data = await Attendance.find({
      userId: session.user.id,
      date: { $gte: start, $lte: end },
    })

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
