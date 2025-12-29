import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { FormField } from '@/shared/components/ui/form-field'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import type { AuthError } from '@supabase/supabase-js'

interface AccountSectionProps {
  email: string | undefined
  onUpdateEmail: (newEmail: string) => Promise<{ error: AuthError | null }>
}

export function AccountSection({ email, onUpdateEmail }: AccountSectionProps) {
  const [editing, setEditing] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const emailSchema = z.object({
    newEmail: z
      .string()
      .email('Please enter a valid email address')
      .refine((val) => val !== email, 'New email must be different from current email'),
  })

  type EmailFormData = z.infer<typeof emailSchema>

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  })

  async function onSubmit(data: EmailFormData) {
    setServerError(null)
    setSuccess(false)

    const { error: updateError } = await onUpdateEmail(data.newEmail)

    if (updateError) {
      setServerError(updateError.message)
    } else {
      setSuccess(true)
    }
  }

  function startEditing() {
    reset({ newEmail: '' })
    setServerError(null)
    setSuccess(false)
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
    reset()
    setServerError(null)
    setSuccess(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Your email address</CardDescription>
      </CardHeader>
      <CardContent>
        <Label className="text-sm font-medium mb-2 block">Email</Label>
        {editing ? (
          success ? (
            <div className="space-y-3">
              <p className="text-sm text-green-600">
                A confirmation link has been sent to <span className="font-medium">{getValues('newEmail')}</span>.
                Check your inbox to confirm the change.
              </p>
              <Button variant="outline" size="sm" onClick={cancelEditing}>
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
              <div className="text-sm text-muted-foreground mb-2">
                Current: {email}
              </div>
              <FormField
                type="email"
                placeholder="New email address"
                disabled={isSubmitting}
                error={errors.newEmail?.message || serverError || undefined}
                {...register('newEmail')}
              />
              <p className="text-xs text-muted-foreground">
                You will receive a confirmation email at the new address.
              </p>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Confirmation'}
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
          )
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm">{email}</span>
            <Button variant="outline" size="sm" onClick={startEditing}>
              Change
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
