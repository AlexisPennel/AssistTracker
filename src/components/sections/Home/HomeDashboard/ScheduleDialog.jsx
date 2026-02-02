'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEffect, useState } from 'react'

const DAYS_SHORT = [
  { label: 'Dom', value: '0' },
  { label: 'Lun', value: '1' },
  { label: 'Mar', value: '2' },
  { label: 'Mié', value: '3' },
  { label: 'Jue', value: '4' },
  { label: 'Vie', value: '5' },
  { label: 'Sáb', value: '6' },
]

export function ScheduleDialog({ isOpen, setIsOpen, studentId, schedule, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    occurrence: 'weekly',
    dayOfWeek: '1',
    startTime: '08:00',
    endTime: '09:00',
    date: '',
  })

  // Sincronizar el formulario cuando se abre el diálogo o cambia el horario a editar
  useEffect(() => {
    if (schedule && isOpen) {
      setFormData({
        occurrence: schedule.occurrence || 'weekly',
        dayOfWeek: schedule.dayOfWeek?.toString() || '1',
        startTime: schedule.startTime || '08:00',
        endTime: schedule.endTime || '09:00',
        date: schedule.date ? new Date(schedule.date).toISOString().split('T')[0] : '',
      })
    } else if (isOpen) {
      // Valores por defecto para nuevo horario
      setFormData({
        occurrence: 'weekly',
        dayOfWeek: '1',
        startTime: '08:00',
        endTime: '09:00',
        date: '',
      })
    }
  }, [schedule, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const isEditing = !!schedule
    const url = '/api/schedules'
    const method = isEditing ? 'PUT' : 'POST'

    // Formateo de datos antes de enviar a la API
    const payload = {
      ...formData,
      studentId,
      dayOfWeek: parseInt(formData.dayOfWeek), // Mongoose espera un Number
      // Si es "once", enviamos la fecha; si es "weekly", la limpiamos
      date: formData.occurrence === 'once' ? formData.date : null,
      id: schedule?._id, // Necesario para el PUT
    }

    try {
      const res = await fetch(url, {
        method,
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        onSuccess() // Recarga la lista en la página principal
        setIsOpen(false)
      } else {
        const errData = await res.json()
        alert(`Error: ${errData.error || 'No se pudo guardar'}`)
      }
    } catch (err) {
      console.error('❌ Error al guardar horario:', err)
      alert('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {schedule ? 'Editar Horario' : 'Añadir Nuevo Horario'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            {/* TIPO DE OCURRENCIA */}
            <div className="space-y-2">
              <Label htmlFor="occurrence">Frecuencia</Label>
              <Select
                value={formData.occurrence}
                onValueChange={(v) => setFormData({ ...formData, occurrence: v })}
              >
                <SelectTrigger id="occurrence">
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="once">Una sola vez</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* DÍA O FECHA SEGÚN OCURRENCIA */}
            {formData.occurrence === 'weekly' ? (
              <div className="space-y-2">
                <Label htmlFor="dayOfWeek">Día de la semana</Label>
                <Select
                  value={formData.dayOfWeek}
                  onValueChange={(v) => setFormData({ ...formData, dayOfWeek: v })}
                >
                  <SelectTrigger id="dayOfWeek">
                    <SelectValue placeholder="Día" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_SHORT.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="date">Fecha específica</Label>
                <Input
                  id="date"
                  type="date"
                  required={formData.occurrence === 'once'}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* HORA DE INICIO */}
            <div className="space-y-2">
              <Label htmlFor="startTime">Hora Inicio</Label>
              <Input
                id="startTime"
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>

            {/* HORA DE FIN */}
            <div className="space-y-2">
              <Label htmlFor="endTime">Hora Fin</Label>
              <Input
                id="endTime"
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[100px]">
              {loading ? 'Guardando...' : schedule ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
