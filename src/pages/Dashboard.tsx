import { Header } from '@/modules/layout'
import { useModules, useProgress, ModuleCard } from '@/modules/lesson'
import { Skeleton } from '@/shared/components/ui/skeleton'

export function Dashboard() {
  const { modules, loading: modulesLoading, error: modulesError } = useModules()
  const { loading: progressLoading, getStatus } = useProgress()

  const loading = modulesLoading || progressLoading

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
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
