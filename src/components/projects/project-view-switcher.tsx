import { Suspense } from 'react'
import { ProjectService } from '@/lib/services/project-service'
import { UserService } from '@/lib/services/user-service'
import { TagService } from '@/lib/services/tag-service'
import { ProjectViewClient } from './project-view-client'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

async function ProjectDataLoader() {
  try {
    console.log('Loading project data...')
    const [projects, users, tags] = await Promise.all([
      ProjectService.getProjects().catch(error => {
        console.error('Failed to load projects:', error)
        return []
      }),
      UserService.getAllUsers().catch(error => {
        console.error('Failed to load users:', error)
        return []
      }),
      TagService.getTags().catch(error => {
        console.error('Failed to load tags:', error)
        return []
      })
    ])

    console.log('Data loaded successfully:', {
      projects: projects.length,
      users: users.length,
      tags: tags.length
    })

    return <ProjectViewClient projects={projects} users={users} tags={tags} />
  } catch (error) {
    console.error('Critical error in ProjectDataLoader:', error)
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-red-600 font-medium">Failed to load project data</p>
        <p className="text-sm text-gray-600 mt-2">Please refresh the page or contact support</p>
        <p className="text-xs text-gray-400 mt-4 font-mono">
          Error: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }
}

export function ProjectViewSwitcher() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner className="h-8 w-8" />
        <span className="ml-2">Loading projects...</span>
      </div>
    }>
      <ProjectDataLoader />
    </Suspense>
  )
}


