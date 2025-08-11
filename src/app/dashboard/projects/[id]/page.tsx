import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { UserAvatar } from '@/components/ui/user-avatar'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { StageBadge } from '@/components/ui/stage-badge'
import { Tag } from '@/components/ui/tag'
import { ProgressBar } from '@/components/ui/progress-bar'
import { CommentsSection } from '@/components/comments/comments-section'
import { SubtasksSection } from '@/components/subtasks/subtasks-section'
import { ProgressTracker } from '@/components/projects/progress-tracker'
import { ProjectService } from '@/lib/services/project-service'
import { UserService } from '@/lib/services/user-service'
import { formatDate, formatRelativeDate, isOverdue, getUserDisplayName } from '@/lib/utils'
import {
  ArrowLeft,
  Calendar,
  User,
  MessageSquare,
  CheckSquare,
  Edit,
  MoreHorizontal,
  Clock
} from 'lucide-react'

interface ProjectDetailPageProps {
  params: Promise<{
    id: string
  }>
}

async function ProjectDetails({ projectId }: { projectId: string }) {
  const [project, currentUser] = await Promise.all([
    ProjectService.getProjectById(projectId),
    UserService.getCurrentUser()
  ])

  if (!project) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <StageBadge stage={project.stage} />
            <PriorityBadge priority={project.priority} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
          {project.description && (
            <p className="text-muted-foreground max-w-3xl">
              {project.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Progress Tracker */}
          <ProgressTracker
            project={project}
            canEdit={currentUser?.id === project.owner_id || ['admin', 'manager'].includes(currentUser?.role || '')}
          />

          {/* Comments Section */}
          <CommentsSection
            projectId={projectId}
            comments={project.comments || []}
            currentUser={currentUser}
          />

          {/* Subtasks Section */}
          <SubtasksSection
            projectId={projectId}
            subtasks={project.subtasks || []}
            currentUser={currentUser}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.owner && (
                <div>
                  <Label className="text-sm font-medium">Assigned To</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <UserAvatar user={project.owner} size="sm" />
                    <span className="text-sm">
                      {getUserDisplayName(project.owner)}
                    </span>
                  </div>
                </div>
              )}

              {project.due_date && (
                <div>
                  <Label className="text-sm font-medium">Due Date</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className={`text-sm ${isOverdue(project.due_date) ? 'text-destructive' : ''}`}>
                      {formatDate(project.due_date)}
                      {isOverdue(project.due_date) && ' (Overdue)'}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Created</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(project.created_at)}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Last Updated</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatRelativeDate(project.updated_at)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Tag key={tag.id} tag={tag} size="sm" />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </div>

      <Suspense fallback={<LoadingSpinner text="Loading project details..." />}>
        <ProjectDetails projectId={id} />
      </Suspense>
    </div>
  )
}
