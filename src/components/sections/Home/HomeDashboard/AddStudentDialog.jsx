'use client'

import { createStudentWithSchedule } from '@/app/actions/student-actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useSchedules } from '@/context/ScheduleContext'
import { ArrowRight, CalendarDays, Loader2, Plus, Repeat, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'

const DAYS = [
  { label: 'Dom', value: 0 },
  { label: 'Lun', value: 1 },
  { label: 'Mar', value: 2 },
  { label: 'Mer', value: 3 },
  { label: 'Jeu', value: 4 },
  { label: 'Ven', value: 5 },
  { label: 'Sam', value: 6 },
]

export function AddStudentDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { refreshSchedules } = useSchedules()

  // État initial avec le champ 'occurrence' et 'date'
  const [schedules, setSchedules] = useState([
    {
      occurrence: 'weekly',
      dayOfWeek: 1,
      date: '',
      startTime: '09:00',
      endTime: '10:00',
    },
  ])

  const addScheduleField = () => {
    setSchedules([
      ...schedules,
      {
        occurrence: 'weekly',
        dayOfWeek: 1,
        date: '',
        startTime: '09:00',
        endTime: '10:00',
      },
    ])
  }

  const removeScheduleField = (index) => {
    setSchedules(schedules.filter((_, i) => i !== index))
  }

  const updateSchedule = (index, field, value) => {
    const newSchedules = [...schedules]
    newSchedules[index][field] = field === 'dayOfWeek' ? parseInt(value) : value
    setSchedules(newSchedules)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const studentData = {
      name: formData.get('name'),
      price: formData.get('price'),
    }

    startTransition(async () => {
      const result = await createStudentWithSchedule(studentData, schedules)
      if (result.success) {
        await refreshSchedules()
        setOpen(false)
        setSchedules([
          { occurrence: 'weekly', dayOfWeek: 1, date: '', startTime: '09:00', endTime: '10:00' },
        ])
        event.target.reset()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className={'text-xs'}>
          <Plus className="size-3" /> Nuevo Alumno
        </Button>
      </DialogTrigger>

      <DialogContent className="scroll-hide max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Nuevo Alumno</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label
                htmlFor="name"
                className="text-muted-foreground text-xs font-bold tracking-widest uppercase"
              >
                Nombre
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Ej. Juan Pérez"
                required
                className="bg-muted/30"
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="price"
                className="text-muted-foreground text-xs font-bold tracking-widest uppercase"
              >
                Tarifa (MXN)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="50"
                required
                className="bg-muted/30"
              />
            </div>
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                Planificación
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addScheduleField}
                className="h-7 border-dashed px-2 text-[10px] font-bold uppercase"
              >
                + Agregar turno
              </Button>
            </div>

            {schedules.map((slot, index) => (
              <div
                key={index}
                className="bg-muted/10 animate-in fade-in zoom-in-95 space-y-4 rounded-xl border p-4 duration-200"
              >
                {/* Sélecteur d'occurrence : Hebdomadaire ou Une fois */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={slot.occurrence === 'weekly' ? 'default' : 'outline'}
                    size="sm"
                    className={`h-8 w-fit flex-1 gap-2 text-[10px] font-bold uppercase ${slot.occurrence === 'weekly' ? 'bg-primary' : ''}`}
                    onClick={() => updateSchedule(index, 'occurrence', 'weekly')}
                  >
                    <Repeat className="size-3" /> Semanal
                  </Button>
                  <Button
                    type="button"
                    variant={slot.occurrence === 'once' ? 'default' : 'outline'}
                    size="sm"
                    className={`h-8 flex-1 gap-2 text-[10px] font-bold uppercase ${slot.occurrence === 'once' ? 'bg-primary' : ''}`}
                    onClick={() => updateSchedule(index, 'occurrence', 'once')}
                  >
                    <CalendarDays className="size-3" /> Una vez
                  </Button>
                  {schedules.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeScheduleField(index)}
                      className="text-destructive size-8"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-3">
                  {/* Choix du jour ou de la date précise */}
                  {slot.occurrence === 'weekly' ? (
                    <div className="grid gap-1.5">
                      <span className="text-muted-foreground ml-1 text-[10px] font-bold uppercase">
                        Día de la semana
                      </span>
                      <select
                        className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-[#7e9e75] focus-visible:outline-none"
                        value={slot.dayOfWeek}
                        onChange={(e) => updateSchedule(index, 'dayOfWeek', e.target.value)}
                      >
                        {DAYS.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="grid gap-1.5">
                      <span className="text-muted-foreground ml-1 text-[10px] font-bold uppercase">
                        Fecha específica
                      </span>
                      <Input
                        type="date"
                        required={slot.occurrence === 'once'}
                        value={slot.date}
                        onChange={(e) => updateSchedule(index, 'date', e.target.value)}
                        className="bg-background h-9 focus-visible:ring-[#7e9e75]"
                      />
                    </div>
                  )}

                  {/* Heures début/fin */}
                  <div className="flex items-center gap-3">
                    <div className="grid flex-1 gap-1.5">
                      <span className="text-muted-foreground ml-1 text-[10px] font-bold uppercase">
                        Inicio
                      </span>
                      <Input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                        className="bg-background h-9 focus-visible:ring-[#7e9e75]"
                      />
                    </div>
                    <ArrowRight className="text-muted-foreground mt-6 size-4 opacity-30" />
                    <div className="grid flex-1 gap-1.5">
                      <span className="text-muted-foreground ml-1 text-[10px] font-bold uppercase">
                        Fin
                      </span>
                      <Input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                        className="bg-background h-9 focus-visible:ring-[#7e9e75]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar Alumno'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
