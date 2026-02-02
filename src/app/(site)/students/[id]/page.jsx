'use client'

import { ScheduleDialog } from '@/components/sections/Home/HomeDashboard/ScheduleDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function StudentDetail() {
  const params = useParams()
  const id = params?.id
  const router = useRouter()

  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)

  const loadSchedules = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/students/${id}/schedules`)
      if (!res.ok) throw new Error('Error en la carga')
      const data = await res.json()
      setSchedules(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('❌ Error cargando horarios:', error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadSchedules()
  }, [loadSchedules])

  const handleDelete = async (scheduleId) => {
    if (!confirm('¿Eliminar este horario?')) return
    await fetch(`/api/schedules?id=${scheduleId}`, { method: 'DELETE' })
    loadSchedules()
  }

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingSchedule(null)
    setIsDialogOpen(true)
  }

  return (
    <div className="mx-auto mt-10 max-w-2xl space-y-6 px-4 lg:mt-20">
      <Button
        variant="ghost"
        onClick={() => router.push('/students')}
        className="text-muted-foreground hover:text-foreground gap-2 p-0 hover:bg-transparent"
      >
        <ArrowLeft className="size-4" /> Volver a alumnos
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Horarios del Alumno</h1>
          <p className="text-muted-foreground text-sm">Gestiona las sesiones programadas</p>
        </div>
        <Button onClick={handleAdd} size="sm" className="gap-2">
          <Plus className="size-4" /> Añadir
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Loader2 className="text-primary size-6 animate-spin" />
          </div>
        ) : schedules.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed py-12 text-center opacity-50">
            <p className="text-muted-foreground text-sm italic">Sin horarios asignados.</p>
          </div>
        ) : (
          schedules.map((slot) => (
            <div
              key={slot._id}
              className="bg-card flex items-center justify-between rounded-xl border p-4 shadow-sm"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      slot.occurrence === 'weekly'
                        ? 'bg-primary/5 text-primary border-primary/20'
                        : 'border-amber-200 bg-amber-50 text-amber-600'
                    }
                  >
                    {slot.occurrence === 'weekly' ? DAYS[slot.dayOfWeek] : 'Fecha única'}
                  </Badge>
                  <span className="text-sm font-bold">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
                {slot.occurrence === 'once' && (
                  <p className="text-muted-foreground text-[10px]">
                    {new Date(slot.date).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(slot)}>
                  <Pencil className="text-muted-foreground size-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(slot._id)}>
                  <Trash2 className="text-destructive size-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <ScheduleDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        studentId={id}
        schedule={editingSchedule}
        onSuccess={loadSchedules}
      />
    </div>
  )
}
