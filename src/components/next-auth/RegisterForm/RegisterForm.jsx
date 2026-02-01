'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CalendarCheck, Info } from 'lucide-react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export function RegisterForm({ className, ...props }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    newsletter: false,
    terms: false,
  })

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.terms) {
      alert('Vous devez accepter les CGV et CGU pour continuer.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Registration failed')
      }

      const signInResult = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
        callbackUrl: '/',
      })

      if (signInResult?.error) {
        throw new Error('Unable to sign in after registration')
      }

      window.location.href = signInResult.url
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={cn('flex flex-col gap-4', className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        {/* Header */}
        <div className="flex flex-col items-center gap-1 text-center">
          <Link
            href="/"
            aria-label="Page d'accueil"
            className="mb-8 flex items-center gap-2.5 rounded-full text-2xl font-bold"
          >
            <div>
              <CalendarCheck className="bg-muted size-8 rounded-sm p-1.5" />
            </div>
            Attendify
          </Link>

          <h1 className="text-2xl font-bold">Sign up</h1>
          <p className="text-muted-foreground text-sm">Step {step} of 2</p>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                required
              />
            </Field>

            <Button
              type="button"
              className="w-full"
              onClick={() => {
                if (!form.email || !form.password) {
                  alert('Veuillez renseigner un email et un mot de passe.')
                  return
                }
                setStep(2)
              }}
            >
              Continue
            </Button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <Field>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldLabel>First name</FieldLabel>
                  <Input
                    value={form.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel>Last name</FieldLabel>
                  <Input
                    value={form.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>
            </Field>

            <Field>
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={form.newsletter}
                  onCheckedChange={(v) => updateField('newsletter', Boolean(v))}
                />
                <span className="text-xs">
                  I accept to receive the newsletter and promotional offers.
                </span>
              </div>
            </Field>

            <Field>
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={form.terms}
                  onCheckedChange={(v) => updateField('terms', Boolean(v))}
                  required
                />
                <span className="text-xs">
                  I accept the{' '}
                  <Link href="/cgv" className="underline">
                    terms and conditions
                  </Link>{' '}
                  and the{' '}
                  <Link href="/cgu" className="underline">
                    terms of use
                  </Link>
                  .
                </span>
              </div>
            </Field>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>

              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
            </div>
          </>
        )}

        <FieldSeparator>Or continue with</FieldSeparator>

        {/* Google */}
        <Field>
          <div className="relative">
            <Button
              variant="outline"
              type="button"
              className="flex w-full items-center justify-center gap-2"
              onClick={() => signIn('google', { callbackUrl: '/' })}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4 w-4">
                <path
                  fill="#FFC107"
                  d="M43.611 20.083H42V20H24v8h11.303C33.53 32.59 29.07 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306 14.691l6.571 4.819C14.655 16.108 19.012 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.682 0-14.344 4.307-17.694 10.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.166 0 9.86-1.977 13.409-5.197l-6.191-5.238C29.181 35.091 26.715 36 24 36c-5.047 0-9.324-3.386-10.737-7.946l-6.518 5.025C9.981 39.556 16.491 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611 20.083H42V20H24v8h11.303c-.68 1.905-1.86 3.529-3.394 4.695l.002-.001 6.191 5.238C36.463 39.889 44 34 44 24c0-1.341-.138-2.651-.389-3.917z"
                />
              </svg>
              Continue with Google
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                >
                  <Info className="h-4 w-4" />
                </button>
              </PopoverTrigger>

              <PopoverContent className="max-w-xs text-sm">
                <p className="mb-1 font-medium">Information</p>
                <p>
                  En continuant avec Google, vous acceptez nos conditions et consentez à recevoir
                  notre newsletter.
                </p>
              </PopoverContent>
            </Popover>
          </div>

          <FieldDescription className="text-center">
            Already have an account?{' '}
            <Link href="/connexion" className="underline">
              Log in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
