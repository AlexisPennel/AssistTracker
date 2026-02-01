'use client'

import { BookOpenIcon, BriefcaseIcon, HomeIcon, MailIcon, SearchIcon } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import './globals.css'

export default function NotFound() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const pages = [
    { label: 'Accueil / Home', href: '/', icon: HomeIcon },
    { label: 'Services / Services', href: '/services', icon: BriefcaseIcon },
    { label: 'Contact / Contact', href: '/contact', icon: MailIcon },
    { label: 'Blog / Blog', href: '/blog', icon: BookOpenIcon },
  ]

  const results = useMemo(() => {
    if (!query) return []
    return pages.filter((page) => page.label.toLowerCase().includes(query.toLowerCase()))
  }, [query])

  return (
    <html lang="fr">
      <body>
        <div className="bg-background flex min-h-screen items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyTitle className="text-6xl font-semibold">404</EmptyTitle>
              <EmptyDescription>
                La page que vous recherchez n’existe pas ou a été déplacée.
                <br />
                <span className="italic">
                  The page you are looking for does not exist or has been moved.
                </span>
              </EmptyDescription>
            </EmptyHeader>

            <EmptyContent className="w-full max-w-md space-y-4">
              <Popover open={open && results.length > 0} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <div>
                    <InputGroup>
                      <InputGroupInput
                        placeholder="Rechercher une page / Search a page"
                        value={query}
                        className={'w-xs'}
                        onChange={(e) => {
                          setQuery(e.target.value)
                          setOpen(true)
                        }}
                      />
                      <InputGroupAddon>
                        <SearchIcon className="h-4 w-4" />
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  className="w-[var(--radix-popover-trigger-width)] p-1"
                >
                  <ul className="space-y-1">
                    {results.map((page) => {
                      const Icon = page.icon
                      return (
                        <li key={page.href}>
                          <Link
                            href={page.href}
                            className="hover:bg-muted flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                          >
                            <Icon className="text-muted-foreground h-4 w-4" />
                            {page.label}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </PopoverContent>
              </Popover>

              <EmptyDescription>
                Need help?{' '}
                <Link href="/contact" className="underline">
                  Contact support
                </Link>
              </EmptyDescription>
            </EmptyContent>
          </Empty>
        </div>
      </body>
    </html>
  )
}
