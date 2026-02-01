import HeroButton from '@/components/HeroButton'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import hero from '../../../../../public/images/home/hero.jpg'

const HeroSection = () => {
  const t = useTranslations('HomePage')

  return (
    <section className="margin-header relative flex h-[40vh] w-full items-center justify-center xl:h-[70vh]">
      <Image
        src={hero}
        alt="Hero section de ..."
        fill
        placeholder="blur"
        priority
        quality={95}
        className="absolute inset-0 object-cover brightness-80 xl:brightness-70"
      />
      <header className="z-2 flex flex-col items-center gap-4 px-4 md:px-0 2xl:gap-6">
        <h1 className="text-primary-foreground max-w-xl text-center text-[28px] leading-8 font-bold text-balance xl:text-4xl xl:leading-10 2xl:text-5xl 2xl:leading-14">
          {t('hero.title')}
        </h1>
        <p className="text-primary-foreground/80 max-w-md text-center text-pretty 2xl:text-base">
          {t('hero.description')}
        </p>
        <HeroButton />
      </header>
    </section>
  )
}

export default HeroSection
