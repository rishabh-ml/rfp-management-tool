'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { List, CalendarDays, BarChart3, Search, Filter, SortAsc } from 'lucide-react'
import { ProjectListView } from './project-list-view'
import { ProjectCalendarView } from './project-calendar-view'
import { ProjectGanttView } from './project-gantt-view'
import type { ProjectWithDetails } from '@/lib/types'

type ViewType = 'list' | 'calendar' | 'gantt'

const views = [
  { id: 'list' as ViewType, name: 'List View', icon: List },
  { id: 'calendar' as ViewType, name: 'Calendar View', icon: CalendarDays },
  { id: 'gantt' as ViewType, name: 'Gantt View', icon: BarChart3 }
]

interface ProjectViewClientProps {
  projects: ProjectWithDetails[]
}

export function ProjectViewClient({ projects }: ProjectViewClientProps) {
  const [currentView, setCurrentView] = useState<ViewType>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('updated_at')

  const renderCurrentView = () => {
    const commonProps = {
      projects,
      searchQuery,
      stageFilter,
      priorityFilter,
      sortBy
    }

    switch (currentView) {
      case 'list':
        return <ProjectListView {...commonProps} />
      case 'calendar':
        return <ProjectCalendarView {...commonProps} />
      case 'gantt':
        return <ProjectGanttView {...commonProps} />
      default:
        return <ProjectListView {...commonProps} />
    }
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
                  currentView === view.id && 'bg-background shadow-sm'
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

      {/* Active Filters */}
      {(stageFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{searchQuery}"
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
