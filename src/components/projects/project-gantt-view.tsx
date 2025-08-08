import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart3, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import Link from 'next/link'
import type { ProjectWithDetails } from '@/lib/types'

interface ProjectGanttViewProps {
  projects: ProjectWithDetails[]
  searchQuery: string
  stageFilter: string
  priorityFilter: string
  sortBy: string
}

export function ProjectGanttView({ projects, ...props }: ProjectGanttViewProps) {
  // TODO: Implement full Gantt chart functionality
  const currentDate = new Date()
  
  // Mock Gantt data
  const ganttProjects = [
    {
      id: '1',
      title: 'City Council Website Redesign',
      startDate: new Date(2024, 0, 15),
      endDate: new Date(2024, 2, 15),
      progress: 65,
      stage: 'assigned',
      priority: 'high',
      dependencies: []
    },
    {
      id: '2',
      title: 'E-commerce Platform',
      startDate: new Date(2024, 1, 1),
      endDate: new Date(2024, 3, 28),
      progress: 35,
      stage: 'assigned',
      priority: 'medium',
      dependencies: ['1']
    },
    {
      id: '3',
      title: 'Mobile Banking App MVP',
      startDate: new Date(2024, 0, 20),
      endDate: new Date(2024, 1, 20),
      progress: 100,
      stage: 'submitted',
      priority: 'urgent',
      dependencies: []
    },
    {
      id: '4',
      title: 'Corporate Dashboard',
      startDate: new Date(2024, 2, 1),
      endDate: new Date(2024, 4, 15),
      progress: 0,
      stage: 'unassigned',
      priority: 'low',
      dependencies: ['2']
    }
  ]

  const getProjectDuration = (startDate: Date, endDate: Date) => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getProjectPosition = (startDate: Date) => {
    const yearStart = new Date(currentDate.getFullYear(), 0, 1)
    const diffTime = Math.abs(startDate.getTime() - yearStart.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return (diffDays / 365) * 100 // Percentage of year
  }

  const getProjectWidth = (startDate: Date, endDate: Date) => {
    const duration = getProjectDuration(startDate, endDate)
    return (duration / 365) * 100 // Percentage of year
  }

  return (
    <div className="space-y-6">
      {/* Gantt Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Project Timeline - {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Timeline Header */}
          <div className="mb-4">
            <div className="grid grid-cols-12 gap-1 text-xs text-center text-muted-foreground">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
                <div key={month} className="p-2 border-r">
                  {month}
                </div>
              ))}
            </div>
          </div>

          {/* Gantt Chart */}
          <div className="space-y-3">
            {ganttProjects.map((project) => (
              <div key={project.id} className="flex items-center gap-4">
                {/* Project Info */}
                <div className="w-64 flex-shrink-0">
                  <Link 
                    href={`/dashboard/projects/${project.id}`}
                    className="font-medium hover:underline block truncate"
                  >
                    {project.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {project.stage}
                    </Badge>
                    <Badge 
                      variant={project.priority === 'urgent' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {project.priority}
                    </Badge>
                  </div>
                </div>

                {/* Timeline Bar */}
                <div className="flex-1 relative h-8 bg-muted rounded">
                  <div
                    className={`absolute top-0 h-full rounded flex items-center px-2 text-xs text-white font-medium ${
                      project.stage === 'submitted' ? 'bg-green-500' :
                      project.stage === 'assigned' ? 'bg-blue-500' :
                      project.stage === 'unassigned' ? 'bg-gray-400' :
                      'bg-purple-500'
                    }`}
                    style={{
                      left: `${getProjectPosition(project.startDate)}%`,
                      width: `${Math.max(getProjectWidth(project.startDate, project.endDate), 5)}%`
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{project.progress}%</span>
                      <div 
                        className="bg-white/30 h-1 rounded"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="w-20 text-xs text-muted-foreground text-right">
                  {getProjectDuration(project.startDate, project.endDate)} days
                </div>
              </div>
            ))}
          </div>

          {/* Today Indicator */}
          <div className="relative mt-4">
            <div 
              className="absolute top-0 w-0.5 h-full bg-red-500"
              style={{ left: `${getProjectPosition(currentDate)}%` }}
            >
              <div className="absolute -top-2 -left-6 text-xs text-red-500 font-medium">
                Today
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Timeline Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Projects:</span>
                <span className="font-medium">{ganttProjects.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">In Progress:</span>
                <span className="font-medium">{ganttProjects.filter(p => p.stage === 'assigned').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed:</span>
                <span className="font-medium">{ganttProjects.filter(p => p.stage === 'submitted').length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Critical Path</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Longest Project:</span>
                <span className="font-medium">120 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dependencies:</span>
                <span className="font-medium">2 chains</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">At Risk:</span>
                <span className="font-medium text-orange-600">1 project</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Resource Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Team Utilization:</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Parallel Projects:</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Capacity:</span>
                <span className="font-medium text-green-600">Available</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
