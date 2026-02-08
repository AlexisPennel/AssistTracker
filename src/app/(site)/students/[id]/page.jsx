'use client'

import { addStudentNote } from '@/app/actions/student-actions'
import { ScheduleDialog } from '@/components/sections/Home/HomeDashboard/ScheduleDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useSchedules } from '@/context/ScheduleContext'
import {
  CalendarDays,
  ChevronLeft,
  ClockPlus,
  DollarSign,
  Edit,
  History,
  Loader2,
  MessageSquare,
  Send,
  Trash,
  Trash2,
} from 'lucide-react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function StudentDetail() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params?.id
  const name = searchParams.get('name')
  const router = useRouter()

  const { refreshSchedules } = useSchedules()
  const [schedules, setSchedules] = useState([])
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [newNote, setNewNote] = useState('')
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)

  const loadAllData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [resSchedules, resStudent] = await Promise.all([
        fetch(`/api/students/${id}/schedules`),
        fetch(`/api/students/${id}`),
      ])

      if (!resSchedules.ok) throw new Error('Error al cargar horarios')
      if (!resStudent.ok) throw new Error('Error al cargar datos del alumno')

      const schedulesData = await resSchedules.json()
      const studentData = await resStudent.json()

      setSchedules(Array.isArray(schedulesData) ? schedulesData : [])
      setStudent(studentData)
    } catch (error) {
      console.error('❌ Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    setIsSubmittingNote(true)
    try {
      const res = await addStudentNote(id, newNote)
      if (res.success) {
        setNewNote('')
        await loadAllData()
      }
    } finally {
      setIsSubmittingNote(false)
    }
  }

  // LOGIQUE DE SUPPRESSION
  const handleDelete = async (scheduleId) => {
    if (!confirm('¿Eliminar este horario?')) return
    try {
      const res = await fetch(`/api/schedules?id=${scheduleId}`, { method: 'DELETE' })
      if (res.ok) {
        refreshSchedules()
        await loadAllData()
      }
    } catch (error) {
      console.error('Error eliminando horario:', error)
    }
  }

  // LOGIQUE D'EDITION
  const handleEdit = (slot) => {
    setEditingSchedule(slot)
    setIsDialogOpen(true)
  }

  // SUPRESSION STUDENT
  const handleDeleteStudent = async () => {
    if (
      !confirm(
        '¿Estás seguro de que deseas eliminar este alumno? Esta acción no se puede deshacer.'
      )
    ) {
      return
    }

    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        // Une fois supprimé, on redirige vers la liste des élèves
        router.push('/students')
      } else {
        const errorData = await res.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error al eliminar el alumno:', error)
      alert('Ocurrió un error al intentar eliminar le alumno.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-10 pb-24 lg:py-20">
      {/* Navigation Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              onClick={() => router.push('/students')}
              className="h-8 w-8 rounded-full"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight capitalize">{name}</h1>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        {/* SECTION: HORARIOS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <CalendarDays className="size-4" />
              Próximas Sesiones
            </h2>
            <Button
              onClick={() => {
                setEditingSchedule(null)
                setIsDialogOpen(true)
              }}
              size="sm"
            >
              <ClockPlus className="size-4" /> Añadir
            </Button>
          </div>

          <div className="grid gap-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-[#7e9e75]" />
              </div>
            ) : schedules.length === 0 ? (
              <Card className="border-dashed shadow-none">
                <CardContent className="text-muted-foreground py-10 text-center text-sm italic">
                  No hay horarios asignados todavía.
                </CardContent>
              </Card>
            ) : (
              schedules.map((slot) => (
                <div
                  key={slot._id}
                  className="group bg-muted/70 flex items-center justify-between rounded-2xl p-4 transition-all"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          slot.occurrence === 'weekly'
                            ? 'border-[#7e9e75]/20 bg-[#7e9e75]/5 text-[#5a7254]'
                            : 'border-amber-200 bg-amber-50 text-amber-600'
                        }
                      >
                        {slot.occurrence === 'weekly' ? DAYS[slot.dayOfWeek] : 'Fecha única'}
                      </Badge>
                      <Badge variant="secondary" className="bg-secondary/50 gap-0 font-mono">
                        <DollarSign className="size-3" />
                        {slot.price}
                      </Badge>
                    </div>
                    <span className="text-base font-semibold">
                      {slot.startTime} — {slot.endTime}
                    </span>
                  </div>

                  {/* ACTIONS : ÉDITION ET SUPPRESSION */}
                  <div className="flex items-center gap-0">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(slot)}>
                      <Edit className="text-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(slot._id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* SECTION: OBSERVACIONES RECIENTES */}
        <section className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <MessageSquare className="size-4" />
              Notas de Seguimiento
            </h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
                  <History className="size-4" /> Historial
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <History className="size-5 text-[#7e9e75]" />
                    Historial de {name}
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-4 max-h-[50vh] space-y-4 overflow-y-auto pr-2">
                  {student?.notes?.length > 0 ? (
                    student.notes
                      .slice()
                      .reverse()
                      .map((note, i) => (
                        <div key={i} className="border-l-2 border-[#7e9e75] py-1 pl-4">
                          <p className="text-sm leading-relaxed">{note.content}</p>
                          <p className="text-muted-foreground mt-1 text-[10px] font-medium tracking-tighter uppercase opacity-70">
                            {new Date(note.createdAt).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      ))
                  ) : (
                    <p className="text-muted-foreground py-4 text-center text-sm">
                      No hay notas registradas.
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {student?.notes?.length > 0 ? (
              student.notes
                .slice(-2)
                .reverse()
                .map((note, idx) => (
                  <div
                    key={idx}
                    className="bg-muted/30 hover:border-muted-foreground/20 rounded-xl border border-transparent p-4 transition-colors"
                  >
                    <p className="text-sm leading-relaxed">{note.content}</p>
                    <p className="text-muted-foreground mt-2 text-[10px] font-medium tracking-wider uppercase">
                      {new Date(note.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                  </div>
                ))
            ) : (
              <p className="text-muted-foreground pl-1 text-sm italic">
                Sin observaciones recientes.
              </p>
            )}
          </div>

          <div className="relative mt-6">
            <Textarea
              placeholder="¿Qué aprendió hoy?..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="border-muted-foreground/30 min-h-[100px] resize-none rounded-xl focus-visible:ring-[#7e9e75]"
            />
            <Button
              onClick={handleAddNote}
              disabled={isSubmittingNote || !newNote.trim()}
              className="absolute right-3 bottom-3"
              size="sm"
            >
              {isSubmittingNote ? <Loader2 className="animate-spin" /> : <Send />}
              <span>Guardar</span>
            </Button>
          </div>
        </section>
      </div>

      <ScheduleDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        studentId={id}
        schedule={editingSchedule}
        onSuccess={loadAllData}
      />

      <Button
        variant={'destructive'}
        className="w-full gap-2" // Ajout de w-full pour un meilleur look mobile
        onClick={handleDeleteStudent}
      >
        <Trash className="size-4" />
        Borrar el alumno
      </Button>
    </div>
  )
}
