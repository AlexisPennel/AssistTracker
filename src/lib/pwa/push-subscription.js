import { saveSubscriptionAction } from '@/app/actions/push-action'

/**
 * Convertit la clé VAPID publique (string) en Uint8Array pour le navigateur
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Abonne l'utilisateur aux notifications push et enregistre l'abonnement en DB
 */
export async function subscribeToPush() {
  // 1. Vérifier si le Service Worker est supporté et prêt
  if (!('serviceWorker' in navigator)) {
    throw new Error('Les Service Workers ne sont pas supportés par ce navigateur.')
  }

  const registration = await navigator.serviceWorker.ready

  // 2. Vérifier si l'utilisateur est déjà abonné
  let subscription = await registration.pushManager.getSubscription()

  // 3. Si non abonné, créer l'abonnement auprès du navigateur
  if (!subscription) {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

    if (!publicKey) {
      throw new Error("La clé VAPID publique est manquante dans les variables d'environnement.")
    }

    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true, // Obligatoire pour Chrome/Android
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })
    } catch (err) {
      throw new Error("Échec de l'abonnement auprès du navigateur: " + err.message)
    }
  }

  // 4. Envoyer l'objet d'abonnement au serveur (MongoDB) via la Server Action
  // On convertit l'objet subscription en JSON pur pour éviter les erreurs de transfert
  const subData = JSON.parse(JSON.stringify(subscription))
  const result = await saveSubscriptionAction(subData)

  if (!result.success) {
    throw new Error("Impossible de sauvegarder l'abonnement en base de données.")
  }

  return subData
}
