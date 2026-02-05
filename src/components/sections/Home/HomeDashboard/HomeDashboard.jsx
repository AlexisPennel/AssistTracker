'use client'

import { isSameDay } from 'date-fns'
import { Loader2, MessageSquare, Send } from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react' // Ajout de React pour le Fragment

import { addStudentNote } from '@/app/actions/student-actions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useAttendance } from '@/context/AttendanceContext'
import { useSchedules } from '@/context/ScheduleContext'

// Imports des images
import google from '../../../../../public/icons/google.svg'

import AuthButton from '@/components/next-auth/AuthButton/AuthButton'
import DashboardHeader from './DashboardHeader'
import DateSelector from './DateSelector'
import EmptyScheduleItemGroup from './ScheduleItemGroup/EmptyScheduleItemGroup'
import ScheduleItemGroup from './ScheduleItemGroup/ScheduleItemGroup'

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
          <Image unoptimized src={google} width={20} height={20} alt="Icone Google" />
          continuar con Google
        </Button>
      </div>
    )
  }

  return (
    <section className="animate-in fade-in mb-[10vh] flex w-full max-w-2xl flex-col gap-6 px-2 duration-500 xl:mx-auto xl:px-0">
      <div className="flex items-center justify-between gap-2 px-3 pt-2">
        <div className="">
          <p className="text-lg font-medium">Hola {session.user.firstName} 👋</p>
        </div>
        <AuthButton />
      </div>

      {/* Header avec stats du jour */}
      <DashboardHeader
        schedules={schedules}
        selectedDate={selectedDate}
        stats={stats}
        formatCurrency={formatCurrency}
      />

      {/* Sélecteur de date */}
      <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Section Timeline */}
      <div className="flex flex-col gap-6">
        {Object.entries(groupedSchedules).length > 0 ? (
          <>
            {Object.entries(groupedSchedules).map(([time, slots], index) => (
              <ScheduleItemGroup
                key={time}
                time={time}
                slots={slots}
                index={index}
                onOpenNotes={handleOpenNotes}
                onUpdateStatus={updateStatus}
                formatCurrency={formatCurrency}
              />
            ))}
          </>
        ) : (
          <EmptyScheduleItemGroup onSuccess={refreshSchedules} />
        )}
      </div>

      {/* Dialog para notas */}
      <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
        <DialogContent className="rounded-3xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="size-5 text-[#717B64]" />
              Notas de {selectedStudent?.name}
            </DialogTitle>
          </DialogHeader>

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
              className="absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-full bg-[#7e9e75] p-0 hover:bg-[#6b8a63]"
            >
              {isSubmitting ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Send className="size-3 text-white" />
              )}
            </Button>
          </div>

          <Separator className="my-2 opacity-50" />

          <div className="max-h-[40vh] space-y-4 overflow-y-auto pr-2">
            {selectedStudent?.notes?.length > 0 ? (
              <div className="space-y-4">
                {/* On inverse d'abord pour avoir les plus récentes, puis on prend les 2 premières */}
                {selectedStudent.notes
                  .slice()
                  .reverse()
                  .slice(0, 2)
                  .map((note, idx) => (
                    <div key={idx} className="bg-muted/50 rounded-sm py-1 pl-4">
                      <p className="text-sm leading-relaxed">{note.content}</p>
                      <p className="text-muted-foreground mt-1 font-mono text-[10px]">
                        {new Date(note.createdAt).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  ))}

                {/* Affichage du compteur si plus de 2 notes */}
                {selectedStudent.notes.length > 2 && (
                  <p className="pl-4 text-xs font-bold text-[#717B64]">
                    + {selectedStudent.notes.length - 2} notas más
                  </p>
                )}
              </div>
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
