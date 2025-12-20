import { useState, useEffect } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { CodeEditor } from './CodeEditor'
import { OutputPanel } from './OutputPanel'
import { useCodeRunner } from '../hooks/useCodeRunner'
import type { TestCase } from '../types'

interface EditorPanelProps {
  starterCode: string
  testCases: TestCase[]
  onAllTestsPass?: () => void
}

export function EditorPanel({ starterCode, testCases, onAllTestsPass }: EditorPanelProps) {
  const [code, setCode] = useState(starterCode)
  const { result, running, run, reset } = useCodeRunner()

  // Notify parent when all tests pass
  useEffect(() => {
    if (result?.allPassed && onAllTestsPass) {
      onAllTestsPass()
    }
  }, [result?.allPassed, onAllTestsPass])

  function handleRun() {
    run(code, testCases)
  }

  function handleReset() {
    setCode(starterCode)
    reset()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-muted/50">
        <Button size="sm" onClick={handleRun} disabled={running}>
          <Play className="h-4 w-4 mr-2" />
          Run Code
        </Button>
        <Button size="sm" variant="outline" onClick={handleReset} disabled={running}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <CodeEditor value={code} onChange={setCode} />
      </div>

      {/* Output */}
      <div className="h-48 border-t bg-background">
        <OutputPanel result={result} running={running} />
      </div>
    </div>
  )
}
