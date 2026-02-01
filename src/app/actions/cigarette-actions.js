'use server'

import { authOptions } from '@/lib/next-auth/auth'
import { connectDB } from '@/lib/next-auth/mongodb'
import Log from '@/mongo/models/Log'
import UserParameters from '@/mongo/models/Parameters'
import Stats from '@/mongo/models/Stats'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

/**
 * Action pour enregistrer une cigarette
 */
export async function addCigaretteAction() {
  await connectDB()

  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Non autorisé')
  const userId = session.user.id

  // 1. Récupérer les paramètres pour connaître le prix et le fuseau horaire
  const params = await UserParameters.findOne({ userId })
  if (!params) throw new Error('Paramètres introuvables')

  // DÉTERMINATION DE LA DATE LOCALE
  // On utilise le fuseau enregistré ou Paris par défaut
  const userTimeZone = params.timezone || 'Europe/Paris'
  const todayStr = new Date().toLocaleDateString('fr-CA', { timeZone: userTimeZone })

  // Calcul du prix par cigarette
  const price = params.pack?.price || 0
  const countInPack = params.pack?.cigarettesPerPack || 20
  const pricePerCig = price / countInPack
  const deduction = Number(pricePerCig.toFixed(2))

  // 2. Enregistrer le Log (historique)
  await Log.create({
    userId,
    smokedAt: new Date(), // Date système complète pour le tri
    dateString: todayStr, // Date locale YYYY-MM-DD pour les filtres du jour
  })

  // 3. Mise à jour du budget
  await Stats.findOneAndUpdate(
    { userId },
    {
      $inc: {
        dailySavings: -deduction,
      },
      $set: { updatedAt: new Date() },
    },
    { upsert: true }
  )

  revalidatePath('/')
}

/**
 * Suppression d'une cigarette (Remboursement)
 */
export async function deleteCigaretteAction(logId) {
  await connectDB()
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Non autorisé')

  // 1. Trouver le log
  const log = await Log.findOne({ _id: logId, userId: session.user.id })
  if (!log) return

  // 2. Récupérer les prix
  const params = await UserParameters.findOne({ userId: session.user.id })
  const pricePerCig = (params.pack?.price || 0) / (params.pack?.cigarettesPerPack || 20)
  const refund = Number(pricePerCig.toFixed(2))

  // 3. Supprimer et recréditer
  await Log.findByIdAndDelete(logId)
  await Stats.findOneAndUpdate({ userId: session.user.id }, { $inc: { dailySavings: refund } })

  revalidatePath('/')
}
