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
import { DollarSign, Loader2 } from 'lucide-react'
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

  // 1. Ajout de 'price' dans l'état initial
  const [formData, setFormData] = useState({
    occurrence: 'weekly',
    dayOfWeek: '1',
    startTime: '08:00',
    endTime: '09:00',
    date: '',
    price: '50',
  })

  useEffect(() => {
    if (schedule && isOpen) {
      setFormData({
        occurrence: schedule.occurrence || 'weekly',
        dayOfWeek: schedule.dayOfWeek?.toString() || '1',
        startTime: schedule.startTime || '08:00',
        endTime: schedule.endTime || '09:00',
        date: schedule.date ? new Date(schedule.date).toISOString().split('T')[0] : '',
        price: schedule.price?.toString() || '50', // 2. Récupération du prix existant
      })
    } else if (isOpen) {
      setFormData({
        occurrence: 'weekly',
        dayOfWeek: '1',
        startTime: '08:00',
        endTime: '09:00',
        date: '',
        price: '50',
      })
    }
  }, [schedule, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const isEditing = !!schedule
    const url = '/api/schedules'
    const method = isEditing ? 'PUT' : 'POST'

    // 3. Inclusion du prix converti en nombre dans le payload
    const payload = {
      ...formData,
      studentId,
      dayOfWeek: parseInt(formData.dayOfWeek),
      price: Number(formData.price),
      date: formData.occurrence === 'once' ? formData.date : null,
      id: schedule?._id,
    }

    try {
      const res = await fetch(url, {
        method,
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        onSuccess()
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
          {/* --- CHAMP TARIF (Nouveau) --- */}
          <div className="space-y-2">
            <Label htmlFor="price">Tarifa por sesión (MXN)</Label>
            <div className="relative">
              <DollarSign className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="price"
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="bg-muted/20 pl-9"
                placeholder="50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#7e9e75] hover:bg-[#6b8a63]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando
                </>
              ) : schedule ? (
                'Actualizar'
              ) : (
                'Guardar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
