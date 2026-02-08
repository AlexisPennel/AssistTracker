// app/api/stats/route.js
import { authOptions } from '@/lib/next-auth/auth'
import { connectDB } from '@/lib/next-auth/mongodb'
import Attendance from '@/mongo/models/Attendance'
import Student from '@/mongo/models/Student'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id

    const allAttendance = await Attendance.find({
      userId,
      status: { $in: ['present', 'absent'] },
    })
      .populate('scheduleId')
      .lean()

    console.log('📊 Total attendances:', allAttendance.length)

    // ✅ Initialisation avec 1=Lun, 2=Mar, ..., 7=Dom
    const statsByDay = {
      1: { present: 0, total: 0 }, // Lundi
      2: { present: 0, total: 0 }, // Mardi
      3: { present: 0, total: 0 }, // Mercredi
      4: { present: 0, total: 0 }, // Jeudi
      5: { present: 0, total: 0 }, // Vendredi
      6: { present: 0, total: 0 }, // Samedi
      7: { present: 0, total: 0 }, // Dimanche
    }

    let totalRevenue = 0
    const uniqueDays = new Set()
    const monthlyMap = {}
    let globalPresentCount = 0

    allAttendance.forEach((att) => {
      const schedule = att.scheduleId
      if (!schedule) {
        console.warn('⚠️ Attendance sans schedule:', att._id)
        return
      }

      // ✅ CONVERSION: 0-6 (Dom-Sam) → 1-7 (Lun-Dom)
      // 0 (Dimanche) → 7
      // 1 (Lundi) → 1
      // 2 (Mardi) → 2
      // ...
      // 6 (Samedi) → 6
      const dayOfWeekModel = schedule.dayOfWeek // 0-6
      const dayOfWeekStats = dayOfWeekModel === 0 ? 7 : dayOfWeekModel // 1-7

      console.log(`📅 Schedule dayOfWeek: ${dayOfWeekModel} → Stats day: ${dayOfWeekStats}`)

      // On incrémente le total pour ce jour
      statsByDay[dayOfWeekStats].total += 1

      if (att.status === 'present') {
        globalPresentCount += 1
        statsByDay[dayOfWeekStats].present += 1

        const price = schedule.price || 0
        totalRevenue += price

        const dateObj = new Date(att.date)
        const monthIndex = dateObj.getUTCMonth()
        monthlyMap[monthIndex] = (monthlyMap[monthIndex] || 0) + price
        uniqueDays.add(dateObj.toISOString().split('T')[0])
      }
    })

    console.log('📊 Stats by day:', statsByDay)

    // Formatage du dayDistribution
    const dayDistribution = [1, 2, 3, 4, 5, 6, 7].map((d) => {
      const dayData = statsByDay[d]
      const percentage = dayData.total > 0 ? Math.round((dayData.present / dayData.total) * 100) : 0

      return {
        day: d,
        percentage,
        present: dayData.present,
        total: dayData.total,
      }
    })

    const attendanceRate =
      allAttendance.length > 0 ? Math.round((globalPresentCount / allAttendance.length) * 100) : 0

    const activeStudents = await Student.countDocuments({ userId, active: true })

    return NextResponse.json({
      totalRevenue,
      totalSessions: globalPresentCount,
      dailyAverage: Math.round(totalRevenue / (uniqueDays.size || 1)),
      attendanceRate,
      activeStudents,
      revenueData: Object.keys(monthlyMap).map((m) => ({
        month: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][
          m
        ],
        amount: monthlyMap[m],
      })),
      dayDistribution,
    })
  } catch (error) {
    console.error('❌ Stats Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
