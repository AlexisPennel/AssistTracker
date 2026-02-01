'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStats } from '@/context/StatsContext'
import { useUserParameters } from '@/context/UserParametersContext'
import { Landmark, TrendingDown, TrendingUp, Wallet } from 'lucide-react'

const StatsCard = ({ type = 'totalSavings', label }) => {
  const { parameters } = useUserParameters()
  const { stats } = useStats()

  if (!parameters || !stats) {
    return (
      <Card className="animate-pulse">
        <CardContent className="bg-muted/50 h-24" />
      </Card>
    )
  }

  const isDaily = type === 'dailySavings'
  const rawValue = isDaily ? stats.dailySavings : stats.totalSavings
  const formattedValue = rawValue.toFixed(2)

  const isNegative = rawValue < 0
  const isLowBudget = isDaily && rawValue < parameters.pack.price / 2

  const getTextColor = () => {
    if (isNegative) return 'text-destructive'
    if (isLowBudget) return 'text-orange-500'
    if (rawValue > 0) return 'text-emerald-600'
    return 'text-foreground'
  }

  if (rawValue === 0) return null

  return (
    <Card className="justify-between gap-2 overflow-hidden border-none transition-all hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <span className="tracking-wider uppercase">{label}</span>
          {isDaily ? (
            <Wallet className="size-4 opacity-25" />
          ) : (
            <Landmark className="size-4 opacity-25" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          {/* On applique la couleur dynamique ici */}
          <span className={`text-3xl font-bold tracking-tight`}>{formattedValue}</span>
          <span className="text-muted-foreground text-sm font-bold uppercase">
            {parameters.pack.currency === 'EUR' ? '€' : parameters.pack.currency}
          </span>

          <div className="mt-1 ml-4">
            {isDaily && (
              <>
                {isNegative ? (
                  <TrendingDown className="text-destructive size-5 animate-bounce" />
                ) : (
                  <TrendingUp
                    className={`size-5 ${rawValue > 0 ? 'text-chart-1' : 'text-muted'}`}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* ON N'AFFICHE LA BARRE QUE POUR LE BUDGET QUOTIDIEN */}
        {isDaily && (
          <div className="mt-4 flex items-center gap-2">
            <div className="bg-secondary h-1.5 flex-1 overflow-hidden rounded-full">
              <div
                className={`h-full transition-all duration-500 ${isNegative ? 'bg-destructive w-full' : 'bg-chart-1'}`}
                style={{
                  width: `${Math.min(100, Math.max(0, (rawValue / (parameters.cigarettesPerDay * (parameters.pack.price / parameters.pack.cigarettesPerPack))) * 100))}%`,
                }}
              />
            </div>
            <span className="text-[10px] font-bold whitespace-nowrap uppercase opacity-80">
              {isNegative ? 'Budget dépassé !' : 'Budget disponible'}
            </span>
          </div>
        )}

        {/* POUR LE TOTAL : On met juste un petit texte sobre ou rien du tout */}
        {!isDaily && (
          <p className="text-muted-foreground mt-2 text-[10px] font-bold uppercase opacity-60">
            Économies réelles accumulées
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default StatsCard
