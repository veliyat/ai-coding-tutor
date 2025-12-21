import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import type { Tables, TablesUpdate } from '@/shared/types/database'

type StudentProfile = Tables<'student_profiles'>
type StudentProfileUpdate = TablesUpdate<'student_profiles'>

const GOALS = [
  { value: 'build_websites', label: 'Build websites' },
  { value: 'get_job', label: 'Get a developer job' },
  { value: 'automate', label: 'Automate tasks' },
  { value: 'hobby', label: 'Just for fun' },
]

const EXPERIENCE = [
  { value: 'none', label: 'Complete beginner' },
  { value: 'some', label: 'Some experience' },
  { value: 'other_language', label: 'Know another language' },
]

const STYLES = [
  { value: 'examples', label: 'Show me examples' },
  { value: 'analogies', label: 'Use analogies' },
  { value: 'theory', label: 'Explain the theory' },
]

function getLabelForValue(options: { value: string; label: string }[], value: string | null | undefined): string {
  if (!value) return 'Not set'
  return options.find(o => o.value === value)?.label || value.replace('_', ' ')
}

interface PreferencesSectionProps {
  profile: StudentProfile | null
  onUpdate: (updates: StudentProfileUpdate) => Promise<{ error: string | null }>
}

export function PreferencesSection({ profile, onUpdate }: PreferencesSectionProps) {
  const [editing, setEditing] = useState(false)
  const [goal, setGoal] = useState('')
  const [experience, setExperience] = useState('')
  const [style, setStyle] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)

    await onUpdate({
      learning_goal: goal,
      prior_experience: experience as 'none' | 'some' | 'other_language',
      preferred_style: style as 'examples' | 'analogies' | 'theory',
      current_skill_level: experience === 'other_language' ? 'intermediate' : 'beginner',
    })

    setSaving(false)
    setSuccess(true)
    setTimeout(() => {
      setEditing(false)
      setSuccess(false)
    }, 1500)
  }

  function startEditing() {
    setGoal(profile?.learning_goal || '')
    setExperience(profile?.prior_experience || '')
    setStyle(profile?.preferred_style || '')
    setSuccess(false)
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
    setGoal('')
    setExperience('')
    setStyle('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Preferences</CardTitle>
        <CardDescription>Your learning style and goals</CardDescription>
      </CardHeader>
      <CardContent>
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">What's your goal?</Label>
              <RadioGroup value={goal} onValueChange={setGoal} className="grid grid-cols-2 gap-2">
                {GOALS.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={`goal-${option.value}`}
                    className="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 has-[:checked]:border-primary"
                  >
                    <RadioGroupItem value={option.value} id={`goal-${option.value}`} />
                    <span className="text-sm">{option.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <hr className="border-border" />

            {/* Experience */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">What's your experience level?</Label>
              <RadioGroup value={experience} onValueChange={setExperience} className="grid grid-cols-3 gap-2">
                {EXPERIENCE.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={`exp-${option.value}`}
                    className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 has-[:checked]:border-primary"
                  >
                    <RadioGroupItem value={option.value} id={`exp-${option.value}`} />
                    <span className="text-xs">{option.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <hr className="border-border" />

            {/* Style */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">How do you learn best?</Label>
              <RadioGroup value={style} onValueChange={setStyle} className="grid grid-cols-3 gap-2">
                {STYLES.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={`style-${option.value}`}
                    className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 has-[:checked]:border-primary"
                  >
                    <RadioGroupItem value={option.value} id={`style-${option.value}`} />
                    <span className="text-xs">{option.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <hr className="border-border" />

            {success && <p className="text-sm text-green-600">Preferences updated!</p>}

            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={saving || success || !goal || !experience || !style}
              >
                {saving ? 'Saving...' : 'Save'}
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
          <div className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Goal</span>
                <span>{getLabelForValue(GOALS, profile?.learning_goal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Experience</span>
                <span>{getLabelForValue(EXPERIENCE, profile?.prior_experience)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Learning style</span>
                <span>{getLabelForValue(STYLES, profile?.preferred_style)}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={startEditing}>
              Edit Preferences
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
