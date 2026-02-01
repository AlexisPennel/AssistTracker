'use client'

import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'

import { Button } from './button'
import { Item, ItemContent, ItemGroup, ItemTitle } from './item'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()

  function switchLanguage(lang) {
    document.cookie = `locale=${lang}; path=/`
    router.refresh()
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="bg-transparent text-xs uppercase" variant={'outline'} size={'sm'}>
          {locale}
        </Button>
      </PopoverTrigger>

      <PopoverContent className={'w-fit p-2'}>
        <ItemGroup>
          <Item asChild size="menuLink">
            <div onClick={() => switchLanguage('fr')} className="hover:bg-accent cursor-pointer">
              <ItemContent>
                <ItemTitle>Français</ItemTitle>
              </ItemContent>
            </div>
          </Item>
          <Item asChild size="menuLink">
            <div onClick={() => switchLanguage('en')} className="hover:bg-accent cursor-pointer">
              <ItemContent>
                <ItemTitle>Anglais</ItemTitle>
              </ItemContent>
            </div>
          </Item>
        </ItemGroup>
      </PopoverContent>
    </Popover>
  )
}
