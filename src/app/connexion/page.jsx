import { LoginForm } from '@/components/next-auth/LoginForm/LoginForm'
import '../globals.css'
export default function LoginPage() {
  return (
    <html lang="fr">
      <body>
        <div className="flex min-h-screen flex-col-reverse justify-end gap-6 lg:grid lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-1 items-center justify-center">
              <div className="w-full max-w-xs">
                <LoginForm />
              </div>
            </div>
          </div>

          <div className="bg-muted relative flex h-fit items-center justify-center xl:h-full">
            <img
              src="/images/connexion/placeholder.jpg"
              alt="Image"
              className="inset-0 h-[18vh] w-full object-cover brightness-90 lg:absolute lg:h-full dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </div>
      </body>
    </html>
  )
}
