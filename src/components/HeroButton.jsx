'use client'

import useAnalyticsEvent from '@/components/analytics/useAnalyticsEvent'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

export default function HeroButton() {
  const sendEvent = useAnalyticsEvent()
  const t = useTranslations('HomePage')

  const handleClick = () => {
    sendEvent('hero_primary_cta_click', {
      section: 'hero',
      action: 'cta_click',
      label: 'Découvrir nos services',
    })
  }

  return (
    <Button variant={'secondary'} className="mt-4" onClick={handleClick}>
      {t('hero.cta')}
    </Button>
  )
}
