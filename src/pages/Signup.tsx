import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { SignupForm, useAccessCode } from '@/modules/auth'
import logo from '@/assets/logo.png'

export function Signup() {
  const { accessCode } = useAccessCode()
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  const isUpgrade = Boolean(accessCode)

  // Email confirmation pending screen
  if (pendingEmail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground">
            We sent a confirmation link to <strong>{pendingEmail}</strong>.
            Click the link to complete your registration.
          </p>
          {isUpgrade && (
            <p className="text-sm text-muted-foreground">
              You can continue learning with your access code in the meantime.
            </p>
          )}
          <Button asChild variant="outline">
            <Link to={isUpgrade ? '/learn' : '/'}>
              {isUpgrade ? 'Continue Learning' : 'Back to Home'}
            </Link>
          </Button>
        </div>
        <img src={logo} alt="AI Coding Tutor" className="h-5 w-auto absolute bottom-4 right-4" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {isUpgrade ? 'Save Your Progress' : 'Create your account'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isUpgrade
              ? 'Create an account to access your learning from any device'
              : 'Start learning JavaScript today'}
          </p>
        </div>

        <SignupForm onPendingConfirmation={setPendingEmail} />

        <p className="text-sm text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary underline">
            Sign in
          </Link>
        </p>

        <Button variant="ghost" asChild className="w-full">
          <Link to={isUpgrade ? '/learn' : '/'}>
            {isUpgrade ? 'Skip for now' : 'Back to home'}
          </Link>
        </Button>
      </div>
      <img src={logo} alt="AI Coding Tutor" className="h-5 w-auto absolute bottom-4 right-4" />
    </div>
  )
}
