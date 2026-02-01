'use server'

import { authOptions } from '@/lib/next-auth/auth'
import { connectDB } from '@/lib/next-auth/mongodb'
import Subscription from '@/mongo/models/Subscription'
import { getServerSession } from 'next-auth'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:votre@email.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

/**
 * Sauvegarde ou met à jour l'abonnement
 */
export async function saveSubscriptionAction(subscription) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error('Non authentifié')
    await connectDB()
    await Subscription.findOneAndUpdate(
      { userId: session.user.id },
      { userId: session.user.id, subscription },
      { upsert: true, new: true }
    )
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Fonction générique pour envoyer une notification à l'utilisateur connecté
 */
export async function sendNotificationAction({ title, body, url = '/' }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error('Non authentifié')

    await connectDB()
    const subDoc = await Subscription.findOne({ userId: session.user.id })

    if (!subDoc) return { success: false, error: 'Aucun abonnement trouvé.' }

    const payload = JSON.stringify({
      title,
      body,
      url,
      icon: '/favicon/web-app-manifest-192x192.png',
      badge: '/pwa/badge.png', // Ton nouveau badge silhouette
    })

    await webpush.sendNotification(subDoc.subscription, payload)
    return { success: true }
  } catch (error) {
    console.error('Push error:', error)
    return { success: false, error: error.message }
  }
}

// On garde celle-ci pour tes tests rapides dans le Push Lab
export async function sendTestNotificationAction() {
  return sendNotificationAction({
    title: 'Test réussi ! 🎉',
    body: 'Ceci est une notification avec icône.',
  })
}
