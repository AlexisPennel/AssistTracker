'use client'

import { AddStudentDialog } from '@/components/sections/Home/HomeDashboard/AddStudentDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Loader2, Search, User } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

// 1. Définition des couleurs disponibles
const CARD_COLORS = ['bg-[#EAEBDD]', 'bg-[#DEECDB]', 'bg-[#E8E2FE]', 'bg-[#C9E5E8]']

export default function StudentsPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch('/api/students')
      const data = await res.json()
      setStudents(data)
    } catch (error) {
      console.error('Erreur lors du chargement des élèves:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/connexion')
    }
    if (authStatus === 'authenticated') {
      fetchStudents()
    }
  }, [authStatus, router, fetchStudents])

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  if (authStatus === 'loading' || loading)
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )

  return (
    <div className="mx-auto mt-8 mb-[10vh] max-w-2xl space-y-6 px-4 lg:mt-24">
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button size={'icon'} onClick={() => router.back()} className={'h-7 w-7 rounded-full'}>
            <ChevronLeft />
          </Button>
          <h1 className="text-2xl font-bold">Mis Alumnos</h1>
        </div>

        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar alumno..."
            className="rounded-full pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="grid gap-3">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student, index) => {
            // 2. Attribution d'une couleur basée sur l'index pour la stabilité
            const bgColor = CARD_COLORS[index % CARD_COLORS.length]

            return (
              <Link key={student._id} href={`/students/${student._id}?name=${student.name}`}>
                {/* 3. Application de la couleur dynamique */}
                <Card
                  className={`${bgColor} cursor-pointer border-none shadow-none transition-all`}
                >
                  <CardContent className="flex items-center justify-between px-4 py-0">
                    {/* Note: J'ai ajusté le py-0 en py-4 pour mieux voir la couleur */}
                    <div className="flex items-center gap-3">
                      <div className="text-primary rounded-full bg-white p-2">
                        <User className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{student.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {student.notes.length} notas
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-slate-500" />
                  </CardContent>
                </Card>
              </Link>
            )
          })
        ) : (
          <p className="text-muted-foreground py-10 text-center">No se encontraron alumnos.</p>
        )}
      </div>

      <div className="flex justify-center">
        <AddStudentDialog onSuccess={fetchStudents} />
      </div>
    </div>
  )
}
