'use client'

import { addDays, format, isSameDay, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ArrowRight,
  Ban,
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Loader2,
  Smartphone,
  Wallet,
  X,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Item, ItemActions, ItemContent, ItemMedia } from '@/components/ui/item'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useAttendance } from '@/context/AttendanceContext'
import { useSchedules } from '@/context/ScheduleContext'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { AddStudentDialog } from './AddStudentDialog'

const HomeDashboard = () => {
  const { data: session, status: authStatus } = useSession()
  const { schedules, loading: schedulesLoading, selectedDate, setSelectedDate } = useSchedules()
  const { attendances, updateStatus } = useAttendance()
  const { isInstallable, handleInstallClick } = usePWAInstall()

  // Formateador de moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  // 1. Enriquecer y ordenar datos
  const enrichedSchedules = useMemo(() => {
    const now = new Date()
    const currentH = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const isViewingToday = isSameDay(selectedDate, now)

    return [...schedules]
      .map((slot) => ({
        ...slot,
        status: attendances[slot._id] || 'pending',
        // Si vemos hoy, comparamos con la hora real. Si es pasado, todo es "past". Si es futuro, nada es "past".
        isPast: isViewingToday ? slot.endTime < currentH : selectedDate < now,
      }))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [schedules, attendances, selectedDate])

  // 2. Agrupar por hora de inicio
  const groupedSchedules = useMemo(() => {
    const groups = {}
    enrichedSchedules.forEach((slot) => {
      if (!groups[slot.startTime]) groups[slot.startTime] = []
      groups[slot.startTime].push(slot)
    })
    return groups
  }, [enrichedSchedules])

  // 3. Estadísticas
  const stats = useMemo(() => {
    const activeSchedules = enrichedSchedules.filter((s) => s.status !== 'canceled')
    const total = activeSchedules.length
    const presentCount = activeSchedules.filter((s) => s.status === 'present').length
    const processed = activeSchedules.filter((s) => s.status !== 'pending').length

    const totalRevenue = enrichedSchedules
      .filter((s) => s.status === 'present')
      .reduce((sum, slot) => sum + (slot.studentId?.price || 0), 0)

    const percentage = total > 0 ? (processed / total) * 100 : 0

    return { total, presentCount, percentage, totalRevenue }
  }, [enrichedSchedules])

  const firstName = session?.user?.name ? session.user.name.split(' ')[0] : 'Profe'
  const isToday = isSameDay(selectedDate, new Date())

  if (authStatus === 'loading' || schedulesLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="text-primary size-8 animate-spin" />
        <p className="text-muted-foreground animate-pulse text-sm">Cargando tus clases...</p>
      </div>
    )
  }

  return (
    <section className="animate-in fade-in mb-[10vh] flex w-full max-w-2xl flex-col gap-8 px-4 duration-500 xl:mx-auto xl:px-0">
      {/* Banner PWA */}
      {isInstallable && (
        <Item variant="outline" className="border-dashed">
          <ItemMedia
            variant="image"
            className="bg-muted flex items-center justify-center rounded-full p-1"
          >
            <Smartphone className="size-5" />
          </ItemMedia>
          <ItemContent>
            <p className="text-base font-bold">Instalar la app</p>
          </ItemContent>
          <ItemActions>
            <Button size="icon" onClick={handleInstallClick}>
              <Download className="size-4" />
            </Button>
          </ItemActions>
        </Item>
      )}

      {/* Header */}
      <header className="flex items-center justify-between py-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {isToday ? `Hola, ${firstName} 👋` : 'Historial'}
          </h1>
          <p className="text-muted-foreground text-sm capitalize">
            {format(selectedDate, "eeee, d 'de' MMMM", { locale: es })}
          </p>
        </div>
        <AddStudentDialog />
      </header>

      {/* Selector de fecha (Switcher) */}
      <div className="flex items-center justify-between rounded-full border bg-transparent p-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedDate(subDays(selectedDate, 1))}
          className="h-8 w-8 rounded-full"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-primary size-3 opacity-70" />
            <span className="text-sm font-bold">
              {isToday ? 'Hoy' : format(selectedDate, 'dd MMM yyyy', { locale: es })}
            </span>
          </div>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(new Date())}
              className="text-primary text-[10px] font-bold hover:underline"
            >
              Volver a hoy
            </button>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          className="h-8 w-8 rounded-full"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Stats Card */}
      <Card className="bg-muted/20 overflow-hidden shadow-none">
        <CardContent className="space-y-4 px-6 py-0">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                {isToday ? 'Ganancias de hoy' : 'Ganancias del día'}
              </p>
              <p className="text-3xl font-medium tracking-tight">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="bg-muted rounded-full p-3">
              <Wallet className="size-4" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-end justify-between font-mono text-[11px]">
              <p className="font-semibold">
                {stats.presentCount} / {stats.total}{' '}
                <span className="text-muted-foreground">clases</span>
              </p>
              <p className="text-primary font-bold">{Math.round(stats.percentage)}%</p>
            </div>
            <Progress value={stats.percentage} className="h-2" indicatorClassName="bg-[#7e9e75]" />
          </div>
        </CardContent>
      </Card>

      {/* Lista Única Cronológica */}
      <div className="flex flex-col gap-6">
        <h2 className="text-muted-foreground px-1 text-xs font-bold tracking-widest uppercase">
          {isToday ? 'Horario de hoy' : `Clases del ${format(selectedDate, 'dd/MM')}`}
        </h2>

        {Object.keys(groupedSchedules).length === 0 ? (
          <div className="rounded-xl border-2 border-dashed py-12 text-center opacity-50">
            <p className="text-muted-foreground text-sm italic">
              No hay clases registradas para esta fecha.
            </p>
          </div>
        ) : (
          Object.entries(groupedSchedules).map(([time, slots]) => {
            const isPastGroup = slots.every((s) => s.isPast)

            return (
              <div key={time} className={`flex flex-col gap-3 transition-opacity duration-300`}>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={isPastGroup ? 'outline' : 'secondary'}
                    className="flex items-center gap-2 px-3 py-1 text-xs font-bold shadow-sm"
                  >
                    {time} <ArrowRight className="size-2" /> {slots[0].endTime}
                    {isPastGroup && <Clock className="size-3" />}
                  </Badge>
                  <Separator className="flex-1 opacity-40" />
                </div>
                <div className="flex flex-col gap-2">
                  {slots.map((slot) => (
                    <Item key={slot._id} variant="outline" className="rounded-xl">
                      <ItemContent>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">
                            {slot.studentId?.name || 'Alumno'}
                          </p>
                          {slot.occurrence === 'once' && (
                            <Badge
                              variant="outline"
                              className="h-4 border-amber-200 text-[9px] text-amber-600 uppercase"
                            >
                              una vez
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {formatCurrency(slot.studentId?.price || 0)}
                        </p>
                      </ItemContent>
                      <ItemActions className="gap-2">
                        <Button
                          variant={slot.status === 'canceled' ? 'canceled' : 'outline'}
                          size="icon"
                          className="size-8 rounded-full"
                          onClick={() =>
                            updateStatus(
                              slot._id,
                              slot.studentId._id,
                              slot.status === 'canceled' ? 'pending' : 'canceled'
                            )
                          }
                        >
                          <Ban className="size-4" />
                        </Button>

                        <Button
                          variant={slot.status === 'absent' ? 'destructive' : 'outline'}
                          size="icon"
                          className="size-8 rounded-full"
                          onClick={() =>
                            updateStatus(
                              slot._id,
                              slot.studentId._id,
                              slot.status === 'absent' ? 'pending' : 'absent'
                            )
                          }
                        >
                          <X className="size-4" />
                        </Button>

                        <Button
                          size="icon"
                          variant="outline"
                          className="size-8 rounded-full transition-colors"
                          style={{
                            backgroundColor: slot.status === 'present' ? '#7e9e75' : 'transparent',
                            color: slot.status === 'present' ? 'white' : 'inherit',
                          }}
                          onClick={() =>
                            updateStatus(
                              slot._id,
                              slot.studentId._id,
                              slot.status === 'present' ? 'pending' : 'present'
                            )
                          }
                        >
                          <Check className="size-4" />
                        </Button>
                      </ItemActions>
                    </Item>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}

export default HomeDashboard
