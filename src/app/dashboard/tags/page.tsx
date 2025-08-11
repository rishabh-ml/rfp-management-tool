import { Suspense } from 'react'
// Button import removed - not used in this component
import { LoadingSpinner } from '@/components/ui/loading-spinner'
// Plus import removed - not used in this component
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
