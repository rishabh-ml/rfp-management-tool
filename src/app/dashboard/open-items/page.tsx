import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { UserAvatar } from '@/components/ui/user-avatar'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { StageBadge } from '@/components/ui/stage-badge'
import { ProjectService } from '@/lib/services/project-service'
import { formatDate, formatRelativeDate, isOverdue, getUserDisplayName } from '@/lib/utils'
import { 
  AlertTriangle, 
  Clock, 
  UserX, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Calendar,
  User,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

async function OpenItemsStats() {
  const projects = await ProjectService.getProjects()
  
  const stats = {
    overdue: projects.filter(p => p.due_date && new Date(p.due_date) < new Date() && !['won', 'lost', 'skipped'].includes(p.stage)).length,
    unassigned: projects.filter(p => p.stage === 'unassigned').length,
    pendingApproval: projects.filter(p => p.stage === 'submitted').length,
    atRisk: projects.filter(p => {
      if (!p.due_date) return false
      const daysUntilDue = Math.ceil((new Date(p.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilDue <= 3 && daysUntilDue > 0 && p.stage === 'assigned'
    }).length
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue Projects</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <p className="text-xs text-muted-foreground">
            Require immediate attention
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unassigned RFPs</CardTitle>
          <UserX className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.unassigned}</div>
          <p className="text-xs text-muted-foreground">
            Need team assignment
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.pendingApproval}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting client response
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">At Risk</CardTitle>
          <AlertCircle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.atRisk}</div>
          <p className="text-xs text-muted-foreground">
            Due within 3 days
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

async function OverdueProjects() {
  const projects = await ProjectService.getProjects()
  const overdueProjects = projects.filter(p => 
    p.due_date && 
    new Date(p.due_date) < new Date() && 
    !['won', 'lost', 'skipped'].includes(p.stage)
  ).sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Overdue Projects
        </CardTitle>
        <CardDescription>
          Projects that have passed their due date and require immediate attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        {overdueProjects.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-muted-foreground">No overdue projects!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {overdueProjects.map((project) => {
              const daysOverdue = Math.ceil((new Date().getTime() - new Date(project.due_date!).getTime()) / (1000 * 60 * 60 * 24))
              
              return (
                <div key={project.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex-1">
                    <Link 
                      href={`/dashboard/projects/${project.id}`}
                      className="font-medium hover:underline block"
                    >
                      {project.title}
                    </Link>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-2">
                        <StageBadge stage={project.stage} variant="outline" />
                        <PriorityBadge priority={project.priority} variant="outline" />
                      </div>
                      {project.owner && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <UserAvatar user={project.owner} size="sm" />
                          <span className="text-muted-foreground">
                            {getUserDisplayName(project.owner)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive" className="mb-2">
                      {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      Due: {formatDate(project.due_date!)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

async function UnassignedProjects() {
  const projects = await ProjectService.getProjects()
  const unassignedProjects = projects.filter(p => p.stage === 'unassigned')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserX className="h-5 w-5 text-orange-500" />
          Unassigned RFPs
        </CardTitle>
        <CardDescription>
          New RFPs that need to be assigned to team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        {unassignedProjects.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-muted-foreground">All projects are assigned!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {unassignedProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50">
                <div className="flex-1">
                  <Link 
                    href={`/dashboard/projects/${project.id}`}
                    className="font-medium hover:underline block"
                  >
                    {project.title}
                  </Link>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <PriorityBadge priority={project.priority} variant="outline" />
                    {project.due_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className={isOverdue(project.due_date) ? 'text-red-600' : 'text-muted-foreground'}>
                          Due {formatDate(project.due_date)}
                        </span>
                      </div>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/projects/${project.id}`}>
                      Assign
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <div className="text-xs text-muted-foreground mt-2">
                    Created {formatRelativeDate(project.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function OpenItemsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Open Items</h1>
          <p className="text-muted-foreground">
            Tasks and projects requiring admin attention or approval
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Export Report
          </Button>
          <Button size="sm">
            Bulk Actions
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <Suspense fallback={<LoadingSpinner text="Loading open items..." />}>
        <OpenItemsStats />
      </Suspense>

      {/* Open Items Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<LoadingSpinner text="Loading overdue projects..." />}>
          <OverdueProjects />
        </Suspense>

        <Suspense fallback={<LoadingSpinner text="Loading unassigned projects..." />}>
          <UnassignedProjects />
        </Suspense>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Bulk Assignment</div>
                <div className="text-sm text-muted-foreground">Assign multiple projects at once</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Send Reminders</div>
                <div className="text-sm text-muted-foreground">Notify team about overdue items</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Generate Report</div>
                <div className="text-sm text-muted-foreground">Create status report for management</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
