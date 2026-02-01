'use client'

import { addCigaretteAction } from '@/app/actions/cigarette-actions'
import { sendNotificationAction } from '@/app/actions/push-action'
import { Button } from '@/components/ui/button'
import { ChartContainer } from '@/components/ui/chart'
import { useCigaretteLogs } from '@/context/CigaretteLogsContext'
import { useStats } from '@/context/StatsContext'
import { useUserParameters } from '@/context/UserParametersContext' // Import pour le timezone
import { useNextCigaretteTimer } from '@/hooks/useNextCigaretteTimer'
import { AlertTriangle, Clock, Loader2, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Label, Pie, PieChart } from 'recharts'

const chartConfig = {
  smoked: { label: 'Fumées', color: 'hsl(var(--chart-1))' },
  remaining: { label: 'Restantes', color: 'hsl(var(--muted))' },
}

const CigarettesGoalChart = ({ smoked, goal, lastCigaretteAt }) => {
  const { refreshLogs } = useCigaretteLogs()
  const { refreshStats } = useStats()
  const { parameters } = useUserParameters()

  const safeGoal = goal > 0 ? goal : 1
  const safeSmoked = Math.min(smoked, safeGoal)
  const [isPending, setIsPending] = useState(false)
  const [now, setNow] = useState(new Date())

  // Timezone de l'utilisateur (fallback sur Paris)
  const userTimeZone = parameters?.timezone || 'Europe/Paris'

  // Mise à jour de l'horloge interne
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const chartData = [
    { name: 'smoked', value: safeSmoked, fill: 'var(--chart-1)' },
    { name: 'remaining', value: Math.max(safeGoal - safeSmoked, 0), fill: 'var(--muted)' },
  ]

  const lastSmokeDate = lastCigaretteAt?.smokedAt || lastCigaretteAt
  const lastCigaretteId = lastSmokeDate ? new Date(lastSmokeDate).getTime().toString() : 'none'

  const { minutes, seconds, isReady } = useNextCigaretteTimer({
    lastCigaretteAt: lastSmokeDate,
    dailyGoal: safeGoal,
  })

  // --------------------
  // GESTION NOTIFICATIONS (CORRIGÉE)
  // --------------------
  useEffect(() => {
    // 1. SÉCURITÉS :
    // On ne notifie QUE si :
    // - On a fumé au moins une cigarette (smoked > 0)
    // - On n'a pas dépassé l'objectif (smoked < goal)
    // - Le timer est prêt ET il est réellement à 0 (minutes === 0 && seconds === 0)
    const isTimerZero = minutes === 0 && seconds === 0
    console.log('isTimerZero ? ', isTimerZero)

    if (!isReady || !isTimerZero || smoked >= goal || smoked === 0) return

    const alreadyNotifiedId = localStorage.getItem('last_notified_timer_id')

    if (alreadyNotifiedId !== lastCigaretteId && lastCigaretteId !== 'none') {
      sendNotificationAction({
        title: 'Intervalle terminé ! ✅',
        body: "Tu as respecté ton temps d'attente. Ta volonté se renforce !",
        url: '/',
      }).then((res) => {
        if (res?.success) {
          localStorage.setItem('last_notified_timer_id', lastCigaretteId)
        }
      })
    }
  }, [isReady, minutes, seconds, smoked, goal, lastCigaretteId])

  const handleAddCigarette = async () => {
    try {
      setIsPending(true)
      await addCigaretteAction()
      await Promise.all([refreshLogs(), refreshStats()])
    } catch (error) {
      console.error('Erreur :', error)
    } finally {
      setIsPending(false)
    }
  }

  // Identifiant de journée identique au serveur pour test
  const serverDateDebug = now.toLocaleDateString('fr-CA', { timeZone: userTimeZone })
  const serverTimeDebug = now.toLocaleTimeString('fr-FR', {
    timeZone: userTimeZone,
    hour: '2-digit',
    minute: '2-digit',
  })

  // --------------------
  // UI LOGIQUE BOUTON
  // --------------------
  let buttonVariant = 'default'
  let buttonClass = 'w-full max-w-sm gap-2 transition-all duration-500 font-medium'
  let buttonContent

  if (isPending) {
    buttonContent = (
      <>
        <Loader2 className="size-4 animate-spin" /> Enregistrement...
      </>
    )
  } else if (smoked >= goal) {
    buttonVariant = 'destructive'
    buttonContent = (
      <>
        <AlertTriangle size={18} /> Objectif atteint (+{smoked - goal})
      </>
    )
  } else if (!isReady) {
    buttonVariant = 'destructive'
    buttonContent = (
      <>
        <Clock size={18} className="animate-pulse" /> Attendre {minutes}m{' '}
        {seconds.toString().padStart(2, '0')}s.
      </>
    )
  } else {
    buttonVariant = 'default'
    buttonContent = (
      <>
        <Plus size={18} /> Ajouter une cigarette
      </>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* DEBUG TIMEZONE DISCRET */}
      <div className="transition-opacit flex flex-col items-center pt-2">
        <div className="bg-muted/50 border-border/50 flex items-center gap-2 rounded-md border px-2 py-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
          <p className="font-mono text-[10px] tracking-tighter uppercase">
            {serverDateDebug} <span className="mx-1 opacity-30">|</span> {serverTimeDebug}{' '}
            <span className="mx-1 opacity-30">|</span> {userTimeZone}
          </p>
        </div>
      </div>

      <ChartContainer
        config={chartConfig}
        className="relative aspect-square h-[180px] w-full max-w-[180px]"
      >
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            strokeWidth={0}
            innerRadius={55}
            outerRadius={80}
            startAngle={90}
            endAngle={-270}
          >
            <Label
              content={({ viewBox }) => {
                if (!viewBox?.cx || !viewBox?.cy) return null
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan className="fill-foreground text-3xl font-bold">{smoked}</tspan>
                    <tspan className="fill-muted-foreground text-sm font-medium">/{safeGoal}</tspan>
                  </text>
                )
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>

      <div className="flex w-full flex-col items-center gap-3">
        {/* <NotificationPrompt /> */}
        <Button
          className={buttonClass}
          variant={buttonVariant}
          onClick={handleAddCigarette}
          disabled={isPending}
        >
          {buttonContent}
        </Button>

        <div className="min-h-[40px] px-4">
          {isPending ? null : isReady && smoked < goal ? (
            <p className="text-muted-foreground max-w-[280px] text-center text-xs text-balance">
              Vous avez respecté l'intervalle ! Chaque minute supplémentaire gagnée renforce votre
              volonté.
            </p>
          ) : smoked < goal ? (
            <p className="text-muted-foreground max-w-[280px] text-center text-[11px] leading-tight text-balance italic">
              L'intervalle n'est pas terminé, mais vous pouvez cliquer pour enregistrer une
              cigarette.
            </p>
          ) : (
            <p className="text-destructive max-w-[280px] text-center text-[11px] leading-tight font-medium text-balance">
              Attention : toute cigarette supplémentaire impacte vos économies.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default CigarettesGoalChart
