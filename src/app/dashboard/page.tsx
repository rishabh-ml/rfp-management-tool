import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ProjectService } from '@/lib/services/project-service'
import { UserService } from '@/lib/services/user-service'
import { PROJECT_STAGES } from '@/lib/constants'
import {
  BarChart3,
  Users,
  FolderOpen,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trophy,
  Calendar,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatRelativeDate } from '@/lib/utils'

async function DashboardStats() {
  const [projects, currentUser] = await Promise.all([
    ProjectService.getProjects(),
    UserService.getCurrentUser()
  ])

  const stats = {
    total: projects.length,
    byStage: Object.keys(PROJECT_STAGES).reduce((acc, stage) => {
      acc[stage as keyof typeof PROJECT_STAGES] = projects.filter(p => p.stage === stage).length
      return acc
    }, {} as Record<string, number>),
    myProjects: projects.filter(p => p.owner_id === currentUser?.id).length,
    overdue: projects.filter(p => p.due_date && new Date(p.due_date) < new Date()).length,
    thisMonth: projects.filter(p => {
      const created = new Date(p.created_at)
      const now = new Date()
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length
  }

  const winRate = stats.total > 0 ? ((stats.byStage.won || 0) / stats.total * 100) : 0

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            +{stats.thisMonth} this month
          </p>
        </CardContent>
      </Card>

      {/* Assigned Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Assigned Projects</CardTitle>
          <BarChart3 className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.byStage.assigned || 0}</div>
          <p className="text-xs text-muted-foreground">
            Currently in progress
          </p>
        </CardContent>
      </Card>

      {/* Submitted Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Submitted Projects</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.byStage.submitted || 0}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting client response
          </p>
        </CardContent>
      </Card>

      {/* Win Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          <Trophy className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{winRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {stats.byStage.won || 0} won / {stats.total} total
          </p>
        </CardContent>
      </Card>

      {/* In Progress Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <Activity className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.byStage.assigned || 0}</div>
          <div className="mt-2">
            <Progress value={(stats.byStage.assigned || 0) / Math.max(stats.total, 1) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Skipped Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Skipped Projects</CardTitle>
          <XCircle className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-600">{stats.byStage.skipped || 0}</div>
          <p className="text-xs text-muted-foreground">
            Not pursued
          </p>
        </CardContent>
      </Card>

      {/* Won Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Won Projects</CardTitle>
          <Trophy className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.byStage.won || 0}</div>
          <p className="text-xs text-muted-foreground">
            Successful proposals
          </p>
        </CardContent>
      </Card>

      {/* Lost Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lost Projects</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.byStage.lost || 0}</div>
          <p className="text-xs text-muted-foreground">
            Unsuccessful proposals
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

async function RecentActivity() {
  const projects = await ProjectService.getProjects(undefined, { field: 'updated_at', direction: 'desc' }, 8)

  // Mock activity data based on projects
  const activities = projects.slice(0, 6).map((project, index) => ({
    id: `activity_${index}`,
    type: ['created', 'updated', 'assigned', 'submitted'][index % 4] as 'created' | 'updated' | 'assigned' | 'submitted',
    project: project,
    user: project.owner || { first_name: 'System', last_name: 'Admin' },
    timestamp: new Date(Date.now() - index * 2 * 60 * 60 * 1000).toISOString() // Stagger by 2 hours
  }))

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created': return <FolderOpen className="h-4 w-4 text-green-500" />
      case 'updated': return <Activity className="h-4 w-4 text-blue-500" />
      case 'assigned': return <Users className="h-4 w-4 text-purple-500" />
      case 'submitted': return <CheckCircle className="h-4 w-4 text-orange-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityText = (activity: typeof activities[0]) => {
    switch (activity.type) {
      case 'created': return 'created project'
      case 'updated': return 'updated project'
      case 'assigned': return 'was assigned to project'
      case 'submitted': return 'submitted project'
      default: return 'interacted with project'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest updates across all projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">
                    {activity.user.first_name} {activity.user.last_name}
                  </span>
                  {' '}
                  <span className="text-muted-foreground">
                    {getActivityText(activity)}
                  </span>
                  {' '}
                  <Link
                    href={`/dashboard/projects/${activity.project.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {activity.project.title}
                  </Link>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeDate(activity.timestamp)}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {activity.project.stage.replace('_', ' ')}
              </Badge>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/dashboard/projects">
              View All Projects
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

async function UpcomingDeadlines() {
  const projects = await ProjectService.getProjects()
  const upcomingProjects = projects
    .filter(p => p.due_date && new Date(p.due_date) > new Date())
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5)

  const overdueProjects = projects
    .filter(p => p.due_date && new Date(p.due_date) < new Date() && p.stage !== 'won' && p.stage !== 'lost')
    .length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Deadlines
          {overdueProjects > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {overdueProjects} overdue
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Projects with approaching due dates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingProjects.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingProjects.map((project) => {
              const daysUntilDue = Math.ceil(
                (new Date(project.due_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              )
              const isUrgent = daysUntilDue <= 3

              return (
                <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="font-medium hover:underline block truncate"
                    >
                      {project.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {project.stage.replace('_', ' ')}
                      </Badge>
                      {project.owner && (
                        <span className="text-xs text-muted-foreground">
                          {project.owner.first_name} {project.owner.last_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className={`text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {daysUntilDue === 0 ? 'Today' :
                       daysUntilDue === 1 ? 'Tomorrow' :
                       `${daysUntilDue} days`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(project.due_date!).toLocaleDateString()}
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

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of your RFP management system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/projects">
              <BarChart3 className="mr-2 h-4 w-4" />
              View All Projects
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/projects/new">
              <FolderOpen className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Suspense fallback={<LoadingSpinner text="Loading statistics..." />}>
        <DashboardStats />
      </Suspense>

      {/* Activity and Deadlines */}
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<LoadingSpinner text="Loading activity..." />}>
          <RecentActivity />
        </Suspense>

        <Suspense fallback={<LoadingSpinner text="Loading deadlines..." />}>
          <UpcomingDeadlines />
        </Suspense>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Average Response Time</span>
              <span className="font-medium">2.3 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Client Satisfaction</span>
              <span className="font-medium">94%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">On-Time Delivery</span>
              <span className="font-medium">87%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Overdue Projects</span>
              <Badge variant="destructive">2</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending Approvals</span>
              <Badge variant="secondary">5</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Unassigned RFPs</span>
              <Badge variant="outline">3</Badge>
            </div>
            <Button variant="outline" size="sm" asChild className="w-full mt-4">
              <Link href="/dashboard/open-items">
                View Open Items
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Team Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Members</span>
              <span className="font-medium">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Workload Distribution</span>
              <span className="font-medium">Balanced</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg. Projects per Member</span>
              <span className="font-medium">2.4</span>
            </div>
            <Button variant="outline" size="sm" asChild className="w-full mt-4">
              <Link href="/dashboard/members">
                Manage Team
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
