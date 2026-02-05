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

    // 1. On récupère TOUTES les présences (présents ET absents) pour calculer les ratios par jour
    const allAttendance = await Attendance.find({
      userId,
      status: { $in: ['present', 'absent'] },
    })
      .populate('scheduleId')
      .lean()

    // Initialisation des compteurs par jour (1=Lun ... 7=Dom)
    const statsByDay = {
      1: { present: 0, total: 0 },
      2: { present: 0, total: 0 },
      3: { present: 0, total: 0 },
      4: { present: 0, total: 0 },
      5: { present: 0, total: 0 },
      6: { present: 0, total: 0 },
      7: { present: 0, total: 0 },
    }

    let totalRevenue = 0
    const uniqueDays = new Set()
    const monthlyMap = {}
    let globalPresentCount = 0

    allAttendance.forEach((att) => {
      const schedule = att.scheduleId
      if (!schedule) return

      const dayOfWeek = schedule.dayOfWeek

      // On incrémente le total pour ce jour
      statsByDay[dayOfWeek].total += 1

      if (att.status === 'present') {
        globalPresentCount += 1
        statsByDay[dayOfWeek].present += 1

        // Calcul revenus et moyenne (uniquement pour les présents)
        const price = schedule.price || 0
        totalRevenue += price

        const dateObj = new Date(att.date)
        const monthIndex = dateObj.getUTCMonth()
        monthlyMap[monthIndex] = (monthlyMap[monthIndex] || 0) + price
        uniqueDays.add(dateObj.toISOString().split('T')[0])
      }
    })

    // 2. Formatage du dayDistribution avec le pourcentage d'assiduité réel
    const dayDistribution = [1, 2, 3, 4, 5, 6, 7].map((d) => {
      const dayData = statsByDay[d]
      // Ratio : (Présents / Total du jour) * 100
      const percentage = dayData.total > 0 ? Math.round((dayData.present / dayData.total) * 100) : 0

      return {
        day: d,
        percentage, // C'est maintenant le taux de présence du jour
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
