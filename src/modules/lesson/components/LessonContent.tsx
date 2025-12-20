import type { LessonContent as LessonContentType, ContentSection } from '../types'

interface LessonContentProps {
  content: LessonContentType
}

function CodeBlock({ code, output }: { code: string; output?: string }) {
  return (
    <div className="space-y-2">
      <pre className="bg-muted p-4 overflow-x-auto font-mono text-sm">
        <code>{code}</code>
      </pre>
      {output && (
        <div className="text-sm">
          <span className="text-muted-foreground">Output: </span>
          <code className="bg-muted px-2 py-1 font-mono">{output}</code>
        </div>
      )}
    </div>
  )
}

function Section({ section }: { section: ContentSection }) {
  if (section.type === 'explanation') {
    return (
      <div className="space-y-2">
        {section.title && (
          <h3 className="font-semibold text-lg">{section.title}</h3>
        )}
        {section.text && (
          <p className="text-foreground leading-relaxed">{section.text}</p>
        )}
      </div>
    )
  }

  if (section.type === 'code_example') {
    return (
      <div className="space-y-2">
        {section.title && (
          <h3 className="font-semibold text-lg">{section.title}</h3>
        )}
        {section.text && (
          <p className="text-foreground leading-relaxed">{section.text}</p>
        )}
        {section.code && (
          <CodeBlock code={section.code} output={section.output} />
        )}
      </div>
    )
  }

  return null
}

export function LessonContent({ content }: LessonContentProps) {
  if (!content.sections || content.sections.length === 0) {
    return (
      <p className="text-muted-foreground">No content available for this lesson.</p>
    )
  }

  return (
    <div className="space-y-6">
      {content.sections.map((section, index) => (
        <Section key={index} section={section} />
      ))}
    </div>
  )
}
