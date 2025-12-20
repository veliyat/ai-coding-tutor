import { useParams } from 'react-router-dom'

export function Lesson() {
  const { slug } = useParams<{ slug: string }>()

  return (
    <div className="min-h-screen flex">
      {/* Left panel: Lesson content + tutor chat */}
      <div className="flex-1 p-6 border-r">
        <h1 className="text-xl font-bold mb-4">Lesson: {slug}</h1>
        <p className="text-muted-foreground">Lesson content and tutor chat will be rendered here</p>
      </div>
      {/* Right panel: Code editor + output */}
      <div className="flex-1 p-6">
        <p className="text-muted-foreground">Code editor will be rendered here</p>
      </div>
    </div>
  )
}
