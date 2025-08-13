'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { List, CalendarDays, BarChart3, Search, Filter, SortAsc, Grid3x3 } from 'lucide-react'
import { ProjectListView } from './project-list-view'
import { ProjectCalendarView } from './project-calendar-view'
import { ProjectGanttView } from './project-gantt-view'
import { ProjectSpreadsheetView } from './project-spreadsheet-view'
import { ProjectFilters, type ProjectFilters as ProjectFiltersType, type SortOptions } from './project-filters'
// Remove server-side imports - data will be passed as props
import type { ProjectWithDetails, User, Tag } from '@/lib/types'

type ViewType = 'spreadsheet' | 'list' | 'calendar' | 'gantt'

const views = [
  { id: 'spreadsheet' as ViewType, name: 'Spreadsheet View', icon: Grid3x3 },
  { id: 'list' as ViewType, name: 'List View', icon: List },
  { id: 'calendar' as ViewType, name: 'Calendar View', icon: CalendarDays },
  { id: 'gantt' as ViewType, name: 'Gantt View', icon: BarChart3 }
]

interface ProjectViewClientProps {
  projects: ProjectWithDetails[]
  users: User[]
  tags: Tag[]
}

export function ProjectViewClient({ projects, users, tags }: ProjectViewClientProps) {
  const [currentView, setCurrentView] = useState<ViewType>('spreadsheet')
  const [filters, setFilters] = useState<ProjectFiltersType>({})
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'updated_at',
    direction: 'desc'
  })
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithDetails[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('updated_at')

  // Initialize filtered projects when component mounts or projects change
  useEffect(() => {
    setFilteredProjects(projects)
  }, [projects])

  useEffect(() => {
    // Apply filters and sorting
    let filtered = [...projects]

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower)
      )
    }

    // Apply stage filter
    if (stageFilter !== 'all') {
      filtered = filtered.filter(project => project.stage === stageFilter)
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority_banding === priorityFilter)
    }

    if (filters.stage) {
      filtered = filtered.filter(project => project.stage === filters.stage)
    }

    if (filters.priority_banding) {
      filtered = filtered.filter(project => project.priority_banding === filters.priority_banding)
    }

    if (filters.owner_id) {
      filtered = filtered.filter(project => project.owner_id === filters.owner_id)
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(project =>
        project.tags?.some(tag => filters.tags!.includes(tag.id))
      )
    }

    if (filters.due_date_from) {
      filtered = filtered.filter(project =>
        project.due_date && new Date(project.due_date) >= filters.due_date_from!
      )
    }

    if (filters.due_date_to) {
      filtered = filtered.filter(project =>
        project.due_date && new Date(project.due_date) <= filters.due_date_to!
      )
    }

    if (filters.is_overdue) {
      filtered = filtered.filter(project =>
        project.due_date && new Date(project.due_date) < new Date() && project.stage !== 'won' && project.stage !== 'submitted'
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof ProjectWithDetails]
      let bValue: any = b[sortBy as keyof ProjectWithDetails]

      // Handle special cases
      if (sortBy === 'priority') {
        const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 }
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
      }

      if (aValue === null || aValue === undefined) aValue = ''
      if (bValue === null || bValue === undefined) bValue = ''

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortOptions.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOptions.direction === 'asc' ? 1 : -1
      return 0
    })

    setFilteredProjects(filtered)
  }, [projects, filters, sortOptions, searchQuery, stageFilter, priorityFilter, sortBy])

  const renderCurrentView = () => {
    const commonProps = {
      projects: filteredProjects,
      searchQuery,
      stageFilter,
      priorityFilter,
      sortBy
    }

    // Show empty state if no projects
    if (filteredProjects.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No projects found</h3>
          <p className="text-sm text-muted-foreground">
            {projects.length === 0
              ? "Get started by creating your first project"
              : "Try adjusting your filters to see more projects"
            }
          </p>
        </div>
      )
    }

    switch (currentView) {
      case 'spreadsheet':
        return <ProjectSpreadsheetView {...commonProps} />
      case 'list':
        return <ProjectListView {...commonProps} />
      case 'calendar':
        return <ProjectCalendarView {...commonProps} />
      case 'gantt':
        return <ProjectGanttView {...commonProps} />
      default:
        return <ProjectSpreadsheetView {...commonProps} />
    }
  }

  const handleClearFilters = () => {
    setFilters({})
    setSearchQuery('')
    setStageFilter('all')
    setPriorityFilter('all')
    setSortBy('updated_at')
  }

  return (
    <div className="space-y-6">
      {/* View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          {views.map((view) => {
            const Icon = view.icon
            return (
              <Button
                key={view.id}
                variant={currentView === view.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView(view.id)}
                className={cn(
                  'flex items-center gap-2',
                  currentView === view.id && 'bg-primary text-primary-foreground border-primary shadow-sm font-medium'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{view.name}</span>
              </Button>
            )
          })}
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="skipped">Skipped</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_at">Last Updated</SelectItem>
              <SelectItem value="created_at">Created Date</SelectItem>
              <SelectItem value="due_date">Due Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Filters */}
      <ProjectFilters
        filters={filters}
        sortOptions={sortOptions}
        users={users}
        tags={tags}
        onFiltersChange={setFilters}
        onSortChange={setSortOptions}
        onClearFilters={handleClearFilters}
      />

      {/* Active Filters */}
      {(stageFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: &ldquo;{searchQuery}&rdquo;
              <button
                onClick={() => setSearchQuery('')}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                ×
              </button>
            </Badge>
          )}
          {stageFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Stage: {stageFilter}
              <button
                onClick={() => setStageFilter('all')}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                ×
              </button>
            </Badge>
          )}
          {priorityFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Priority: {priorityFilter}
              <button
                onClick={() => setPriorityFilter('all')}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                ×
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('')
              setStageFilter('all')
              setPriorityFilter('all')
              setSortBy('updated_at')
            }}
            className="h-6 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Current View */}
      <div className="min-h-[400px]">
        {renderCurrentView()}
      </div>
    </div>
  )
}
