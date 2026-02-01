import CookieReset from '@/components/ui/CookieReset'
import { Linkedin, Twitter } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  const navLinks = [
    { label: 'Accueil', href: '/' },
    { label: 'À propos', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Services', href: '#services' },
  ]

  const socialLinks = [
    {
      label: 'Twitter',
      url: 'https://twitter.com',
      icon: Twitter,
    },
    {
      label: 'LinkedIn',
      url: 'https://linkedin.com',
      icon: Linkedin,
    },
  ]

  return (
    <footer className="bg-zinc-900 py-10 text-zinc-200">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
          {/* Navigation */}
          <nav aria-label="Navigation du pied de page">
            <h3 className="mb-4 text-lg font-semibold text-white">Pages</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-white/60">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <CookieReset />
              </li>
            </ul>
          </nav>

          {/* Réseaux sociaux */}
          <div aria-label="Réseaux sociaux">
            <h3 className="mb-4 text-lg font-semibold text-white">Suivez-nous</h3>
            <ul className="flex items-center gap-6">
              {socialLinks.map(({ label, url, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Suivez-nous sur ${label}`}
                    className="transition hover:text-white/60"
                  >
                    <Icon aria-hidden="true" size={22} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Copyright */}
          <div className="md:text-right">
            <h3 className="mb-4 text-lg font-semibold text-white">Informations</h3>
            <p className="text-sm text-zinc-400">
              © {year} VotreEntreprise — Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
