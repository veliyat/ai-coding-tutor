import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import type { AuthError } from '@supabase/supabase-js'

interface SecuritySectionProps {
  onUpdatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>
}

export function SecuritySection({ onUpdatePassword }: SecuritySectionProps) {
  const [editing, setEditing] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSaving(true)
    const { error: updateError } = await onUpdatePassword(newPassword)
    setSaving(false)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setEditing(false)
        setSuccess(false)
      }, 1500)
    }
  }

  function startEditing() {
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess(false)
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
    setNewPassword('')
    setConfirmPassword('')
    setError('')
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
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              disabled={saving || success}
            />
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={saving || success}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600">Password updated!</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={saving || success}>
                {saving ? 'Updating...' : 'Update Password'}
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
