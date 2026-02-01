import { Geist, Geist_Mono } from 'next/font/google'

import MenuBar from '@/components/layout/MenuBar/MenuBar'
import ServiceWorkerRegister from '@/components/pwa/ServiceWorkerRegister'
import { Providers } from '@/providers/providers'
import '../globals.css'
import Header from '@/components/layout/Header/Header'

// Fonts optimisées (bon CLS, bonne perf)
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

// SEO global + paramètres de base du site
export const metadata = {
  icons: [
    { rel: 'icon', type: 'image/x-icon', url: '/favicon/favicon.ico' }, // fallback classique
    { rel: 'icon', type: 'image/png', sizes: '96x96', url: '/favicon/favicon-96x96.png' },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '192x192',
      url: '/favicon/web-app-manifest-192x192.png',
      purpose: 'maskable',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '512x512',
      url: '/favicon/web-app-manifest-512x512.png',
      purpose: 'maskable',
    },
    { rel: 'apple-touch-icon', sizes: '180x180', url: '/favicon/apple-touch-icon.png' },
  ],
  metadataBase: new URL('https://smoke-tracker-six.vercel.app/'),
  title: {
    default: 'Attendify',
  },
  description:
    'Suis ta consommation et diminue progressivement la cigarette. Essaye gratuitement SmokeTracker et retrouves ta liberté !',
  openGraph: {
    type: 'website',
    siteName: 'Attendify',
    locale: 'fr_FR',
    url: 'https://smoke-tracker-six.vercel.app/',
  },
  twitter: {
    card: 'summary_large_image',
  },
  manifest: '/favicon/site.webmanifest',
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <ServiceWorkerRegister />
          <Header />
          <MenuBar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
