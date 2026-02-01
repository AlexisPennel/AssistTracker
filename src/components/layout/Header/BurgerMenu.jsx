'use client'

import MobileAuthMenu from '@/components/next-auth/MobileAuthMenu/MobileAuthMenu'
import { Button } from '@/components/ui/button'
import { Grip, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function BurgerMenu() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    document.body.style.overflow = open ? 'hidden' : ''

    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <Button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu mobile"
        aria-expanded={open}
        variant="ghost"
        className="fixed top-3.5 right-1.5 z-[1000] lg:hidden"
      >
        {open ? <X className="size-6" /> : <Grip className="size-6" />}
      </Button>

      <nav
        className={`dark:bg-card/80 fixed inset-0 z-40 flex items-center justify-center bg-white transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
      >
        <ul className="flex flex-col items-center gap-8 text-3xl font-semibold">
          <li>
            <Link href="/" onClick={() => setOpen(false)}>
              Accueil
            </Link>
          </li>
          <li>
            <Link href="/tarifs" onClick={() => setOpen(false)}>
              Services
            </Link>
          </li>
          <li>
            <Link href="/contact" onClick={() => setOpen(false)}>
              Contact
            </Link>
          </li>
          <div className="flex items-center gap-2">
            <MobileAuthMenu />
          </div>
        </ul>
      </nav>
    </>
  )
}
