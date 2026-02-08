import { cn } from '@/lib/utils'
import { addDays, format, isSameDay, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'

const DateSelector = ({ selectedDate, onDateChange }) => {
  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i))
  const today = new Date() // ✅ Jour actuel

  return (
    <div className="no-scrollbar flex w-full items-center justify-between overflow-x-auto px-2 py-1">
      {days.map((day) => {
        const isSelected = isSameDay(day, selectedDate)
        const isToday = isSameDay(day, today) // ✅ Vérifier si c'est aujourd'hui

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

            {/* ✅ Points indicateurs */}
            <div className="mt-1 flex h-1 gap-1">
              {/* Point vert pour le jour actuel */}
              {isToday && <div className="h-1 w-1 rounded-full bg-[#9DB37E]" />}

              {/* Point blanc pour le jour sélectionné */}
              {isSelected && !isToday && <div className="h-1 w-1 rounded-full bg-[#E5FBF3]" />}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default DateSelector
