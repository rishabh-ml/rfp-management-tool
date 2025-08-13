'use client'

import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { UserAvatar } from '@/components/ui/user-avatar'
import { StageBadge } from '@/components/ui/stage-badge'
import { Tag } from '@/components/ui/tag'
import { EmptyState } from '@/components/ui/empty-state'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { cn, formatDate, formatRelativeDate, isOverdue, getUserDisplayName } from '@/lib/utils'
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  MoreHorizontal,
  Edit,
  Eye,
  Copy,
  Trash2,
  Filter,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  User,
  MessageSquare,
  CheckSquare,
  Target,
  Link as LinkIcon,
  Clock,
  DollarSign
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'
import type { ProjectWithDetails, ProjectStage, ProjectPriority } from '@/lib/types'

interface ProjectSpreadsheetViewProps {
  projects: ProjectWithDetails[]
  searchQuery: string
  stageFilter: string
  priorityFilter: string
  sortBy: string
}

interface ColumnConfig {
  key: keyof ProjectWithDetails | 'actions' | 'select'
  label: string
  width: number
  sortable: boolean
  filterable: boolean
  visible: boolean
  type: 'text' | 'date' | 'number' | 'badge' | 'user' | 'progress' | 'currency' | 'link' | 'actions' | 'checkbox'
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'select', label: '', width: 50, sortable: false, filterable: false, visible: true, type: 'checkbox' },
  { key: 'title', label: 'Project Title', width: 250, sortable: true, filterable: true, visible: true, type: 'link' },
  { key: 'stage', label: 'Stage', width: 120, sortable: true, filterable: true, visible: true, type: 'badge' },
  { key: 'priority_banding', label: 'Priority', width: 100, sortable: true, filterable: true, visible: true, type: 'badge' },
  { key: 'due_date', label: 'Due Date', width: 120, sortable: true, filterable: true, visible: true, type: 'date' },
  { key: 'owner_id', label: 'Owner', width: 150, sortable: true, filterable: true, visible: true, type: 'user' },
  { key: 'progress_percentage', label: 'Progress', width: 100, sortable: true, filterable: false, visible: true, type: 'progress' },
  { key: 'client_name', label: 'Client', width: 150, sortable: true, filterable: true, visible: true, type: 'text' },
  { key: 'budget_amount', label: 'Budget', width: 120, sortable: true, filterable: false, visible: true, type: 'currency' },
  { key: 'estimated_hours', label: 'Est. Hours', width: 100, sortable: true, filterable: false, visible: true, type: 'number' },
  { key: 'actual_hours', label: 'Actual Hours', width: 100, sortable: true, filterable: false, visible: true, type: 'number' },
  { key: 'created_at', label: 'Created', width: 120, sortable: true, filterable: false, visible: true, type: 'date' },
  { key: 'updated_at', label: 'Updated', width: 120, sortable: true, filterable: false, visible: true, type: 'date' },
  { key: 'rfp_title', label: 'RFP Title', width: 200, sortable: true, filterable: true, visible: false, type: 'text' },
  { key: 'state', label: 'State', width: 100, sortable: true, filterable: true, visible: false, type: 'text' },
  { key: 'company_assignment', label: 'Company', width: 150, sortable: true, filterable: true, visible: false, type: 'text' },
  { key: 'actions', label: 'Actions', width: 80, sortable: false, filterable: false, visible: true, type: 'actions' },
]

type SortDirection = 'asc' | 'desc' | null

