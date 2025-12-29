import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { FormField } from '@/shared/components/ui/form-field'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import type { AuthError } from '@supabase/supabase-js'

const passwordSchema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

interface SecuritySectionProps {
  onUpdatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>
}

export function SecuritySection({ onUpdatePassword }: SecuritySectionProps) {
  const [editing, setEditing] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  async function onSubmit(data: PasswordFormData) {
    setServerError(null)
    setSuccess(false)

    const { error: updateError } = await onUpdatePassword(data.newPassword)

    if (updateError) {
      setServerError(updateError.message)
    } else {
      setSuccess(true)
      reset()
      setTimeout(() => {
        setEditing(false)
        setSuccess(false)
      }, 1500)
    }
  }

  function startEditing() {
    reset()
    setServerError(null)
    setSuccess(false)
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
    reset()
    setServerError(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>Manage your password</CardDescription>
      </CardHeader>
      <CardContent>
        <Label className="text-sm font-medium mb-2 block">Password</Label>
        {editing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              type="password"
              placeholder="New password"
              disabled={isSubmitting || success}
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <FormField
              type="password"
              placeholder="Confirm new password"
              disabled={isSubmitting || success}
              error={errors.confirmPassword?.message || serverError || undefined}
              {...register('confirmPassword')}
            />
            {success && <p className="text-xs text-green-600">Password updated!</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isSubmitting || success}>
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={cancelEditing}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">••••••••</span>
            <Button variant="outline" size="sm" onClick={startEditing}>
              Change
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
