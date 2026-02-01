'use client'

import { completeOnboardingAction } from '@/app/actions/onboarding-action'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Globe, Loader2 } from 'lucide-react'

// Liste simplifiée des fuseaux courants (optionnel, on peut aussi laisser l'input libre)
const COMMON_TIMEZONES = [
  'Europe/Paris',
  'America/Mexico_City',
  'America/New_York',
  'America/Los_Angeles',
  'Africa/Casablanca',
  'Europe/London',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    cigarettesPerDay: '',
    dailyGoal: '',
    packPrice: '',
    currency: 'EUR',
    timezone: '',
  })

  // Détection automatique au montage du composant
  useEffect(() => {
    const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setForm((prev) => ({ ...prev, timezone: detectedTz }))
  }, [])

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await completeOnboardingAction(form)
      router.push('/')
      router.refresh()
    } catch (error) {
      alert('Erreur : ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        {step === 1 && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Bienvenue</CardTitle>
              <CardDescription>
                Reprenez le contrôle de votre budget et de votre santé dès aujourd'hui.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg" onClick={() => setStep(2)}>
                Commencer
              </Button>
            </CardContent>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Vos habitudes</CardTitle>
              <CardDescription>
                Ces données permettent de calculer vos économies en temps réel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* --- SECTION CONSOMMATION --- */}
                <div className="space-y-2">
                  <Label htmlFor="cigs">Consommation actuelle (cigs/jour)</Label>
                  <Input
                    id="cigs"
                    type="number"
                    min="1"
                    placeholder="Ex: 40"
                    value={form.cigarettesPerDay}
                    onChange={(e) => handleChange('cigarettesPerDay', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Objectif maximum souhaité</Label>
                  <Input
                    id="goal"
                    type="number"
                    min="0"
                    placeholder="Ex: 10"
                    value={form.dailyGoal}
                    onChange={(e) => handleChange('dailyGoal', e.target.value)}
                    required
                  />
                </div>

                {/* --- SECTION PRIX ET DEVISE --- */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Prix du paquet</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="70"
                      value={form.packPrice}
                      onChange={(e) => handleChange('packPrice', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Devise</Label>
                    <Select
                      value={form.currency}
                      onValueChange={(value) => handleChange('currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="MXN">MXN ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* --- SECTION TIMEZONE (Modification possible) --- */}
                <div className="space-y-2 border-t pt-4">
                  <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-slate-500" />
                    Fuseau horaire pour le reset quotidien
                  </Label>
                  <Select
                    value={form.timezone}
                    onValueChange={(value) => handleChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* On affiche la zone détectée en premier si elle n'est pas dans la liste commune */}
                      {!COMMON_TIMEZONES.includes(form.timezone) && form.timezone && (
                        <SelectItem value={form.timezone}>{form.timezone} (Détecté)</SelectItem>
                      )}
                      {COMMON_TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-slate-500 italic">
                    Vos économies journalières seront remises à zéro selon cette heure locale.
                  </p>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Configuration...
                    </>
                  ) : (
                    'Terminer'
                  )}
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </main>
  )
}