export function ProjectSpreadsheetView({ projects, searchQuery, stageFilter, priorityFilter, sortBy }: ProjectSpreadsheetViewProps) {
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [sortColumn, setSortColumn] = useState<string>(sortBy)
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [editingCell, setEditingCell] = useState<{ rowId: string, columnKey: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})
  const [resizing, setResizing] = useState<{ columnKey: string, startX: number, startWidth: number } | null>(null)
  
  const tableRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get visible columns
  const visibleColumns = useMemo(() => columns.filter(col => col.visible), [columns])

  // Sort and paginate data
  const sortedAndFilteredProjects = useMemo(() => {
    let filtered = [...projects]

    // Apply column-specific filters
    Object.entries(columnFilters).forEach(([columnKey, filterValue]) => {
      if (!filterValue) return
      
      const column = columns.find(col => col.key === columnKey)
      if (!column) return

      filtered = filtered.filter(project => {
        const value = project[columnKey as keyof ProjectWithDetails]
        if (value === null || value === undefined) return false
        
        return String(value).toLowerCase().includes(filterValue.toLowerCase())
      })
    })

    // Sort
    if (sortColumn && sortDirection) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortColumn as keyof ProjectWithDetails]
        let bValue: any = b[sortColumn as keyof ProjectWithDetails]

        // Handle special cases
        if (sortColumn === 'priority_banding') {
          const priorityOrder = { P1: 3, P2: 2, P3: 1, 'No bid': 0 }
          aValue = priorityOrder[aValue as keyof typeof priorityOrder] || 0
          bValue = priorityOrder[bValue as keyof typeof priorityOrder] || 0
        }

        if (aValue === null || aValue === undefined) aValue = ''
        if (bValue === null || bValue === undefined) bValue = ''

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [projects, sortColumn, sortDirection, columnFilters, columns])

  // Pagination
  const totalPages = Math.ceil(sortedAndFilteredProjects.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentPageProjects = sortedAndFilteredProjects.slice(startIndex, endIndex)

  // Handle bulk actions
  const handleBulkDelete = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete ${selectedRows.size} project(s)?`)) {
      // Implementation for bulk delete
      console.log('Bulk delete:', selectedRows)
      // After successful deletion, clear selection
      setSelectedRows(new Set())
    }
  }, [selectedRows])

  const handleBulkExport = useCallback(() => {
    // Create CSV export
    const selectedProjects = projects.filter(p => selectedRows.size === 0 || selectedRows.has(p.id))
    const visibleFields = visibleColumns.filter(col => col.key !== 'select' && col.key !== 'actions')
    
    // Create CSV headers
    const headers = visibleFields.map(col => col.label).join(',')
    
    // Create CSV rows
    const rows = selectedProjects.map(project => {
      return visibleFields.map(col => {
        const value = project[col.key as keyof ProjectWithDetails]
        if (value === null || value === undefined) return ''
        
        // Handle special formatting
        if (col.type === 'date' && value) {
          return formatDate(new Date(value as string))
        }
        if (col.type === 'currency' && value) {
          return (value as number).toString()
        }
        if (col.key === 'owner_id' && project.owner) {
          return getUserDisplayName(project.owner)
        }
        
        // Escape quotes and commas in CSV
        let csvValue = String(value).replace(/"/g, '""')
        if (csvValue.includes(',') || csvValue.includes('"') || csvValue.includes('\n')) {
          csvValue = `"${csvValue}"`
        }
        return csvValue
      }).join(',')
    }).join('\n')
    
    const csvContent = [headers, rows].join('\n')
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `projects-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [selectedRows, projects, visibleColumns])

  // Handle mouse move for column resizing
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizing) return
    
    const deltaX = e.clientX - resizing.startX
    const newWidth = Math.max(50, resizing.startWidth + deltaX)
    
    setColumns(prev => prev.map(col => 
      col.key === resizing.columnKey ? { ...col, width: newWidth } : col
    ))
  }, [resizing])

  // Handle mouse up for column resizing
  const handleMouseUp = useCallback(() => {
    setResizing(null)
  }, [])

  // Add event listeners for column resizing
  useEffect(() => {
    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
      }
    }
  }, [resizing, handleMouseMove, handleMouseUp])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+A to select all
      if (e.ctrlKey && e.key === 'a' && !editingCell) {
        e.preventDefault()
        setSelectedRows(new Set(currentPageProjects.map(p => p.id)))
      }
      
      // Escape to clear selection or exit editing
      if (e.key === 'Escape') {
        if (editingCell) {
          setEditingCell(null)
        } else {
          setSelectedRows(new Set())
        }
      }
      
      // Delete selected rows
      if (e.key === 'Delete' && selectedRows.size > 0 && !editingCell) {
        handleBulkDelete()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [editingCell, selectedRows, currentPageProjects, handleBulkDelete])

  // Focus input when editing
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  // Handle sorting
  const handleSort = useCallback((columnKey: string) => {
    if (columnKey === sortColumn) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc')
      if (sortDirection === 'desc') {
        setSortColumn('')
      }
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }, [sortColumn, sortDirection])

  // Handle row selection
  const handleSelectRow = useCallback((projectId: string, checked: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(projectId)
      } else {
        newSet.delete(projectId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(currentPageProjects.map(p => p.id)))
    } else {
      setSelectedRows(new Set())
    }
  }, [currentPageProjects])

  // Handle column visibility
  const toggleColumnVisibility = useCallback((columnKey: string) => {
    setColumns(prev => prev.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ))
  }, [])

  // Handle column resizing
  const handleMouseDown = useCallback((e: React.MouseEvent, columnKey: string) => {
    const column = columns.find(col => col.key === columnKey)
    if (!column) return

    setResizing({
      columnKey,
      startX: e.clientX,
      startWidth: column.width
    })
  }, [columns])

  // Handle cell editing
  const handleCellDoubleClick = useCallback((projectId: string, columnKey: string) => {
    const column = columns.find(col => col.key === columnKey)
    if (!column || !column.sortable || column.type === 'actions' || column.type === 'checkbox') return
    
    setEditingCell({ rowId: projectId, columnKey })
  }, [columns])

  const handleCellEditSave = useCallback((projectId: string, columnKey: string, value: string) => {
    // Here you would typically save the value to your backend
    console.log('Saving:', { projectId, columnKey, value })
    setEditingCell(null)
  }, [])

  const handleCellEditCancel = useCallback(() => {
    setEditingCell(null)
  }, [])

  // Render cell content
  const renderCellContent = useCallback((project: ProjectWithDetails, column: ColumnConfig) => {
    const value = project[column.key as keyof ProjectWithDetails]
    const isEditing = editingCell?.rowId === project.id && editingCell?.columnKey === column.key

    if (column.key === 'select') {
      return (
        <Checkbox
          checked={selectedRows.has(project.id)}
          onCheckedChange={(checked) => handleSelectRow(project.id, !!checked)}
        />
      )
    }

    if (column.key === 'actions') {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/projects/${project.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/projects/${project.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    // Inline editing for text and number fields
    if (isEditing && (column.type === 'text' || column.type === 'number')) {
      return (
        <Input
          ref={inputRef}
          defaultValue={value as string || ''}
          className="h-6 text-xs border-blue-500"
          onBlur={(e) => handleCellEditSave(project.id, column.key as string, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCellEditSave(project.id, column.key as string, e.currentTarget.value)
            } else if (e.key === 'Escape') {
              handleCellEditCancel()
            }
          }}
        />
      )
    }

    switch (column.type) {
      case 'link':
        return (
          <Link 
            href={`/dashboard/projects/${project.id}`} 
            className="text-blue-600 hover:underline font-medium truncate block"
            title={String(value || '')}
          >
            {String(value || '-')}
          </Link>
        )

      case 'badge':
        if (column.key === 'stage') {
          return <StageBadge stage={value as ProjectStage} variant="outline" />
        }
        if (column.key === 'priority_banding') {
          return value ? (
            <Badge variant="outline" className="gap-1">
              <Target className="h-3 w-3" />
              {String(value)}
            </Badge>
          ) : '-'
        }
        return value ? <Badge variant="outline">{String(value)}</Badge> : '-'

      case 'user':
        if (column.key === 'owner_id' && project.owner) {
          return (
            <div className="flex items-center gap-2">
              <UserAvatar user={project.owner} size="sm" />
              <span className="truncate">{getUserDisplayName(project.owner)}</span>
            </div>
          )
        }
        return value ? <span className="truncate">{String(value)}</span> : '-'

      case 'date':
        if (!value) return '-'
        const date = new Date(value as string)
        const isOverdueDate = column.key === 'due_date' && isOverdue(value as string) && 
          !['won', 'submitted'].includes(project.stage)
        
        return (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className={cn(
              "text-sm truncate",
              isOverdueDate && "text-red-600 font-medium"
            )}>
              {formatDate(date)}
            </span>
          </div>
        )

      case 'progress':
        const progress = value as number || 0
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground min-w-[3ch]">
              {progress}%
            </span>
          </div>
        )

      case 'currency':
        if (!value) return '-'
        return (
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-muted-foreground" />
            <span className="font-mono text-sm">
              {new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(value as number)}
            </span>
          </div>
        )

      case 'number':
        if (!value) return '-'
        return (
          <span className="font-mono text-sm">
            {typeof value === 'number' ? value.toLocaleString() : String(value)}
          </span>
        )

      default:
        return (
          <span className="truncate block" title={String(value || '')}>
            {String(value || '-')}
          </span>
        )
    }
  }, [selectedRows, handleSelectRow, editingCell, handleCellEditSave, handleCellEditCancel])

  // Handle column freeze/unfreeze
  const handleFreezeColumn = useCallback((columnKey: string) => {
    // Implementation for freezing columns - would require more complex CSS
    console.log('Freeze column:', columnKey)
  }, [])

  // Handle row context menu
  const handleRowRightClick = useCallback((e: React.MouseEvent, projectId: string) => {
    e.preventDefault()
    // Add to selection if not already selected
    if (!selectedRows.has(projectId)) {
      setSelectedRows(new Set([projectId]))
    }
    // Show context menu - could be implemented with a custom context menu component
    console.log('Right click on row:', projectId)
  }, [selectedRows])

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<Plus className="h-8 w-8 text-muted-foreground" />}
        title="No projects found"
        description="Get started by creating your first RFP project to see it in the powerful spreadsheet view"
        action={
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Link>
          </Button>
        }
      />
    )
  }

  if (sortedAndFilteredProjects.length === 0 && projects.length > 0) {
    return (
      <EmptyState
        icon={<Filter className="h-8 w-8 text-muted-foreground" />}
        title="No projects match your filters"
        description="Try adjusting your search terms or filters to see more projects"
        action={
          <Button 
            onClick={() => {
              setColumnFilters({})
              setCurrentPage(1)
            }}
            variant="outline"
          >
            Clear All Filters
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              {selectedRows.size > 0 ? (
                <>
                  <strong>{selectedRows.size}</strong> of <strong>{sortedAndFilteredProjects.length}</strong> selected
                </>
              ) : (
                <>
                  Showing <strong>{sortedAndFilteredProjects.length}</strong> projects
                </>
              )}
            </span>
          </div>
          {selectedRows.size > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleBulkExport}>
                <Download className="mr-2 h-4 w-4" />
                Export Selected
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Export all button when no selection */}
          {selectedRows.size === 0 && (
            <Button variant="outline" size="sm" onClick={handleBulkExport}>
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          )}
          
          {/* Column visibility toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Columns ({visibleColumns.length - 2})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
              <div className="p-2 border-b text-xs text-muted-foreground font-medium">
                Toggle column visibility
              </div>
              {columns.filter(col => col.key !== 'select' && col.key !== 'actions').map((column) => (
                <DropdownMenuItem
                  key={column.key}
                  onClick={() => toggleColumnVisibility(column.key)}
                  className="flex items-center gap-2 py-2"
                >
                  <Checkbox
                    checked={column.visible}
                    onCheckedChange={() => toggleColumnVisibility(column.key)}
                  />
                  <span className="flex-1">{column.label}</span>
                  {!column.visible && <span className="text-xs text-muted-foreground">Hidden</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Page size selector */}
          <Select value={pageSize.toString()} onValueChange={(value) => {
            setPageSize(parseInt(value))
            setCurrentPage(1)
          }}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25 rows</SelectItem>
              <SelectItem value="50">50 rows</SelectItem>
              <SelectItem value="100">100 rows</SelectItem>
              <SelectItem value="250">250 rows</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="border rounded-lg overflow-hidden bg-background">
        <div className="overflow-x-auto" ref={tableRef} style={{ maxHeight: '70vh' }}>
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-muted/80 backdrop-blur-sm border-b-2">
                {visibleColumns.map((column) => (
                  <TableHead 
                    key={column.key} 
                    className="relative border-r last:border-r-0 select-none bg-muted/80 backdrop-blur-sm"
                    style={{ width: column.width, minWidth: column.width }}
                  >
                    <div className="flex items-center justify-between pr-2">
                      {column.key === 'select' ? (
                        <Checkbox
                          checked={currentPageProjects.length > 0 && currentPageProjects.every(p => selectedRows.has(p.id))}
                          onCheckedChange={handleSelectAll}
                        />
                      ) : (
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-medium text-xs truncate">{column.label}</span>
                          {column.sortable && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-auto hover:bg-muted/20"
                              onClick={() => handleSort(column.key as string)}
                            >
                              {sortColumn === column.key ? (
                                sortDirection === 'asc' ? (
                                  <ArrowUp className="h-3 w-3 text-primary" />
                                ) : sortDirection === 'desc' ? (
                                  <ArrowDown className="h-3 w-3 text-primary" />
                                ) : (
                                  <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                )
                              ) : (
                                <ArrowUpDown className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Resize handle */}
                    {column.key !== 'actions' && (
                      <div 
                        className="absolute right-0 top-0 w-2 h-full cursor-col-resize hover:bg-primary/20 active:bg-primary/40 transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, column.key as string)}
                      />
                    )}

                    {/* Column filter */}
                    {column.filterable && (
                      <div className="mt-2 px-1">
                        <Input
                          placeholder={`Filter...`}
                          value={columnFilters[column.key] || ''}
                          onChange={(e) => setColumnFilters(prev => ({
                            ...prev,
                            [column.key]: e.target.value
                          }))}
                          className="h-6 text-xs border-muted-foreground/20 bg-background/50"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {currentPageProjects.map((project) => (
                <TableRow 
                  key={project.id}
                  className={cn(
                    "hover:bg-muted/30 transition-colors cursor-pointer",
                    selectedRows.has(project.id) && "bg-muted/50"
                  )}
                  onContextMenu={(e) => handleRowRightClick(e, project.id)}
                  onClick={(e) => {
                    // Handle row selection with Ctrl/Cmd click
                    if (e.ctrlKey || e.metaKey) {
                      handleSelectRow(project.id, !selectedRows.has(project.id))
                    } else if (e.shiftKey) {
                      // Handle range selection - simplified implementation
                      const projectIds = currentPageProjects.map(p => p.id)
                      const currentIndex = projectIds.indexOf(project.id)
                      const selectedArray = Array.from(selectedRows)
                      const lastSelectedIndex = selectedArray.length > 0 ? 
                        projectIds.indexOf(selectedArray[selectedArray.length - 1]) : currentIndex
                      
                      if (lastSelectedIndex !== -1) {
                        const start = Math.min(currentIndex, lastSelectedIndex)
                        const end = Math.max(currentIndex, lastSelectedIndex)
                        const rangeIds = projectIds.slice(start, end + 1)
                        setSelectedRows(new Set([...selectedRows, ...rangeIds]))
                      }
                    } else {
                      // Single selection
                      setSelectedRows(new Set([project.id]))
                    }
                  }}
                >
                  {visibleColumns.map((column) => (
                    <TableCell 
                      key={`${project.id}-${column.key}`}
                      className="border-r last:border-r-0 py-2 px-3"
                      style={{ width: column.width, minWidth: column.width }}
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        handleCellDoubleClick(project.id, column.key as string)
                      }}
                    >
                      {renderCellContent(project, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, sortedAndFilteredProjects.length)} of {sortedAndFilteredProjects.length} projects
          </div>
          
          {/* Keyboard shortcuts hint */}
          <div className="text-xs text-muted-foreground border-l pl-4">
            <strong>Tips:</strong> Ctrl+A (select all), Double-click (edit), Ctrl+Click (multi-select), Shift+Click (range select)
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm px-3 py-1 bg-muted rounded">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
