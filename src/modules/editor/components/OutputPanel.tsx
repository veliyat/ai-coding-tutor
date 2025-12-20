import { CheckCircle2, XCircle } from 'lucide-react'
import type { ExecutionResult } from '../types'

interface OutputPanelProps {
  result: ExecutionResult | null
  running: boolean
}

export function OutputPanel({ result, running }: OutputPanelProps) {
  if (running) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Running...
      </div>
    )
  }

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        Click "Run Code" to see output
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Output */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {result.error ? (
          <div className="text-destructive">
            <span className="font-semibold">Error: </span>
            {result.error}
          </div>
        ) : result.output ? (
          <pre className="whitespace-pre-wrap">{result.output}</pre>
        ) : (
          <span className="text-muted-foreground">No output</span>
        )}
      </div>

      {/* Test results */}
      {result.testResults.length > 0 && (
        <div className="border-t p-4 space-y-2">
          <h4 className="text-sm font-medium">Test Results</h4>
          {result.testResults.map((test, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {test.passed ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <span className={test.passed ? 'text-green-600' : 'text-destructive'}>
                {test.name}
              </span>
            </div>
          ))}

          {result.allPassed && (
            <div className="mt-2 pt-2 border-t text-green-600 font-medium text-sm">
              All tests passed!
            </div>
          )}
        </div>
      )}
    </div>
  )
}
