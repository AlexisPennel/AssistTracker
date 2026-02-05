'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import Image from 'next/image'
import DashboardStats from './DashboardStats'

import line from '../../../../../public/images/line.svg'

const DashboardHeader = ({ schedules, selectedDate, stats, formatCurrency }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#DEECDB] p-4 px-3">
      <header className="mb-10 flex items-center gap-3">
        {/* <Image
            src={session.user?.image}
            alt="Image user"
            width={40}
            height={40}
            className="rounded-full object-cover"
          /> */}
        <div className="flex flex-col gap-0">
          <h1 className="text-lg font-bold first-letter:uppercase">
            {format(selectedDate, "eeee d 'de' MMMM", { locale: es })}
          </h1>
          <p className="text-muted-foreground/80 text-sm">{schedules.length} clases hoy</p>
        </div>
      </header>
      <DashboardStats stats={stats} formatCurrency={formatCurrency} />
      <Image
        unoptimized
        src={line}
        width={0}
        height={0}
        alt="svg"
        className="absolute -top-4 right-0 z-1 w-[35vw] opacity-10"
      />
    </div>
  )
}

export default DashboardHeader
