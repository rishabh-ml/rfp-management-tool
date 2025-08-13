'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/ui/date-picker'
import { Separator } from '@/components/ui/separator'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Filter, 
  X, 
  Search, 
  SortAsc, 
  SortDesc,
  Calendar,
  User,
  Tag as TagIcon,
  AlertCircle
} from 'lucide-react'
import type { User as UserType, Tag } from '@/lib/types'

export interface ProjectFilters {
  search?: string
  stage?: string
  priority_banding?: string
  owner_id?: string
  tags?: string[]
  due_date_from?: Date
  due_date_to?: Date
  is_overdue?: boolean
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

interface ProjectFiltersProps {
  filters: ProjectFilters
  sortOptions: SortOptions
  users?: UserType[]
  tags?: Tag[]
  onFiltersChange: (filters: ProjectFilters) => void
  onSortChange: (sort: SortOptions) => void
  onClearFilters: () => void
}

const SORT_OPTIONS = [
  { value: 'title', label: 'Title' },
  { value: 'created_at', label: 'Created Date' },
  { value: 'updated_at', label: 'Last Updated' },
  { value: 'due_date', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'stage', label: 'Stage' }
]

const STAGE_OPTIONS = [
  { value: 'discovery', label: 'Discovery' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'completed', label: 'Completed' }
]

const PRIORITY_BANDING_OPTIONS = [
  { value: 'P1', label: 'P1' },
  { value: 'P2', label: 'P2' },
  { value: 'P3', label: 'P3' }
]

export function ProjectFilters({
  filters,
  sortOptions,
  users = [],
  tags = [],
  onFiltersChange,
  onSortChange,
  onClearFilters
}: ProjectFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<ProjectFilters>(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const updateFilter = (key: keyof ProjectFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const toggleTag = (tagId: string) => {
    const currentTags = localFilters.tags || []
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId]
    updateFilter('tags', newTags)
  }

  const clearFilter = (key: keyof ProjectFilters) => {
    const newFilters = { ...localFilters }
    delete newFilters[key]
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.stage) count++
    if (filters.priority_banding) count++
    if (filters.owner_id) count++
    if (filters.tags && filters.tags.length > 0) count++
    if (filters.due_date_from || filters.due_date_to) count++
    if (filters.is_overdue) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={localFilters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
          {localFilters.search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearFilter('search')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <Select 
            value={sortOptions.field} 
            onValueChange={(value) => onSortChange({ ...sortOptions, field: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSortChange({ 
              ...sortOptions, 
              direction: sortOptions.direction === 'asc' ? 'desc' : 'asc' 
            })}
          >
            {sortOptions.direction === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Advanced Filters */}
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Filter Projects</span>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={onClearFilters}>
                  Clear All
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <div className="p-4 space-y-4">
              {/* Stage Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Stage</Label>
                <Select
                  value={localFilters.stage || 'all'}
                  onValueChange={(value) => updateFilter('stage', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All stages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All stages</SelectItem>
                    {STAGE_OPTIONS.map((stage) => (
                      <SelectItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Banding Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Priority Banding</Label>
                <Select
                  value={localFilters.priority_banding || 'all'}
                  onValueChange={(value) => updateFilter('priority_banding', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All priority bandings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priority bandings</SelectItem>
                    {PRIORITY_BANDING_OPTIONS.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Owner Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Owner</Label>
                <Select
                  value={localFilters.owner_id || 'all'}
                  onValueChange={(value) => updateFilter('owner_id', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All owners" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All owners</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.first_name} {user.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags Filter */}
              {tags.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={localFilters.tags?.includes(tag.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag.id)}
                        style={{
                          backgroundColor: localFilters.tags?.includes(tag.id) ? tag.color : 'transparent',
                          borderColor: tag.color,
                          color: localFilters.tags?.includes(tag.id) ? 'white' : tag.color
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Range Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Due Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">From</Label>
                    <DatePicker
                      date={localFilters.due_date_from}
                      onDateChange={(date) => updateFilter('due_date_from', date)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">To</Label>
                    <DatePicker
                      date={localFilters.due_date_to}
                      onDateChange={(date) => updateFilter('due_date_to', date)}
                    />
                  </div>
                </div>
              </div>

              {/* Overdue Filter */}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Show only overdue</Label>
                <Button
                  variant={localFilters.is_overdue ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter('is_overdue', !localFilters.is_overdue)}
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {localFilters.is_overdue ? 'On' : 'Off'}
                </Button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              <Search className="h-3 w-3" />
              &ldquo;{filters.search}&rdquo;
              <button onClick={() => clearFilter('search')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.stage && (
            <Badge variant="secondary" className="gap-1">
              Stage: {STAGE_OPTIONS.find(s => s.value === filters.stage)?.label}
              <button onClick={() => clearFilter('stage')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.priority_banding && (
            <Badge variant="secondary" className="gap-1">
              Priority Banding: {PRIORITY_BANDING_OPTIONS.find(p => p.value === filters.priority_banding)?.label}
              <button onClick={() => clearFilter('priority_banding')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.owner_id && (
            <Badge variant="secondary" className="gap-1">
              <User className="h-3 w-3" />
              Owner: {users.find(u => u.id === filters.owner_id)?.first_name}
              <button onClick={() => clearFilter('owner_id')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.tags && filters.tags.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              <TagIcon className="h-3 w-3" />
              {filters.tags.length} tag{filters.tags.length > 1 ? 's' : ''}
              <button onClick={() => clearFilter('tags')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {(filters.due_date_from || filters.due_date_to) && (
            <Badge variant="secondary" className="gap-1">
              <Calendar className="h-3 w-3" />
              Date range
              <button onClick={() => {
                clearFilter('due_date_from')
                clearFilter('due_date_to')
              }}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.is_overdue && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Overdue only
              <button onClick={() => clearFilter('is_overdue')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
