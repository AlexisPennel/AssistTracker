'use server'
import { authOptions } from '@/lib/next-auth/auth'
import { connectDB } from '@/lib/next-auth/mongodb'
import Parameters from '@/mongo/models/Parameters'
import Stats from '@/mongo/models/Stats'
import { getServerSession } from 'next-auth'

export async function syncStatsAction() {
  await connectDB()
  const session = await getServerSession(authOptions)
  const userId = session.user.id

  const stats = await Stats.findOne({ userId })
  const params = await Parameters.findOne({ userId })

  const today = new Date().toDateString()
  const lastUpdate = stats?.updatedAt ? new Date(stats.updatedAt).toDateString() : null

  // Si c'est un nouveau jour (ou première fois)
  if (today !== lastUpdate) {
    const pricePerCig = params.pack.price / params.pack.cigarettesPerPack
    const savingsToday = (params.cigarettesPerDayBefore - params.dailyGoal) * pricePerCig

    await Stats.findOneAndUpdate(
      { userId },
      {
        $set: {
          dailySavings: savingsToday, // On reset au gain théorique
          updatedAt: new Date(),
        },
        $inc: { totalSavings: savingsToday }, // On ajoute le gain du jour au total
      },
      { upsert: true }
    )
  }
}
