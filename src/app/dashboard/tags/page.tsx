import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Plus } from 'lucide-react'
import { TagsManager } from '@/components/tags/tags-manager'

export default function TagsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
          <p className="text-muted-foreground">
            Manage project tags and categories
          </p>
        </div>
      </div>

      <Suspense fallback={<LoadingSpinner text="Loading tags..." />}>
        <TagsManager />
      </Suspense>
    </div>
  )
}
