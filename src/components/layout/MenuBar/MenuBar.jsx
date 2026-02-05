'use client'

import { ChartColumn, HomeIcon, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const MenuBar = () => {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 z-50 w-screen bg-transparent lg:hidden">
      <div className="bg-background mx-auto flex h-fit w-screen items-center justify-center gap-8 border-t px-4 py-4">
        <Link href="/">
          <HomeIcon
            size={20}
            className={pathname === '/' ? 'text-[#717B64] transition' : 'text-muted-foreground/40'}
          />
        </Link>

        <Link href="/students">
          <Users
            size={20}
            className={
              pathname === '/students' ? 'text-[#717B64] transition' : 'text-muted-foreground/40'
            }
          />
        </Link>

        <Link href="/stats">
          <ChartColumn
            size={20}
            className={
              pathname === '/stats' ? 'text-[#717B64] transition' : 'text-muted-foreground/40'
            }
          />
        </Link>
      </div>
    </div>
  )
}

export default MenuBar
