import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'

export function Profile() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        <div className="space-y-4">
          <p className="text-muted-foreground">Profile settings will be rendered here</p>
          <Button variant="outline" asChild>
            <Link to="/learn">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
