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

    // --- ÉTAPE 1 : Récupérer toutes les présences 'present' de l'utilisateur ---
    // On le fait en "populate" pour être sûr de ne pas rater la jointure
    const allPresent = await Attendance.find({ userId, status: 'present' })
      .populate('scheduleId')
      .lean()

    // Si aucune donnée, on renvoie tout à zéro tout de suite
    if (!allPresent || allPresent.length === 0) {
      const activeStudents = await Student.countDocuments({ userId, active: true })
      return NextResponse.json({
        totalRevenue: 0,
        totalSessions: 0,
        dailyAverage: 0,
        attendanceRate: 0,
        activeStudents,
        revenueData: [],
        dayDistribution: [2, 3, 4, 5, 6, 7, 1].map((_, i) => ({ day: i + 1, percentage: 0 })),
      })
    }

    // --- ÉTAPE 2 : Calculs manuels (Plus fiable que l'agrégation si les noms de collections divergent) ---
    let totalRevenue = 0
    const uniqueDays = new Set()
    const monthlyMap = {}
    const dayMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } // 1=Dim, 7=Sam

    allPresent.forEach((att) => {
      const price = att.scheduleId?.price || 0
      totalRevenue += price

      // Date tracking
      const dateObj = new Date(att.date)
      uniqueDays.add(dateObj.toISOString().split('T')[0])

      // Monthly tracking
      const month = dateObj.getMonth() // 0-11
      monthlyMap[month] = (monthlyMap[month] || 0) + price

      // Day of week tracking
      const day = dateObj.getDay() + 1 // Convert to 1-7 (1=Sun)
      dayMap[day] += price
    })

    // --- ÉTAPE 3 : Taux de présence ---
    const totalRecords = await Attendance.countDocuments({
      userId,
      status: { $in: ['present', 'absent'] },
    })
    const attendanceRate =
      totalRecords > 0 ? Math.round((allPresent.length / totalRecords) * 100) : 0

    // --- ÉTAPE 4 : Formatage pour le frontend ---
    const monthNames = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ]
    const revenueData = Object.keys(monthlyMap)
      .map((m) => ({
        month: monthNames[parseInt(m)],
        amount: monthlyMap[m],
      }))
      .sort((a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month))

    const dayDistribution = [2, 3, 4, 5, 6, 7].map((mongoDay, index) => {
      const revenue = dayMap[mongoDay] || 0
      const percentage = totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0
      return { day: index + 1, percentage }
    })

    const activeStudents = await Student.countDocuments({ userId, active: true })

    return NextResponse.json({
      totalRevenue,
      totalSessions: allPresent.length,
      dailyAverage: Math.round(totalRevenue / (uniqueDays.size || 1)),
      attendanceRate,
      activeStudents,
      revenueData,
      dayDistribution,
    })
  } catch (error) {
    console.error('❌ Stats Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
