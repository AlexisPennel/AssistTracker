'use client'

import AuthButton from '@/components/next-auth/AuthButton/AuthButton'
import { Button } from '@/components/ui/button'
import { HomeIcon, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const MenuBar = () => {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 z-50 w-screen bg-transparent lg:hidden">
      <div className="bg-accent mx-auto flex h-fit w-screen items-center justify-center gap-4 px-4 py-3">
        <Button
          asChild
          size="icon"
          variant="ghost"
          aria-label="Accueil"
          className={
            pathname === '/' ? 'bg-primary text-primary-foreground rounded-full transition' : ''
          }
        >
          <Link href="/">
            <HomeIcon size={20} />
          </Link>
        </Button>

        <Button
          asChild
          size="icon"
          variant="ghost"
          aria-label="push"
          disabled
          className={
            pathname === '/students'
              ? 'bg-primary text-primary-foreground rounded-full transition'
              : ''
          }
        >
          <Link href="/students">
            <Users size={20} />
          </Link>
        </Button>
        <AuthButton />
      </div>
    </div>
  )
}

export default MenuBar
