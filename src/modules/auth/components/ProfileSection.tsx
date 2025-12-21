import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Avatar } from '@/shared/components/Avatar'
import { AvatarPicker } from '@/shared/components/AvatarPicker'
import type { Tables, TablesUpdate } from '@/shared/types/database'

type StudentProfile = Tables<'student_profiles'>
type StudentProfileUpdate = TablesUpdate<'student_profiles'>

interface ProfileSectionProps {
  profile: StudentProfile | null
  isRegistered: boolean
  onUpdate: (updates: StudentProfileUpdate) => Promise<{ error: string | null }>
}

export function ProfileSection({ profile, isRegistered, onUpdate }: ProfileSectionProps) {
  const [editingAvatar, setEditingAvatar] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)

  const [editingName, setEditingName] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState('')
  const [nameSuccess, setNameSuccess] = useState(false)

  async function handleAvatarChange(emoji: string) {
    setSavingAvatar(true)
    await onUpdate({ avatar_emoji: emoji })
    setSavingAvatar(false)
    setEditingAvatar(false)
  }

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault()
    setNameError('')
    setNameSuccess(false)

    if (!displayName.trim() || displayName.trim().length < 2) {
      setNameError('Name must be at least 2 characters')
      return
    }

    setSavingName(true)
    const { error } = await onUpdate({ display_name: displayName.trim() })
    setSavingName(false)

    if (error) {
      setNameError(error)
    } else {
      setNameSuccess(true)
      setTimeout(() => {
        setEditingName(false)
        setNameSuccess(false)
      }, 1500)
    }
  }

  function startEditingName() {
    setDisplayName(profile?.display_name || '')
    setNameError('')
    setNameSuccess(false)
    setEditingName(true)
  }

  function cancelEditingName() {
    setEditingName(false)
    setDisplayName('')
    setNameError('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your avatar and display name</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Avatar</Label>
          {editingAvatar ? (
            <div className="space-y-3">
              <AvatarPicker
                value={profile?.avatar_emoji || '😊'}
                onChange={handleAvatarChange}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingAvatar(false)}
                disabled={savingAvatar}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar emoji={profile?.avatar_emoji} size="lg" />
              <Button variant="outline" size="sm" onClick={() => setEditingAvatar(true)}>
                Change
              </Button>
            </div>
          )}
        </div>

        {/* Display Name */}
        {isRegistered && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Display Name</Label>
            {editingName ? (
              <form onSubmit={handleNameSubmit} className="space-y-3">
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  disabled={savingName || nameSuccess}
                />
                {nameError && <p className="text-sm text-destructive">{nameError}</p>}
                {nameSuccess && <p className="text-sm text-green-600">Name updated!</p>}
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={savingName || nameSuccess}>
                    {savingName ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={cancelEditingName}
                    disabled={savingName}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm">{profile?.display_name || 'Not set'}</span>
                <Button variant="outline" size="sm" onClick={startEditingName}>
                  Edit
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
