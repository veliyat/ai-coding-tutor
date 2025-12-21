import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import type { AuthError } from '@supabase/supabase-js'

interface AccountSectionProps {
  email: string | undefined
  onUpdateEmail: (newEmail: string) => Promise<{ error: AuthError | null }>
}

export function AccountSection({ email, onUpdateEmail }: AccountSectionProps) {
  const [editing, setEditing] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!newEmail.trim()) {
      setError('Please enter an email address')
      return
    }

    if (newEmail === email) {
      setError('New email must be different from current email')
      return
    }

    setSaving(true)
    const { error: updateError } = await onUpdateEmail(newEmail)
    setSaving(false)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
    }
  }

  function startEditing() {
    setNewEmail('')
    setError('')
    setSuccess(false)
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
    setNewEmail('')
    setError('')
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
                A confirmation link has been sent to <span className="font-medium">{newEmail}</span>.
                Check your inbox to confirm the change.
              </p>
              <Button variant="outline" size="sm" onClick={cancelEditing}>
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="text-sm text-muted-foreground mb-2">
                Current: {email}
              </div>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="New email address"
                disabled={saving}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <p className="text-xs text-muted-foreground">
                You will receive a confirmation email at the new address.
              </p>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? 'Sending...' : 'Send Confirmation'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={cancelEditing}
                  disabled={saving}
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
