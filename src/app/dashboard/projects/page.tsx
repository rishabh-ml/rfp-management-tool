import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Plus } from 'lucide-react'
import { ProjectViewSwitcher } from '@/components/projects/project-view-switcher'

export default function ProjectsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            manage your RFP projects with our powerful spreadsheet view and multiple display options
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* View Switcher and Controls */}
      <Suspense fallback={<LoadingSpinner text="Loading projects..." />}>
        <ProjectViewSwitcher />
      </Suspense>
    </div>
  )
}
