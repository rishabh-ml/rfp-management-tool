import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { UserAvatar } from '@/components/ui/user-avatar'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { StageBadge } from '@/components/ui/stage-badge'
import { Tag } from '@/components/ui/tag'
import { formatDate, formatRelativeDate, isOverdue, getUserDisplayName } from '@/lib/utils'
import { Calendar, User, MessageSquare, CheckSquare, Plus } from 'lucide-react'
import type { ProjectWithDetails } from '@/lib/types'

interface ProjectListViewProps {
  projects: ProjectWithDetails[]
  searchQuery: string
  stageFilter: string
  priorityFilter: string
  sortBy: string
}

function ProjectsList({ projects, searchQuery, stageFilter, priorityFilter, sortBy }: ProjectListViewProps) {
  
  // Apply filters
  let filteredProjects = projects.filter(project => {
    // Search filter
    if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !project.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    // Stage filter
    if (stageFilter !== 'all' && project.stage !== stageFilter) {
      return false
    }
    
    // Priority filter
    if (priorityFilter !== 'all' && project.priority !== priorityFilter) {
      return false
    }
    
    return true
  })

  // Apply sorting
  filteredProjects.sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'created_at':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'due_date':
        if (!a.due_date && !b.due_date) return 0
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      case 'updated_at':
      default:
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    }
  })

  if (filteredProjects.length === 0) {
    return (
      <EmptyState
        icon={<Plus className="h-8 w-8 text-muted-foreground" />}
        title={searchQuery || stageFilter !== 'all' || priorityFilter !== 'all' ? "No projects match your filters" : "No projects found"}
        description={searchQuery || stageFilter !== 'all' || priorityFilter !== 'all' ? "Try adjusting your search or filter criteria" : "Get started by creating your first RFP project"}
        action={
          !(searchQuery || stageFilter !== 'all' || priorityFilter !== 'all') ? (
            <Button asChild>
              <Link href="/dashboard/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Link>
            </Button>
          ) : undefined
        }
      />
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredProjects.map((project) => (
        <Card key={project.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <Link 
                  href={`/dashboard/projects/${project.id}`}
                  className="font-semibold hover:underline line-clamp-2 block"
                >
                  {project.title}
                </Link>
                <div className="flex items-center gap-2">
                  <StageBadge stage={project.stage} variant="outline" />
                  <PriorityBadge priority={project.priority} variant="outline" />
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {project.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.tags.slice(0, 3).map((tag) => (
                  <Tag key={tag.id} tag={tag} size="sm" />
                ))}
                {project.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{project.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Project Info */}
            <div className="space-y-2 text-sm">
              {project.owner && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <UserAvatar user={project.owner} size="sm" />
                  <span className="text-muted-foreground">
                    {getUserDisplayName(project.owner)}
                  </span>
                </div>
              )}

              {project.due_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className={isOverdue(project.due_date) ? 'text-destructive' : 'text-muted-foreground'}>
                    Due {formatDate(project.due_date)}
                  </span>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{project._count?.comments || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckSquare className="h-4 w-4" />
                  <span>{project._count?.completed_subtasks || 0}/{project._count?.subtasks || 0}</span>
                </div>
              </div>
            </div>

            {/* Progress for assigned projects */}
            {project.stage === 'assigned' && project.progress_percentage > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{project.progress_percentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${project.progress_percentage}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-muted-foreground">
                Updated {formatRelativeDate(project.updated_at)}
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/projects/${project.id}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function ProjectListView(props: ProjectListViewProps) {
  return <ProjectsList {...props} />
}
