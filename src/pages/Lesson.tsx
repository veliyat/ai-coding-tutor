import { useParams } from 'react-router-dom'
import { LessonLayout } from '@/modules/lesson'

export function Lesson() {
  const { slug } = useParams<{ slug: string }>()

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">No lesson specified</p>
      </div>
    )
  }

  return <LessonLayout slug={slug} />
}
