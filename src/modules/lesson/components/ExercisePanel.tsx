import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Lightbulb } from 'lucide-react'
import type { Exercise } from '../types'

interface ExercisePanelProps {
  exercise: Exercise
}

export function ExercisePanel({ exercise }: ExercisePanelProps) {
  const [hintLevel, setHintLevel] = useState(0)

  const availableHints = exercise.hints.filter((h) => h.level <= hintLevel)
  const hasMoreHints = exercise.hints.some((h) => h.level > hintLevel)

  function showNextHint() {
    const nextLevel = hintLevel + 1
    setHintLevel(nextLevel)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exercise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">{exercise.description}</p>

          {exercise.testCases.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Requirements:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                {exercise.testCases.map((test, i) => (
                  <li key={i}>{test.name}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {availableHints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Hints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableHints.map((hint, i) => (
              <div key={i} className="space-y-1">
                <p className="text-sm">{hint.text}</p>
                {hint.code && (
                  <pre className="bg-muted p-2 text-xs font-mono overflow-x-auto">
                    <code>{hint.code}</code>
                  </pre>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {hasMoreHints && (
        <Button variant="outline" size="sm" onClick={showNextHint} className="w-full">
          <Lightbulb className="h-4 w-4 mr-2" />
          Show Hint
        </Button>
      )}
    </div>
  )
}
