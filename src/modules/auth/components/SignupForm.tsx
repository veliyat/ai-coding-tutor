import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { FormField } from '@/shared/components/ui/form-field'
import { supabase } from '@/shared/lib/supabase'
import { useAccessCode } from '../hooks/useAccessCode'

const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Please enter your full name (at least 2 characters)'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignupFormData = z.infer<typeof signupSchema>

interface SignupFormProps {
  onPendingConfirmation?: (email: string) => void
}

export function SignupForm({ onPendingConfirmation }: SignupFormProps) {
  const navigate = useNavigate()
  const { accessCode, profile, clearAccessCode } = useAccessCode()
  const profileId = profile?.id
  const [serverError, setServerError] = useState<string | null>(null)

  const isUpgrade = Boolean(accessCode && profileId)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  async function onSubmit(data: SignupFormData) {
    setServerError(null)

    try {
      // 1. Create Supabase auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (signUpError) {
        throw signUpError
      }

      if (!authData.user) {
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
            p_auth_user_id: authData.user.id,
            p_display_name: data.fullName.trim(),
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
          id: authData.user.id,
          auth_user_id: authData.user.id,
          display_name: data.fullName.trim(),
        })

        if (profileError) {
          throw profileError
        }
      }

      // 3. Handle post-signup navigation
      if (authData.session) {
        // User is immediately authenticated (email confirmation disabled)
        if (isUpgrade) {
          clearAccessCode()
        }
        navigate('/learn')
      } else {
        // Email confirmation required
        if (onPendingConfirmation) {
          onPendingConfirmation(data.email)
        } else {
          // Default behavior: still navigate but they'll need to confirm
          navigate('/learn')
        }
      }
    } catch (err) {
      console.error('Signup error:', err)
      const message = err instanceof Error ? err.message : 'Registration failed'
      setServerError(message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <FormField
        label="Full Name"
        type="text"
        placeholder="Alice Chen"
        error={errors.fullName?.message}
        {...register('fullName')}
      />

      <FormField
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <FormField
        label="Password"
        type="password"
        placeholder="At least 6 characters"
        error={errors.password?.message}
        {...register('password')}
      />

      <FormField
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      {serverError && (
        <p className="text-xs text-destructive">{serverError}</p>
      )}

      {isUpgrade && (
        <p className="text-xs text-muted-foreground">
          Your progress with code <span className="font-mono">{accessCode}</span> will be preserved.
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  )
}
