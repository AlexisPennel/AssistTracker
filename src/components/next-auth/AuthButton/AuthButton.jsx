'use client'

import { Button } from '@/components/ui/button'
import { ItemGroup, ItemSeparator } from '@/components/ui/item'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { getInitials } from '@/lib/next-auth/getInitials'
import { LogOut, User } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import AvatarImage from '../AvatarImage/AvatarImage'

export default function AuthButton() {
  const { data: session, status } = useSession()

  // =========================
  // UTILISATEUR CONNECTÉ
  // =========================
  if (status === 'authenticated' && session?.user) {
    const firstName = session?.user?.firstName
    const lastName = session?.user?.lastName
    const initials = getInitials(firstName, lastName)
    const fullName = `${session.user.firstName ?? ''} ${session.user.lastName ?? ''}`.trim()

    return (
      <div className="flex items-center gap-2 xl:gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <button
              aria-label="Espace client"
              className="flex h-[36px] w-[36px] cursor-pointer items-center justify-center xl:h-auto xl:w-auto"
            >
              <AvatarImage
                image={session.user.image}
                alt={`photo de profil de ${session.user.name}`}
                size="size-6.5 lg:size-9"
                initials={initials}
              />
            </button>
          </PopoverTrigger>

          <PopoverContent side="top" className="mt-2 mr-4 max-w-[300px] px-2 py-3 shadow-none">
            <div className="flex flex-col gap-4">
              {/* Header utilisateur */}
              <div className="flex items-center gap-2 px-2">
                <AvatarImage
                  image={session.user.image}
                  alt={`photo de profil de ${fullName}`}
                  size="w-9 h-9"
                  initials={initials}
                />
                <div className="space-y-0">
                  <p className="text-sm font-medium">{fullName}</p>
                  <p className="text-muted-foreground text-xs">{session.user.email}</p>
                </div>
              </div>

              <ItemSeparator />

              {/* Navigation */}
              <ItemGroup className="-mt-2 space-y-1 px-0 py-0">
                {/* Déconnexion */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => signOut()}
                >
                  <LogOut />
                  Se déconnecter
                </Button>
              </ItemGroup>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  // =========================
  // UTILISATEUR NON CONNECTÉ
  // =========================
  return (
    <Link href="/connexion" aria-label="Connexion">
      <Button size="icon" variant="ghost">
        <User />
      </Button>
    </Link>
  )
}
