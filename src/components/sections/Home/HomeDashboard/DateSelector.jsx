import { cn } from '@/lib/utils' // Utilitaire classique de shadcn pour les classes
import { addDays, format, isSameDay, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'

const DateSelector = ({ selectedDate, onDateChange }) => {
  // Générer les 7 jours de la semaine courante
  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 }) // Commence le lundi
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i))

  return (
    <div className="no-scrollbar flex w-full items-center justify-between overflow-x-auto px-2 py-1">
      {days.map((day) => {
        const isSelected = isSameDay(day, selectedDate)

        return (
          <button
            key={day.toString()}
            onClick={() => onDateChange(day)}
            className={cn(
              'flex min-w-[45px] flex-col items-center transition-all duration-300',
              isSelected
                ? 'scale-110 rounded-full bg-[#1d1d1d] px-2 py-2 text-white'
                : 'text-gray-400'
            )}
          >
            {/* Numéro du jour */}
            <span className={cn('text-lg font-bold', isSelected ? 'text-white' : 'text-gray-600')}>
              {format(day, 'd')}
            </span>

            {/* Nom du jour (3 premières lettres) */}
            <span
              className={cn(
                'text-[10px] capitalize',
                isSelected ? 'text-white/80' : 'text-gray-400'
              )}
            >
              {format(day, 'EEE', { locale: es }).replace('.', '')}
            </span>

            {/* Le petit point blanc sous la date sélectionnée */}
            {isSelected && <div className="mt-1 h-1 w-1 rounded-full bg-[#E5FBF3]" />}
          </button>
        )
      })}
    </div>
  )
}

export default DateSelector
