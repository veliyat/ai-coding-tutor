import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { FormField } from '@/shared/components/ui/form-field'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Avatar } from '@/shared/components/Avatar'
import { AvatarPicker } from '@/shared/components/AvatarPicker'
import type { Tables, TablesUpdate } from '@/shared/types/database'

type StudentProfile = Tables<'student_profiles'>
type StudentProfileUpdate = TablesUpdate<'student_profiles'>

const displayNameSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
})

type DisplayNameFormData = z.infer<typeof displayNameSchema>

interface ProfileSectionProps {
  profile: StudentProfile | null
  isRegistered: boolean
  onUpdate: (updates: StudentProfileUpdate) => Promise<{ error: string | null }>
}

export function ProfileSection({ profile, isRegistered, onUpdate }: ProfileSectionProps) {
  const [editingAvatar, setEditingAvatar] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [nameSuccess, setNameSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DisplayNameFormData>({
    resolver: zodResolver(displayNameSchema),
  })

  async function handleAvatarChange(emoji: string) {
    setSavingAvatar(true)
    await onUpdate({ avatar_emoji: emoji })
    setSavingAvatar(false)
    setEditingAvatar(false)
  }

  async function onSubmit(data: DisplayNameFormData) {
    setServerError(null)
    setNameSuccess(false)

    const { error } = await onUpdate({ display_name: data.displayName.trim() })

    if (error) {
      setServerError(error)
    } else {
      setNameSuccess(true)
      setTimeout(() => {
        setEditingName(false)
        setNameSuccess(false)
      }, 1500)
    }
  }

  function startEditingName() {
    reset({ displayName: profile?.display_name || '' })
    setServerError(null)
    setNameSuccess(false)
    setEditingName(true)
  }

  function cancelEditingName() {
    setEditingName(false)
    reset()
    setServerError(null)
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                <FormField
                  placeholder="Your name"
                  disabled={isSubmitting || nameSuccess}
                  error={errors.displayName?.message || serverError || undefined}
                  {...register('displayName')}
                />
                {nameSuccess && <p className="text-xs text-green-600">Name updated!</p>}
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={isSubmitting || nameSuccess}>
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={cancelEditingName}
                    disabled={isSubmitting}
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
