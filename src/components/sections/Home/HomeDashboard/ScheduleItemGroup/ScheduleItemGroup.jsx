'use client'

import { ItemSeparator } from '@/components/ui/item'
import Image from 'next/image'
import React from 'react'

// Imports de imágenes (ajusta las rutas según tu estructura)
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { ArrowUpRightIcon, FolderClockIcon } from 'lucide-react'
import circles1 from '../../../../../../public/images/circles.svg'
import circles2 from '../../../../../../public/images/circles2.svg'
import ScheduleItem from './ScheduleItem/ScheduleItem'

const ScheduleItemGroup = ({ time, slots, index, onOpenNotes, onUpdateStatus, formatCurrency }) => {
  // --- LÓGICA DE ALTERNANCIA ---
  const colors = ['bg-[#EAEBDD]', 'bg-[#DEECDB]', 'bg-[#E8E2FE]', 'bg-[#E5F7F9]']
  const bgColor = colors[index % colors.length]

  // Un golpe de cada dos para la imagen SVG
  const circlesToDisplay = index % 2 === 0 ? circles1 : circles2

  if (slots.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderClockIcon />
          </EmptyMedia>
          <EmptyTitle>No Projects Yet</EmptyTitle>
          <EmptyDescription>
            You haven&apos;t created any projects yet. Get started by creating your first project.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <Button>Create Project</Button>
          <Button variant="outline">Import Project</Button>
        </EmptyContent>
        <Button variant="link" asChild className="text-muted-foreground" size="sm">
          <a href="#">
            Learn More <ArrowUpRightIcon />
          </a>
        </Button>
      </Empty>
    )
  }

  return (
    <div className="flex items-stretch gap-4">
      {/* Columna de Izquierda: Tiempo */}
      <div className="flex min-w-[48px] flex-col items-center pt-1">
        <span className="text-sm leading-none font-semibold tracking-tight uppercase">{time}</span>
        <span className="text-muted-foreground/50 mt-1 text-sm font-medium">
          {slots[0].endTime}
        </span>
        <div className="mt-2 mb-1 w-[1px] flex-1 rounded-full bg-slate-200" />
      </div>

      {/* Columna de Derecha: Contenedor de Items */}
      <div
        className={`relative flex-1 overflow-hidden rounded-xl p-6 ${bgColor} transition-all active:scale-[0.99]`}
      >
        <div className="flex flex-col gap-4">
          {slots.map((slot, slotIndex) => (
            <React.Fragment key={slot._id || slotIndex}>
              <ScheduleItem
                slot={slot}
                onOpenNotes={onOpenNotes}
                onUpdateStatus={onUpdateStatus}
                formatCurrency={formatCurrency}
              />
              {slotIndex < slots.length - 1 && <ItemSeparator />}
            </React.Fragment>
          ))}
        </div>

        {/* Decoración de fondo */}
        <Image
          src={circlesToDisplay}
          alt="circles"
          width={0}
          height={0}
          className={`absolute z-1 w-[25vw] opacity-40 ${
            index % 2 === 0 ? '-top-2 left-20' : '-bottom-2 left-20'
          }`}
        />
      </div>
    </div>
  )
}

export default ScheduleItemGroup
