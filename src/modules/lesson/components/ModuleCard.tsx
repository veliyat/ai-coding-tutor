import { Link } from 'react-router-dom'
import { CheckCircle2, PlayCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import type { ModuleWithLessons, ProgressStatus, LessonRow } from '../types'

interface ModuleCardProps {
  module: ModuleWithLessons
  getStatus: (lessonId: string) => ProgressStatus
}

function LessonItem({ lesson, status }: { lesson: LessonRow; status: ProgressStatus }) {
  const Icon = status === 'completed' ? CheckCircle2 : PlayCircle

  return (
    <Link
      to={`/learn/${lesson.slug}`}
      className="flex items-center gap-3 p-2 -mx-2 hover:bg-muted transition-colors"
    >
      <Icon
        className={`h-4 w-4 ${
          status === 'completed'
            ? 'text-green-600'
            : 'text-muted-foreground'
        }`}
      />
      <span className="text-sm">{lesson.title}</span>
      {lesson.estimated_minutes && (
        <span className="text-xs text-muted-foreground ml-auto">
          {lesson.estimated_minutes} min
        </span>
      )}
    </Link>
  )
}

export function ModuleCard({ module, getStatus }: ModuleCardProps) {
  const completedCount = module.lessons.filter(
    (l) => getStatus(l.id) === 'completed'
  ).length
  const totalCount = module.lessons.length

  // Find next incomplete lesson
  const nextLesson = module.lessons.find((l) => getStatus(l.id) !== 'completed')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{module.title}</CardTitle>
            {module.description && (
              <CardDescription>{module.description}</CardDescription>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {module.lessons.map((lesson) => (
          <LessonItem
            key={lesson.id}
            lesson={lesson}
            status={getStatus(lesson.id)}
          />
        ))}

        {nextLesson && (
          <Button asChild className="w-full mt-4">
            <Link to={`/learn/${nextLesson.slug}`}>
              {completedCount === 0 ? 'Start Learning' : 'Continue'}
            </Link>
          </Button>
        )}

        {!nextLesson && totalCount > 0 && (
          <div className="text-center text-sm text-green-600 mt-4 font-medium">
            Module Complete!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
