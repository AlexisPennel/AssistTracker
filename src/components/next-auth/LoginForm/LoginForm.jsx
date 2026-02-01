'use client'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { CalendarCheck } from 'lucide-react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export function LoginForm({ className, ...props }) {
  function handleSubmit(e) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      callbackUrl: '/',
    })
  }

  return (
    <form className={cn('flex flex-col gap-6', className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
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
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required />
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="text-muted-foreground ml-auto text-xs underline-offset-4 hover:underline"
            >
              Forgot your password ?
            </a>
          </div>
          <Input id="password" name="password" type="password" required />
        </Field>

        <Field>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <Button
            variant="outline"
            type="button"
            className="w-full"
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
            Login with Google
          </Button>

          <FieldDescription className="text-center">
            Don&apos;t have an account?{' '}
            <Link href="/inscription" className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
