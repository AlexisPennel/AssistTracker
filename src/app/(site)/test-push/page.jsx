'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { subscribeToPush } from '@/lib/pwa/push-subscription'
import { Bell, Send } from 'lucide-react'
import { useState } from 'react'
// Importation de la server action pour le test
import { sendTestNotificationAction } from '@/app/actions/push-action'

export default function TestPushPage() {
  const [status, setStatus] = useState('Prêt')
  const [loading, setLoading] = useState(false)

  // Étape 1 : S'abonner (déjà fonctionnel chez toi)
  const handleSubscribe = async () => {
    setLoading(true)
    setStatus('Demande de permission...')
    try {
      const sub = await subscribeToPush()
      console.log('Abonnement réussi:', sub)
      setStatus('Abonné avec succès ! (Vérifie MongoDB)')
    } catch (error) {
      console.error(error)
      setStatus('Erreur: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Étape 2 : Envoyer le test (Le nouveau bouton)
  const handleSendTest = async () => {
    setLoading(true)
    setStatus('Envoi de la notification en cours...')
    try {
      const result = await sendTestNotificationAction()
      if (result.success) {
        setStatus('Notification envoyée avec succès ! 🚀')
      } else {
        setStatus('Erreur serveur: ' + result.error)
      }
    } catch (error) {
      console.error(error)
      setStatus('Erreur client: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="text-primary h-5 w-5" /> Push Lab
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-accent rounded-lg border p-4 font-mono text-sm">
            Statut: <span className="font-bold text-green-600 italic">{status}</span>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSubscribe}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              S&apos;abonner (Browser & DB)
            </Button>

            <Button onClick={handleSendTest} className="w-full gap-2" disabled={loading}>
              <Send className="h-4 w-4" /> Envoyer une notification
            </Button>
          </div>

          <p className="text-muted-foreground text-center text-[11px] leading-tight">
            Important : Pour recevoir la notification sur Android, l'écran peut être éteint, mais
            assure-toi que ton Service Worker est bien enregistré.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
