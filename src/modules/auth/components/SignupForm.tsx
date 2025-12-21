import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { supabase } from '@/shared/lib/supabase'
import { useAccessCode } from '../hooks/useAccessCode'

interface SignupFormProps {
  onPendingConfirmation?: (email: string) => void
}

export function SignupForm({ onPendingConfirmation }: SignupFormProps) {
  const navigate = useNavigate()
  const { accessCode, profile, clearAccessCode } = useAccessCode()
  const profileId = profile?.id

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isUpgrade = Boolean(accessCode && profileId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters)')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      // 1. Create Supabase auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        throw signUpError
      }

      if (!data.user) {
        throw new Error('Failed to create account')
      }

      // 2. Handle profile creation/upgrade
      if (isUpgrade) {
        // Upgrade existing code-based profile
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: upgraded, error: upgradeError } = await (supabase.rpc as any)(
          'upgrade_profile_to_registered',
          {
            p_profile_id: profileId,
            p_access_code: accessCode,
            p_auth_user_id: data.user.id,
            p_display_name: fullName.trim(),
          }
        )

        if (upgradeError) {
          throw upgradeError
        }

        if (!upgraded) {
          throw new Error('Failed to link profile. It may already be registered.')
        }
      } else {
        // Create new profile for direct signup
        const { error: profileError } = await supabase.from('student_profiles').insert({
          id: data.user.id,
          auth_user_id: data.user.id,
          display_name: fullName.trim(),
        })

        if (profileError) {
          throw profileError
        }
      }

      // 3. Handle post-signup navigation
      if (data.session) {
        // User is immediately authenticated (email confirmation disabled)
        if (isUpgrade) {
          clearAccessCode()
        }
        navigate('/learn')
      } else {
        // Email confirmation required
        if (onPendingConfirmation) {
          onPendingConfirmation(email)
        } else {
          // Default behavior: still navigate but they'll need to confirm
          navigate('/learn')
        }
      }
    } catch (err) {
      console.error('Signup error:', err)
      const message = err instanceof Error ? err.message : 'Registration failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Alice Chen"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {isUpgrade && (
        <p className="text-xs text-muted-foreground">
          Your progress with code <span className="font-mono">{accessCode}</span> will be preserved.
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  )
}
