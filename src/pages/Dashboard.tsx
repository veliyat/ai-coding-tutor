import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Info, Copy, Check } from 'lucide-react'
import { Header } from '@/modules/layout'
import { useModules, useProgress, ModuleCard } from '@/modules/lesson'
import { useIdentity } from '@/modules/auth'
import { Skeleton } from '@/shared/components/ui/skeleton'

export function Dashboard() {
  const { type, accessCode } = useIdentity()
  const [copied, setCopied] = useState(false)
  const { modules, loading: modulesLoading, error: modulesError } = useModules()
  const { loading: progressLoading, getStatus } = useProgress()

  const loading = modulesLoading || progressLoading

  async function copyCode() {
    if (!accessCode) return
    await navigator.clipboard.writeText(accessCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Info banner for code-based users */}
          {type === 'code_based' && accessCode && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-3 mb-2">
                <Info className="h-5 w-5 text-muted-foreground shrink-0" />
                <p className="text-sm font-medium flex items-center gap-2">
                  Your access code:
                  <span className="font-mono bg-background px-2 py-0.5 rounded border">{accessCode}</span>
                  <button
                    onClick={copyCode}
                    className="p-1 hover:bg-muted rounded transition-colors cursor-pointer"
                    title="Copy code"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </p>
              </div>
              <p className="text-sm text-muted-foreground ml-8">
                Save this code to continue on another device. Inactive profiles are deleted after 10 days.
                Keep learning to stay active, or{' '}
                <Link to="/signup" className="underline hover:text-foreground">
                  register
                </Link>
                {' '}for seamless access.
              </p>
            </div>
          )}

          <h1 className="text-2xl font-bold mb-6">Your Progress</h1>

          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          )}

          {modulesError && (
            <p className="text-destructive">{modulesError}</p>
          )}

          {!loading && !modulesError && modules.length === 0 && (
            <p className="text-muted-foreground">
              No lessons available yet. Check back soon!
            </p>
          )}

          {!loading && !modulesError && modules.length > 0 && (
            <div className="space-y-6">
              {modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  getStatus={getStatus}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
