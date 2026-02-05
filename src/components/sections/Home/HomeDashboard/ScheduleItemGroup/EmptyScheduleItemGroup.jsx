import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { FolderClockIcon } from 'lucide-react'
import Link from 'next/link'
import { AddStudentDialog } from '../AddStudentDialog'

const EmptyScheduleItemGroup = ({ onSuccess }) => {
  return (
    <Empty className={'mx-2 border border-dashed'}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderClockIcon />
        </EmptyMedia>
        <EmptyTitle>Sin clases programadas</EmptyTitle>
        <EmptyDescription>
          No tienes clases programadas para hoy. Agrega alumnos y asigna sus turnos para comenzar.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <AddStudentDialog onSuccess={onSuccess} />
        <Button variant="outline" asChild>
          <Link href={'/students'}>Lista de alumnos</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}

export default EmptyScheduleItemGroup
