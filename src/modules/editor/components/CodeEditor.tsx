import Editor from '@monaco-editor/react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
}

export function CodeEditor({ value, onChange, readOnly = false }: CodeEditorProps) {
  return (
    <Editor
      height="100%"
      language="javascript"
      theme="vs-dark"
      value={value}
      onChange={(val) => onChange(val || '')}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: "'JetBrains Mono', monospace",
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        readOnly,
        wordWrap: 'on',
        padding: { top: 16 },
      }}
    />
  )
}
