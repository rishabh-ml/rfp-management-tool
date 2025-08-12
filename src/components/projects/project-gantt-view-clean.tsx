'use client'

import { useState } from 'react'
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

export function ProjectGanttView({ projects, searchQuery, stageFilter, priorityFilter }: ProjectGanttViewProps) {
  const [zoomLevel, setZoomLevel] = useState(1) // 1 = normal, 0.5 = zoomed out, 2 = zoomed in
  const [timelinePosition, setTimelinePosition] = useState(0) // for left/right navigation
  const currentDate = new Date()

  // Zoom functionality
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.5, 4)) // Max 4x zoom
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.25)) // Min 0.25x zoom
  }

  const handleNavigateLeft = () => {
    setTimelinePosition(prev => Math.max(prev - 10, -50)) // Move left, min -50%
  }

  const handleNavigateRight = () => {
    setTimelinePosition(prev => Math.min(prev + 10, 50)) // Move right, max 50%
  }
  
  // Safety check for projects prop
  if (!projects || !Array.isArray(projects)) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No project data available.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Filter the projects
  const ganttProjects = projects.filter(project => {
    // Search filter
    const matchesSearch = !searchQuery || 
      project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())

    // Stage filter
    const matchesStage = stageFilter === 'all' || project.stage === stageFilter

    // Priority filter
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter

    return matchesSearch && matchesStage && matchesPriority
  })

  // Ensure project has valid dates
  const projectsWithDates = ganttProjects.filter(project => 
    project.startDate && project.endDate
  )

  // Helper functions for Gantt calculations
  const getDatePosition = (date: string) => {
    const projectDate = new Date(date)
    const yearStart = new Date(currentDate.getFullYear(), 0, 1)
    const yearEnd = new Date(currentDate.getFullYear(), 11, 31)
    const totalDays = (yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)
    const daysSinceStart = (projectDate.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)
    return Math.max(0, Math.min(100, (daysSinceStart / totalDays) * 100))
  }

  const getProjectPosition = (startDate: string) => {
    return getDatePosition(startDate) * zoomLevel
  }

  const getProjectWidth = (startDate: string, endDate: string) => {
    const startPos = getDatePosition(startDate)
    const endPos = getDatePosition(endDate)
    return Math.max(2, (endPos - startPos) * zoomLevel)
  }

  const getProjectDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-6">
      {/* Gantt Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Project Timeline - {currentDate.getFullYear()}
              <Badge variant="secondary" className="ml-2">
                {projectsWithDates.length} projects
              </Badge>
            </CardTitle>
            {/* Zoom controls */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={handleZoomOut} title="Zoom Out">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomIn} title="Zoom In">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleNavigateLeft} title="Navigate Left">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleNavigateRight} title="Navigate Right">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground ml-2">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {projectsWithDates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No projects found matching your criteria.</p>
            </div>
          ) : (
            <>
              {/* Timeline Header */}
              <div className="mb-4 overflow-x-auto">
                <div 
                  className="grid grid-cols-12 gap-1 text-xs text-center text-muted-foreground transition-transform duration-200"
                  style={{ 
                    transform: `scaleX(${zoomLevel}) translateX(${timelinePosition}px)`,
                    minWidth: '100%'
                  }}
                >
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
                    <div key={month} className="p-2 border-r">
                      {month}
                    </div>
                  ))}
                </div>
              </div>

              {/* Gantt Chart */}
              <div className="space-y-3 overflow-x-auto">
                <div 
                  className="transition-transform duration-200"
                  style={{ 
                    transform: `translateX(${timelinePosition}px)`,
                    minWidth: '100%'
                  }}
                >
                  {projectsWithDates.map((project) => (
                    <div key={project.id} className="flex items-center gap-4 mb-3">
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
                      <div className="flex-1 relative h-8">
                        <div 
                          className={`absolute top-1 h-6 rounded-md text-xs text-white px-2 flex items-center ${
                            project.stage === 'won' ? 'bg-green-500' :
                            project.stage === 'submitted' ? 'bg-yellow-500' :
                            project.stage === 'assigned' ? 'bg-blue-500' :
                            project.stage === 'unassigned' ? 'bg-gray-400' :
                            project.stage === 'lost' ? 'bg-red-500' :
                            'bg-purple-500'
                          }`}
                          style={{
                            left: `${getProjectPosition(project.startDate)}%`,
                            width: `${Math.max(getProjectWidth(project.startDate, project.endDate), 5)}%`
                          }}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate">{project.progress}%</span>
                            {project.progress > 0 && (
                              <div 
                                className="bg-white/30 h-1 rounded ml-2"
                                style={{ width: `${Math.min(project.progress, 100)}%` }}
                              />
                            )}
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
              </div>

              {/* Today Indicator */}
              <div className="relative mt-4 overflow-x-auto">
                <div 
                  className="absolute top-0 w-0.5 h-full bg-red-500 transition-transform duration-200"
                  style={{ 
                    left: `${getProjectPosition(currentDate.toISOString())}%`,
                    transform: `translateX(${timelinePosition}px)`
                  }}
                >
                  <div className="absolute -top-2 -left-6 text-xs text-red-500 font-medium">
                    Today
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Project Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Project Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Timeline Overview */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Timeline Overview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Projects:</span>
                  <span className="font-medium">{projectsWithDates.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">In Progress:</span>
                  <span className="font-medium text-blue-600">
                    {projectsWithDates.filter(p => p.stage === 'assigned').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="font-medium text-green-600">
                    {projectsWithDates.filter(p => p.stage === 'submitted' || p.stage === 'won').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unassigned:</span>
                  <span className="font-medium text-gray-600">
                    {projectsWithDates.filter(p => p.stage === 'unassigned').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Analysis */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Progress Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Progress:</span>
                  <span className="font-medium">
                    {projectsWithDates.length > 0 
                      ? Math.round(projectsWithDates.reduce((sum, p) => sum + p.progress, 0) / projectsWithDates.length)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">On Track:</span>
                  <span className="font-medium text-green-600">
                    {projectsWithDates.filter(p => p.progress >= 70).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">At Risk:</span>
                  <span className="font-medium text-orange-600">
                    {projectsWithDates.filter(p => p.progress < 30 && p.stage === 'assigned').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Subtasks:</span>
                  <span className="font-medium">
                    {projectsWithDates.reduce((sum, p) => sum + (p.subtasksCount || 0), 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Priority Distribution</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Urgent:</span>
                  <span className="font-medium text-red-600">
                    {projectsWithDates.filter(p => p.priority === 'urgent').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">High:</span>
                  <span className="font-medium text-orange-600">
                    {projectsWithDates.filter(p => p.priority === 'high').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Medium:</span>
                  <span className="font-medium text-blue-600">
                    {projectsWithDates.filter(p => p.priority === 'medium').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Low:</span>
                  <span className="font-medium text-gray-600">
                    {projectsWithDates.filter(p => p.priority === 'low').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
