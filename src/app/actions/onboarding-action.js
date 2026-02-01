'use server'

import { authOptions } from '@/lib/next-auth/auth'
import { connectDB } from '@/lib/next-auth/mongodb'
import Parameters from '@/mongo/models/Parameters'
import Stats from '@/mongo/models/Stats'
import User from '@/mongo/models/User'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

export async function completeOnboardingAction(data) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error('Session expirée')

    await connectDB()
    const userId = session.user.id

    // 1. Extraction et formatage des données du formulaire
    const cigarettesPerDay = Number(data.cigarettesPerDay) // Ex: 40
    const dailyGoal = Number(data.dailyGoal)
    const packPrice = Number(data.packPrice) // Ex: 70
    const currency = data.currency || 'EUR'
    const timezone = data.timezone || 'Europe/Paris'

    // 2. Calcul du budget quotidien (Daily Savings initial)
    // Logique : (Prix du paquet / 20) * Nombre de cigarettes fumées par jour
    const pricePerCigarette = packPrice / 20
    const initialDailySavings = Number((cigarettesPerDay * pricePerCigarette).toFixed(2))

    // 3. Mise à jour ou Création des Paramètres (Upsert)
    // On utilise findOneAndUpdate pour écraser toute tentative précédente
    await Parameters.findOneAndUpdate(
      { userId },
      {
        userId,
        cigarettesPerDay,
        dailyGoal,
        pack: {
          price: packPrice,
          currency,
          cigarettesPerPack: 20,
        },
        timezone,
        onboardingCompleted: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    // 4. Initialisation des Stats
    // On commence avec le budget plein (ex: 140 pesos) et 0 d'économies cumulées
    await Stats.findOneAndUpdate(
      { userId },
      {
        userId,
        dailySavings: initialDailySavings,
        totalSavings: 0,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    )

    // 5. Validation finale sur le profil User
    const userUpdate = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { onboardingCompleted: true } },
      { new: true }
    )

    if (!userUpdate) throw new Error('Utilisateur introuvable dans la base')

    console.log(
      `✅ Onboarding réussi pour ${userId} (${timezone}) - Budget: ${initialDailySavings}`
    )

    // Rafraîchissement des routes pour le Middleware
    revalidatePath('/', 'layout')

    return { success: true }
  } catch (error) {
    console.error('❌ Erreur Onboarding Action:', error.message)
    throw new Error(error.message || "Erreur lors de l'enregistrement")
  }
}
