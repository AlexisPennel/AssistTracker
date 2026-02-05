'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

// Import de tes images de cercles
// import circles1 from '../../../../../../public/images/circles.svg'
// import circles2 from '../../../../../../public/images/circles2.svg'

// --- UTILITAIRE : Cercle de progression ---
const CircularProgress = ({ percentage, size = 45, strokeWidth = 5 }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg className="rotate-[-90deg]" width={size} height={size}>
        <circle
          className="text-[#f1f5f0]"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-[#9DB37E] transition-all duration-500 ease-in-out"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
    </div>
  )
}

export default function StatsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const colors = ['bg-[#EAEBDD]', 'bg-[#DEECDB]', 'bg-[#E8E2FE]', 'bg-[#C9E5E8]']
  const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats')
        const data = await res.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#9DB37E]" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10 px-4 py-8 pb-24">
      {/* --- SECTION 1: KPI (Format DashboardStats) --- */}
      <div className="space-y-4">
        <header className="px-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Estadísticas</h1>
        </header>

        <div className="grid grid-cols-2 gap-4">
          {/* Bloc Revenus */}
          <Card className="rounded-2xl border-none bg-[#EAEBDD] px-4 py-3 shadow-none">
            <CardContent className="flex flex-col gap-2 p-0">
              <span className="text-sm font-medium opacity-60">Ingresos Totales</span>
              <p className="text-xl leading-none font-semibold">{stats?.totalRevenue || 0}€</p>
            </CardContent>
          </Card>

          {/* Bloc Assistance */}
          <Card className="rounded-2xl border-none bg-[#EAEBDD] px-4 py-3 shadow-none">
            <CardContent className="text-foreground flex items-center justify-between p-0">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium opacity-60">Asistencia</span>
                <p className="text-xl leading-none font-semibold">{stats?.attendanceRate || 0}%</p>
              </div>
              <CircularProgress percentage={stats?.attendanceRate || 0} size={42} strokeWidth={5} />
            </CardContent>
          </Card>

          {/* Bloc Moyenne (Nouveau) */}
          <Card className="rounded-2xl border-none bg-[#EAEBDD] px-4 py-3 shadow-none">
            <CardContent className="flex flex-col gap-2 p-0">
              <span className="text-sm font-medium opacity-60">Promedio / Día</span>
              <p className="text-xl leading-none font-semibold">{stats?.dailyAverage || 0}€</p>
            </CardContent>
          </Card>

          {/* Bloc Sessions (Nouveau) */}
          <Card className="rounded-2xl border-none bg-[#EAEBDD] px-4 py-3 shadow-none">
            <CardContent className="flex flex-col gap-2 p-0">
              <span className="text-sm font-medium opacity-60">Sesiones</span>
              <p className="text-xl leading-none font-semibold">{stats?.totalSessions || 0}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- SECTION 2: RÉPARTITION PAR JOUR (Style ScheduleItemGroup) --- */}
      <div className="space-y-6">
        <h2 className="px-1 text-lg font-bold text-slate-800">Distribución Semanal</h2>

        <div className="space-y-4">
          {DAYS_ES.map((day, index) => {
            const dayData = stats?.dayDistribution?.find((d) => d.day === index + 1) || {
              percentage: 0,
            }
            const bgColor = colors[index % colors.length]
            // const circlesToDisplay = index % 2 === 0 ? circles1 : circles2

            return (
              <div key={day} className="flex items-center gap-4">
                {/* Colonne Gauche (Nom du jour) */}
                <div className="flex min-w-[48px] flex-col items-center pt-1">
                  <span className="text-sm font-bold tracking-tight uppercase">{day}</span>
                </div>

                {/* Colonne Droite (Barre de stats style ScheduleItem) */}
                <div
                  className={`relative flex-1 overflow-hidden rounded-xl p-5 ${bgColor} transition-all`}
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase opacity-40">
                        Rendimiento
                      </span>
                      <span className="text-lg font-bold">{dayData.percentage}%</span>
                    </div>
                    {/* Petite barre interne pour visualiser le % */}
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full bg-[#9DB37E]"
                        style={{ width: `${dayData.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Décoration Cercles comme dans ton code */}
                  {/* <Image
                    src={circlesToDisplay}
                    alt="circles"
                    className={`absolute z-0 w-[20vw] opacity-20 ${
                      index % 2 === 0 ? '-top-2 -right-4' : '-right-4 -bottom-2'
                    }`}
                  /> */}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
