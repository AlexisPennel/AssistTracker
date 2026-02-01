// src/components/layout/Header/Header.jsx
import AuthButton from '@/components/next-auth/AuthButton/AuthButton'
import { CalendarCheck } from 'lucide-react'
import Link from 'next/link'

export default function Header() {
  const navLinks = [
    { label: 'Accueil', href: '/', isActive: true },
    { label: 'À propos', href: '/about' },
    { label: 'Services', href: '#services' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <header className="xl:bg-card top-0 left-0 z-50 w-full md:block xl:fixed">
      <div className="flex h-fit min-h-[60px] items-center justify-between p-4 xl:mx-auto xl:max-w-2xl xl:px-0 2xl:py-6">
        {/* Logo */}
        <div className="justify-self-start">
          <Link
            href="/"
            aria-label="Page d'accueil"
            className=" flex items-center gap-2.5 rounded-full text-2xl font-bold"
          >
            <div>
              <CalendarCheck className="bg-muted size-8 rounded-sm p-1.5" />
            </div>
            Attendify
          </Link>
        </div>
        <div className="hidden xl:block">
          <AuthButton />
        </div>
      </div>
    </header>
  )
}
