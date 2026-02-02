'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ChevronRight, Loader2, Search, User } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => {
        setStudents(data)
        setLoading(false)
      })
  }, [])

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading)
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )

  return (
    <div className="mx-auto mt-10 max-w-2xl space-y-6 px-4 lg:mt-24">
      <header className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Mis Alumnos</h1>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar alumno..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="grid gap-3">
        {filteredStudents.map((student) => (
          <Link key={student._id} href={`/students/${student._id}`}>
            <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary rounded-full p-2">
                    <User className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{student.name}</p>
                    <p className="text-muted-foreground text-xs">{student.price} MXN / sesión</p>
                  </div>
                </div>
                <ChevronRight className="text-muted-foreground size-4" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
