'use client'

import { addDays, format, isSameDay, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Ban,
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  MessageSquare,
  PlusCircle,
  Send,
  Smartphone,
  X,
} from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'
import { useMemo, useState } from 'react'

import { addStudentNote } from '@/app/actions/student-actions' // Ton action existante
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Item, ItemActions, ItemContent, ItemMedia } from '@/components/ui/item'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea' // Assure-toi d'avoir ce composant
import { useAttendance } from '@/context/AttendanceContext'
import { useSchedules } from '@/context/ScheduleContext'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import google from '../../../../../public/icons/google.svg'

const HomeDashboard = () => {
  const router = useRouter()
  const { data: session, status: authStatus } = useSession()
  const {
    schedules,
    loading: schedulesLoading,
    selectedDate,
    setSelectedDate,
    refreshSchedules,
  } = useSchedules()
  const { attendances, updateStatus } = useAttendance()
  const { isInstallable, handleInstallClick } = usePWAInstall()

  // États pour les notes
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOpenNotes = (student) => {
    setSelectedStudent(student)
    setIsNotesOpen(true)
  }

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedStudent?._id) return
    setIsSubmitting(true)
    try {
      const res = await addStudentNote(selectedStudent._id, newNote)
      if (res.success) {
        setNewNote('')
        // Si tu as une fonction pour rafraîchir les données dans ton context :
        if (refreshSchedules) await refreshSchedules()
        setIsNotesOpen(false)
      }
    } catch (error) {
      console.error('Error adding note:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  const enrichedSchedules = useMemo(() => {
    const now = new Date()
    const currentH = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const isViewingToday = isSameDay(selectedDate, now)

    return [...schedules]
      .map((slot) => ({
        ...slot,
        status: attendances[slot._id] || 'pending',
        isPast: isViewingToday ? slot.endTime < currentH : selectedDate < now,
      }))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [schedules, attendances, selectedDate])

  const groupedSchedules = useMemo(() => {
    const groups = {}
    enrichedSchedules.forEach((slot) => {
      if (!groups[slot.startTime]) groups[slot.startTime] = []
      groups[slot.startTime].push(slot)
    })
    return groups
  }, [enrichedSchedules])

  const stats = useMemo(() => {
    const activeSchedules = enrichedSchedules.filter((s) => s.status !== 'canceled')
    const total = activeSchedules.length
    const presentCount = activeSchedules.filter((s) => s.status === 'present').length
    const totalRevenue = enrichedSchedules
      .filter((s) => s.status === 'present')
      .reduce((sum, slot) => sum + (slot.price || 0), 0)
    const percentage = total > 0 ? (presentCount / total) * 100 : 0
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

  if (authStatus === 'unauthenticated') {
    return (
      <div className="flex h-[90vh] flex-col items-center justify-center gap-2">
        <h1 className="text-xl font-bold">Sesión no iniciada</h1>
        <p className="text-muted-foreground">Identifícate para continuar</p>
        <Button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          variant={'outline'}
          className={'mt-4'}
        >
          <Image
            unoptimized
            src={google}
            width={20}
            height={20}
            alt="Icone Google"
            aria-hidden={true}
          />
          continuar con Google
        </Button>
      </div>
    )
  }

  return (
    <section className="animate-in fade-in mb-[10vh] flex w-full max-w-2xl flex-col gap-8 px-4 duration-500 xl:mx-auto xl:px-0">
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

      <header className="flex items-center justify-between py-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {isToday ? `Hola, ${firstName} 👋` : 'Historial'}
          </h1>
          <p className="text-muted-foreground text-sm capitalize">
            {format(selectedDate, "eeee, d 'de' MMMM", { locale: es })}
          </p>
        </div>
      </header>

      <div className="flex items-center justify-between rounded-full border bg-transparent px-1 py-0.5">
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

      <Card className="bg-muted/20 overflow-hidden shadow-none">
        <CardContent className="space-y-4 px-6 py-0">
          <div className="flex items-start justify-between">
            <p className="text-3xl font-medium tracking-tight">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-end justify-between font-mono text-[11px]">
              <p className="font-semibold">
                {stats.presentCount} / {stats.total}{' '}
                <span className="text-muted-foreground">clases</span>
              </p>
              <p className="text-primary font-bold">Assistencia {Math.round(stats.percentage)}%</p>
            </div>
            <Progress value={stats.percentage} className="h-2" indicatorClassName="bg-[#7e9e75]" />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <h2 className="text-muted-foreground px-1 text-xs font-bold tracking-widest uppercase">
          {isToday ? 'Horario de hoy' : `Clases del ${format(selectedDate, 'dd/MM')}`}
        </h2>

        {Object.keys(groupedSchedules).length === 0 ? (
          <div className="rounded-xl border-2 border-dashed py-12 text-center opacity-50">
            <p className="text-muted-foreground text-sm italic">No hay clases registradas.</p>
          </div>
        ) : (
          Object.entries(groupedSchedules).map(([time, slots]) => (
            <div key={time} className="flex flex-col gap-3 transition-opacity duration-300">
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1 text-xs font-bold shadow-sm"
                >
                  {time} - {slots[0].endTime}
                </Badge>
                <Separator className="flex-1 opacity-40" />
              </div>
              <div className="flex flex-col gap-2">
                {slots.map((slot) => (
                  <Item key={slot._id} variant="outline" className="rounded-xl">
                    <ItemContent>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{slot.studentId?.name || 'Alumno'}</p>

                        {/* Bulle de notes (Pleine si notes, Vide si aucune) */}
                        <button
                          onClick={() => handleOpenNotes(slot.studentId)}
                          className={`flex items-center justify-center rounded-full p-1 transition-colors ${
                            slot.studentId?.notes?.length > 0
                              ? 'bg-[#7e9e75]/10 text-[#5a7254] hover:bg-[#7e9e75]/20'
                              : 'text-muted-foreground/40 hover:bg-muted hover:text-muted-foreground'
                          }`}
                        >
                          {slot.studentId?.notes?.length > 0 ? (
                            <>
                              <MessageSquare className="size-3" />
                              <span className="ml-1 text-[10px] font-bold">
                                {slot.studentId.notes.length}
                              </span>
                            </>
                          ) : (
                            <PlusCircle className="size-3.5" />
                          )}
                        </button>

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
                        {formatCurrency(slot.price || 0)}
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
          ))
        )}
      </div>

      {/* Dialog para ver/añadir las notas */}
      <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
        <DialogContent className="rounded-3xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="size-5 text-[#7e9e75]" />
              Notas de {selectedStudent?.name}
            </DialogTitle>
          </DialogHeader>

          {/* Zone d'ajout rapide de note */}
          <div className="relative mt-2">
            <Textarea
              placeholder="¿Qué pasó hoy?..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="bg-muted/30 min-h-[80px] resize-none rounded-2xl focus-visible:ring-[#7e9e75]"
            />
            <Button
              size="sm"
              onClick={handleAddNote}
              disabled={isSubmitting || !newNote.trim()}
              className="absolute right-2 bottom-2 size-8 rounded-full bg-[#7e9e75] p-0 hover:bg-[#6b8a63]"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4 text-white" />
              )}
            </Button>
          </div>

          <Separator className="my-2 opacity-50" />

          {/* Liste des notes existantes */}
          <div className="max-h-[40vh] space-y-4 overflow-y-auto pr-2">
            {selectedStudent?.notes?.length > 0 ? (
              selectedStudent.notes
                .slice()
                .reverse()
                .map((note, idx) => (
                  <div key={idx} className="border-l-2 border-[#7e9e75] py-1 pl-4">
                    <p className="text-sm leading-relaxed">{note.content}</p>
                    <p className="text-muted-foreground mt-1 font-mono text-[10px]">
                      {new Date(note.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))
            ) : (
              <p className="text-muted-foreground py-4 text-center text-sm italic">
                No hay notas previas.
              </p>
            )}
          </div>

          <Button
            onClick={() =>
              router.push(`/students/${selectedStudent?._id}?name=${selectedStudent?.name}`)
            }
            variant="outline"
            className="mt-2 w-full rounded-xl"
          >
            Ver perfil completo
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  )
}

export default HomeDashboard
