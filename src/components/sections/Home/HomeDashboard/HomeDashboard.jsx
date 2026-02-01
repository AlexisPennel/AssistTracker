'use client'

import { ArrowRight, Check, Loader2, Wallet, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Item, ItemActions, ItemContent } from '@/components/ui/item'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useAttendance } from '@/context/AttendanceContext' // Nuevo Contexto
import { useSchedules } from '@/context/ScheduleContext'
import { Ban } from 'lucide-react'
import { AddStudentDialog } from './AddStudentDialog'

const HomeDashboard = () => {
  const { data: session, status: authStatus } = useSession()
  const { schedules, loading: schedulesLoading } = useSchedules()
  const { attendances, updateStatus, loading: attendanceLoading } = useAttendance()

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  // 1. Fusionamos los horarios con sus estados de asistencia reales del contexto
  const enrichedSchedules = useMemo(() => {
    return schedules.map((slot) => ({
      ...slot,
      status: attendances[slot._id] || 'pending', // Prioridad al estado del AttendanceContext
    }))
  }, [schedules, attendances])

  // 2. Calculamos estadísticas basadas en los datos enriquecidos
  const stats = useMemo(() => {
    const activeSchedules = enrichedSchedules.filter((s) => s.status !== 'canceled')

    const total = activeSchedules.length
    const processed = activeSchedules.filter((s) => s.status && s.status !== 'pending').length
    const presentCount = activeSchedules.filter((s) => s.status === 'present').length

    const totalRevenue = enrichedSchedules
      .filter((s) => s.status === 'present')
      .reduce((sum, slot) => sum + (slot.studentId?.price || 0), 0)

    const percentage = total > 0 ? (processed / total) * 100 : 0

    return { total, processed, presentCount, percentage, totalRevenue }
  }, [enrichedSchedules])

  // 3. Dividimos en Próximas y Pasadas usando enrichedSchedules
  const { upcoming, past } = useMemo(() => {
    const now = new Date()
    const currentHour = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    return enrichedSchedules.reduce(
      (acc, slot) => {
        const isPast = slot.startTime < currentHour
        const target = isPast ? acc.past : acc.upcoming

        if (!target[slot.startTime]) target[slot.startTime] = []
        target[slot.startTime].push(slot)

        return acc
      },
      { upcoming: {}, past: {} }
    )
  }, [enrichedSchedules])

  const firstName = useMemo(() => {
    if (!session?.user?.name) return 'Profe'
    return session.user.name.split(' ')[0]
  }, [session?.user?.name])

  // Lógica delegada al Contexto (con Toggle inteligente)
  const handleToggleAttendance = async (slot, newStatus) => {
    const currentStatus = attendances[slot._id] || 'pending'
    const finalStatus = currentStatus === newStatus ? 'pending' : newStatus

    // updateStatus ya maneja la persistencia y el estado optimista
    await updateStatus(slot._id, slot.studentId._id, finalStatus)
  }

  if (authStatus === 'loading' || schedulesLoading)
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="text-primary size-8 animate-spin" />
        <p className="text-muted-foreground animate-pulse text-sm">Cargando tus clases...</p>
      </div>
    )

  const RenderTimeGroups = ({ groups, title, emptyMessage }) => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
          {title}
        </h2>
      </div>

      {Object.keys(groups).length === 0 ? (
        <div className="rounded-xl border-2 border-dashed py-8 text-center opacity-50">
          <p className="text-muted-foreground text-xs italic">{emptyMessage}</p>
        </div>
      ) : (
        Object.entries(groups)
          .sort()
          .map(([time, slots]) => (
            <div key={time} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="flex items-center gap-2 border px-3 py-1 text-xs font-bold shadow-sm"
                >
                  {time} <ArrowRight className="text-muted-foreground size-2" /> {slots[0].endTime}
                </Badge>
                <Separator className="flex-1 opacity-40" />
              </div>
              <div className="flex flex-col gap-2">
                {slots.map((slot) => (
                  <Item
                    key={slot._id}
                    variant="outline"
                    className={`rounded-xl bg-transparent transition-all duration-300`}
                  >
                    <ItemContent>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">
                          {slot.studentId?.name || 'Alumno sin nombre'}
                        </p>
                        {slot.occurrence === 'once' && (
                          <Badge
                            variant="outline"
                            className="h-4 border-amber-200 bg-amber-50 px-1.5 text-[9px] font-bold tracking-wider text-amber-600 uppercase shadow-none"
                          >
                            una vez
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs font-medium tracking-tight">
                        {formatCurrency(slot.studentId?.price || 0)}
                      </p>
                    </ItemContent>
                    <ItemActions className="gap-2">
                      <Button
                        variant={slot.status === 'canceled' ? 'canceled' : 'outline'}
                        size="icon"
                        className="size-8 rounded-full shadow-sm"
                        onClick={() => handleToggleAttendance(slot, 'canceled')}
                      >
                        <Ban />
                      </Button>

                      <Button
                        variant={slot.status === 'absent' ? 'destructive' : 'outline'}
                        size="icon"
                        className="size-8 rounded-full shadow-sm"
                        onClick={() => handleToggleAttendance(slot, 'absent')}
                      >
                        <X className="size-4" />
                      </Button>

                      <Button
                        variant={slot.status === 'present' ? 'default' : 'outline'}
                        size="icon"
                        className="size-8 rounded-full shadow-sm transition-colors"
                        style={{
                          backgroundColor: slot.status === 'present' ? '#7e9e75' : 'transparent',
                          borderColor: slot.status === 'present' ? '#7e9e75' : undefined,
                          color: slot.status === 'present' ? 'white' : undefined,
                        }}
                        onClick={() => handleToggleAttendance(slot, 'present')}
                      >
                        <Check className="size-4" />
                      </Button>
                    </ItemActions>
                  </Item>
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  )

  return (
    <section className="animate-in fade-in mb-[10vh] flex w-full max-w-2xl flex-col gap-8 px-4 duration-500 xl:mx-auto xl:px-0">
      <header className="flex items-center justify-between py-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Hola, {firstName} 👋</h1>
          <p className="text-muted-foreground text-sm capitalize">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddStudentDialog />
        </div>
      </header>

      <Card className="bg-muted/20 overflow-hidden shadow-none">
        <CardContent className="space-y-4 px-6 py-0">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                Ganancias de hoy
              </p>
              <p className="text-3xl font-medium tracking-tight">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="bg-muted rounded-full p-3">
              <Wallet className="text-foreground size-4" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-end justify-between font-mono">
              <p className="text-xs font-semibold">
                {stats.presentCount} / {stats.total}{' '}
                <span className="text-muted-foreground font-normal">clases completadas</span>
              </p>
              <p className="text-primary text-[11px] font-bold">{Math.round(stats.percentage)}%</p>
            </div>
            <Progress
              value={stats.percentage}
              className="bg-muted/50 h-2"
              indicatorClassName="bg-[#7e9e75]"
            />
          </div>
        </CardContent>
      </Card>

      <RenderTimeGroups
        groups={upcoming}
        title="Próximas clases"
        emptyMessage="No tienes más clases programadas para hoy."
      />

      <div className="bg-muted/20 rounded-2xl border px-4 py-6">
        <RenderTimeGroups
          groups={past}
          title="Clases pasadas"
          emptyMessage="Aún no han terminado clases hoy."
        />
      </div>
    </section>
  )
}

export default HomeDashboard
