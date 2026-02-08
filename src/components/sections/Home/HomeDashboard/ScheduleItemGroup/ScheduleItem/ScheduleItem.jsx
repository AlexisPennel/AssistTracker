'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Ban, Check, X } from 'lucide-react'

const ScheduleItem = ({ slot, onOpenNotes, onUpdateStatus, formatCurrency, index = 0 }) => {
  return (
    <div
      className={`relative z-2 flex w-full flex-row justify-between transition-all active:scale-[0.98]`}
    >
      {/* 1. Header : Nom & Bouton Note (Action discrète) */}
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-2" onClick={() => onOpenNotes(slot.studentId)}>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm leading-tight font-bold">
                {slot.studentId?.name || 'Alumno'}
              </h3>
              {slot.occurrence === 'once' && (
                <Badge
                  variant="secondary"
                  className="h-4 border-none bg-white/50 text-[9px] uppercase"
                >
                  Una vez
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium opacity-60">{formatCurrency(slot.price || 0)}</p>
          </div>
        </div>
      </header>

      {/* 2. Actions de Statut : Boutons circulaires en bas */}
      <div className="flex items-center gap-2">
        <StatusButton
          icon={<Ban className="size-4" />}
          label="Canceled"
          active={slot.status === 'canceled'}
          activeClass="bg-[#C28C66] text-white border-none"
          onClick={() =>
            onUpdateStatus(
              slot._id,
              slot.studentId._id,
              slot.status === 'canceled' ? 'pending' : 'canceled'
            )
          }
        />
        <StatusButton
          icon={<X className="size-4" />}
          label="Absent"
          active={slot.status === 'absent'}
          activeClass="bg-[#B37E7E] text-white border-none"
          onClick={() =>
            onUpdateStatus(
              slot._id,
              slot.studentId._id,
              slot.status === 'absent' ? 'pending' : 'absent'
            )
          }
        />
        <StatusButton
          icon={<Check className="size-4" />}
          label="Present"
          active={slot.status === 'present'}
          activeClass="bg-[#9DB37E] text-white border-none"
          onClick={() =>
            onUpdateStatus(
              slot._id,
              slot.studentId._id,
              slot.status === 'present' ? 'pending' : 'present'
            )
          }
        />
      </div>
    </div>
  )
}

const StatusButton = ({ icon, label, active, activeClass, onClick }) => (
  <Button
    variant="outline"
    size="icon"
    className={`border-foreground/20 h-7.5 w-7.5 rounded-full bg-transparent ${active ? activeClass : 'text-muted-foreground/80'}`}
    onClick={onClick}
  >
    {icon}
    <span className="sr-only text-[11px] font-bold tracking-wider uppercase">{label}</span>
  </Button>
)

export default ScheduleItem
