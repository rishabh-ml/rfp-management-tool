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
import { ProjectActionsMenu } from '@/components/projects/project-actions-menu'
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
  Clock,
  DollarSign,
  FileText,
  Users,
  Target,
  TrendingUp,
  MapPin,
  ExternalLink,
  Hash
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
    <div className="flex-1 space-y-8 p-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </div>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="space-y-4 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <StageBadge stage={project.stage} />
            <PriorityBadge priority={project.priority} />
            {project.budget_amount && (
              <Badge variant="outline" className="gap-1">
                <DollarSign className="h-3 w-3" />
                ${project.budget_amount.toLocaleString()}
              </Badge>
            )}
            {isOverdue(project.due_date) && (
              <Badge variant="destructive" className="gap-1">
                <Clock className="h-3 w-3" />
                Overdue
              </Badge>
            )}
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight leading-tight">
              {project.title}
            </h1>
            {project.description && (
              <p className="text-lg text-muted-foreground max-w-4xl leading-relaxed">
                {project.description}
              </p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div className="text-sm">
                <div className="font-medium">{project.progress_percentage || 0}%</div>
                <div className="text-xs text-muted-foreground">Complete</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <CheckSquare className="h-4 w-4 text-green-600" />
              <div className="text-sm">
                <div className="font-medium">{project.subtasks?.length || 0}</div>
                <div className="text-xs text-muted-foreground">Subtasks</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              <div className="text-sm">
                <div className="font-medium">{project.comments?.length || 0}</div>
                <div className="text-xs text-muted-foreground">Comments</div>
              </div>
            </div>

            {project.estimated_hours && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
                <div className="text-sm">
                  <div className="font-medium">{project.estimated_hours}h</div>
                  <div className="text-xs text-muted-foreground">Estimated</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0">
          <ProjectActionsMenu 
            project={project} 
            currentUser={currentUser}
            users={[]} // Will need to fetch users if needed
            tags={[]}  // Will need to fetch tags if needed
            customAttributes={[]} // Will need to fetch if needed
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Tracker */}
          <ProgressTracker
            project={project}
            canEdit={currentUser?.id === project.owner_id || ['admin', 'manager'].includes(currentUser?.role || '')}
          />

          {/* Comments Section */}
          <CommentsSection
            projectId={projectId}
            comments={project.comments || []}
            currentUser={currentUser as any}
          />

          {/* Subtasks Section */}
          <SubtasksSection
            projectId={projectId}
            subtasks={project.subtasks || []}
            currentUser={currentUser as any}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Owner */}
              {project.owner && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Assigned To
                  </Label>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <UserAvatar user={project.owner} size="sm" />
                    <div>
                      <div className="font-medium text-sm">
                        {getUserDisplayName(project.owner)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {project.owner.email}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Due Date */}
              {project.due_date && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </Label>
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${
                    isOverdue(project.due_date) 
                      ? 'bg-destructive/10 border border-destructive/20' 
                      : 'bg-muted/50'
                  }`}>
                    <div>
                      <div className={`font-medium text-sm ${
                        isOverdue(project.due_date) ? 'text-destructive' : ''
                      }`}>
                        {formatDate(project.due_date)}
                      </div>
                      <div className={`text-xs ${
                        isOverdue(project.due_date) ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                        {isOverdue(project.due_date) ? 'Overdue' : formatRelativeDate(project.due_date)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Client Information */}
              {(project.client_name || project.client_email) && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Client
                  </Label>
                  <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                    {project.client_name && (
                      <div className="font-medium text-sm">{project.client_name}</div>
                    )}
                    {project.client_email && (
                      <div className="text-xs text-muted-foreground">{project.client_email}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Budget & Hours */}
              {(project.budget_amount || project.estimated_hours) && (
                <div className="grid grid-cols-2 gap-4">
                  {project.budget_amount && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Budget
                      </Label>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="font-medium text-sm">
                          ${project.budget_amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {project.estimated_hours && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Hours
                      </Label>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="font-medium text-sm">
                          {project.estimated_hours}h
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Links */}
              {(project.rfp_document_url || project.submission_url) && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documents
                  </Label>
                  <div className="space-y-2">
                    {project.rfp_document_url && (
                      <a 
                        href={project.rfp_document_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 text-sm bg-muted/50 hover:bg-muted transition-colors rounded-lg"
                      >
                        <FileText className="h-4 w-4" />
                        RFP Document
                        <ExternalLink className="ml-auto h-3 w-3" />
                      </a>
                    )}
                    {project.submission_url && (
                      <a 
                        href={project.submission_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 text-sm bg-muted/50 hover:bg-muted transition-colors rounded-lg"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Submission Portal
                        <ExternalLink className="ml-auto h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{formatDate(project.created_at)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">{formatRelativeDate(project.updated_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Tags
                </CardTitle>
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
      <Suspense fallback={<LoadingSpinner text="Loading project details..." />}>
        <ProjectDetails projectId={id} />
      </Suspense>
    </div>
  )
}
