import { Card, CardContent } from '@/components/ui/card'

// Petit composant utilitaire pour le cercle de progression
const CircularProgress = ({ percentage, size = 40, strokeWidth = 4 }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  // Calcul du décalage pour remplir le cercle
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg className="rotate-[-90deg]" width={size} height={size}>
        {/* Cercle de fond (gris clair/transparent) */}
        <circle
          className="text-[#DEECDB]"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Cercle de progression (blanc) */}
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

const DashboardStats = ({ stats, formatCurrency }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Bloc Revenus */}
      <Card className="z-2 rounded-2xl border-none bg-[#F4F5E5] px-4 py-3 shadow-none">
        <CardContent className="flex flex-col gap-2 p-0">
          <span className="text-sm leading-none font-medium opacity-60">Ingresos</span>
          <p className="text-xl leading-none font-semibold">{formatCurrency(stats.totalRevenue)}</p>
        </CardContent>
      </Card>

      {/* Bloc Assistance (Style Image) */}
      <Card className="text-foreground z-2 rounded-2xl border-none bg-[#F4F5E5] px-4 py-3 shadow-none">
        <CardContent className="flex items-center justify-between p-0">
          <div className="flex flex-col gap-2">
            <span className="text-sm leading-none font-medium opacity-60">Assistencia</span>
            <p className="text-xl leading-none font-semibold">{Math.round(stats.percentage)}%</p>
          </div>

          {/* Graphique circulaire à droite */}
          <CircularProgress percentage={stats.percentage} size={45} strokeWidth={5} />
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardStats
