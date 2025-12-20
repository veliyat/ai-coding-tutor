import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group'
import { useStudentProfile } from '../hooks/useStudentProfile'

type Step = 'goal' | 'experience' | 'style'

const GOALS = [
  { value: 'build_websites', label: 'Build websites', description: 'Create interactive web pages and apps' },
  { value: 'get_job', label: 'Get a developer job', description: 'Learn skills for a career in tech' },
  { value: 'automate', label: 'Automate tasks', description: 'Write scripts to save time' },
  { value: 'hobby', label: 'Just for fun', description: 'Explore programming as a hobby' },
]

const EXPERIENCE = [
  { value: 'none', label: 'Complete beginner', description: "I've never written code before" },
  { value: 'some', label: 'Some experience', description: "I've tried tutorials or small projects" },
  { value: 'other_language', label: 'Know another language', description: "I'm comfortable in Python, Java, etc." },
]

const STYLES = [
  { value: 'examples', label: 'Show me examples', description: 'I learn best by seeing code in action' },
  { value: 'analogies', label: 'Use analogies', description: 'Compare concepts to real-world things' },
  { value: 'theory', label: 'Explain the theory', description: 'I want to understand why things work' },
]

export function OnboardingForm() {
  const navigate = useNavigate()
  const { updateProfile } = useStudentProfile()
  const [step, setStep] = useState<Step>('goal')
  const [goal, setGoal] = useState('')
  const [experience, setExperience] = useState('')
  const [style, setStyle] = useState('examples')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleComplete() {
    setLoading(true)
    setError(null)

    const { error } = await updateProfile({
      learning_goal: goal,
      prior_experience: experience as 'none' | 'some' | 'other_language',
      preferred_style: style as 'examples' | 'analogies' | 'theory',
      current_skill_level: experience === 'other_language' ? 'intermediate' : 'beginner',
    })

    if (error) {
      setError(error)
      setLoading(false)
      return
    }

    navigate('/learn')
  }

  function handleNext() {
    if (step === 'goal') setStep('experience')
    else if (step === 'experience') setStep('style')
    else handleComplete()
  }

  function handleBack() {
    if (step === 'experience') setStep('goal')
    else if (step === 'style') setStep('experience')
  }

  const canProceed =
    (step === 'goal' && goal) ||
    (step === 'experience' && experience) ||
    (step === 'style' && style)

  return (
    <div className="space-y-6">
      {step === 'goal' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">What's your goal?</h2>
            <p className="text-sm text-muted-foreground">This helps us tailor your learning path</p>
          </div>
          <RadioGroup value={goal} onValueChange={setGoal} className="space-y-3">
            {GOALS.map((option) => (
              <Label
                key={option.value}
                htmlFor={option.value}
                className="flex items-start space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 has-[:checked]:border-primary"
              >
                <RadioGroupItem value={option.value} id={option.value} className="mt-0.5" />
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.description}</div>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>
      )}

      {step === 'experience' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">What's your experience level?</h2>
            <p className="text-sm text-muted-foreground">We'll adjust the pace accordingly</p>
          </div>
          <RadioGroup value={experience} onValueChange={setExperience} className="space-y-3">
            {EXPERIENCE.map((option) => (
              <Label
                key={option.value}
                htmlFor={option.value}
                className="flex items-start space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 has-[:checked]:border-primary"
              >
                <RadioGroupItem value={option.value} id={option.value} className="mt-0.5" />
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.description}</div>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>
      )}

      {step === 'style' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">How do you learn best?</h2>
            <p className="text-sm text-muted-foreground">The tutor will adapt to your style</p>
          </div>
          <RadioGroup value={style} onValueChange={setStyle} className="space-y-3">
            {STYLES.map((option) => (
              <Label
                key={option.value}
                htmlFor={option.value}
                className="flex items-start space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 has-[:checked]:border-primary"
              >
                <RadioGroupItem value={option.value} id={option.value} className="mt-0.5" />
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.description}</div>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        {step !== 'goal' && (
          <Button variant="outline" onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}
        <Button onClick={handleNext} disabled={!canProceed || loading} className="flex-1">
          {loading ? 'Saving...' : step === 'style' ? 'Start Learning' : 'Continue'}
        </Button>
      </div>

      <div className="flex justify-center gap-2">
        {['goal', 'experience', 'style'].map((s) => (
          <div
            key={s}
            className={`h-2 w-2 rounded-full ${s === step ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>
    </div>
  )
}
