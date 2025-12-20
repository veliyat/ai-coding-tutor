import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { LoginForm } from '@/modules/auth'

export function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Sign in to continue learning</p>
        </div>

        <LoginForm />

        <p className="text-sm text-center">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary underline">
            Sign up
          </Link>
        </p>

        <Button variant="ghost" asChild className="w-full">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </div>
  )
}
