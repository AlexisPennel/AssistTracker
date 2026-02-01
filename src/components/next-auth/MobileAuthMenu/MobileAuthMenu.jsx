'use client'

import { Button } from '@/components/ui/button'
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { getInitials } from '@/lib/next-auth/getInitials'
import { Gem, Heart, LogOut, Package, User } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import AvatarImage from '../AvatarImage/AvatarImage'

export default function MobileAuthDrawer() {
  const { data: session, status } = useSession()

  // =========================
  // UTILISATEUR NON CONNECTÉ
  // =========================
  if (status !== 'authenticated' || !session?.user) {
    return (
      <Link href="/connexion" aria-label="Connexion">
        <Button size="icon" variant="outline">
          <User />
        </Button>
      </Link>
    )
  }

  const initials = getInitials(session.user.firstName, session.user.lastName)

  const fullName = `${session.user.firstName ?? ''} ${session.user.lastName ?? ''}`.trim()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button aria-label="Espace client">
          <AvatarImage
            image={session.user.image}
            alt={`photo de profil de ${fullName}`}
            size="w-9 h-9"
            initials={initials}
          />
        </button>
      </SheetTrigger>

      <SheetContent side="bottom" className="bg-background rounded-t-2xl px-4 py-6">
        <SheetHeader className={'sr-only'}>
          <SheetTitle>Menu utilisateur</SheetTitle>
        </SheetHeader>
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
            <Item asChild size="menuLink">
              <Link href="/espace-client/commandes">
                <ItemMedia variant="icon">
                  <Package />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Mes commandes</ItemTitle>
                </ItemContent>
              </Link>
            </Item>

            <Item asChild size="menuLink">
              <Link href="/espace-client/commandes">
                <ItemMedia variant="icon">
                  <Heart />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Wishlist</ItemTitle>
                </ItemContent>
              </Link>
            </Item>

            <Item asChild size="menuLink">
              <Link href="/espace-client/fidelite">
                <ItemMedia variant="icon">
                  <Gem />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Programme fidélité</ItemTitle>
                </ItemContent>
              </Link>
            </Item>

            <Item asChild size="menuLink">
              <Link href="/espace-client/compte">
                <ItemMedia variant="icon">
                  <User />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Mon compte</ItemTitle>
                </ItemContent>
              </Link>
            </Item>

            {/* Déconnexion */}
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full bg-transparent"
              onClick={() => signOut()}
            >
              <LogOut />
              Se déconnecter
            </Button>
          </ItemGroup>
        </div>
      </SheetContent>
    </Sheet>
  )
}
