'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/ui/user-avatar'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { Tag } from '@/components/ui/tag'
import { ProgressBar } from '@/components/ui/progress-bar'
import { cn, formatDate, isOverdue, getUserDisplayName } from '@/lib/utils'
import type { ProjectWithDetails } from '@/lib/types'
import { Calendar, MessageSquare, CheckSquare, GripVertical } from 'lucide-react'
import Link from 'next/link'

interface KanbanCardProps {
  project: ProjectWithDetails
}

export function KanbanCard({ project }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: project.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'cursor-pointer hover:shadow-md transition-all',
        isDragging && 'opacity-50 rotate-3 shadow-lg'
      )}
      {...attributes}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link 
              href={`/dashboard/projects/${project.id}`}
              className="font-medium text-sm hover:underline line-clamp-2 block"
            >
              {project.title}
            </Link>
          </div>
          <div 
            className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <PriorityBadge priority={project.priority} variant="outline" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Description */}
        {project.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 2).map((tag) => (
              <Tag key={tag.id} tag={tag} size="sm" />
            ))}
            {project.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{project.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Progress for assigned projects */}
        {project.stage === 'assigned' && project.progress_percentage > 0 && (
          <ProgressBar
            value={project.progress_percentage}
            showLabel={false}
            size="sm"
          />
        )}

        {/* Project Info */}
        <div className="space-y-2">
          {/* Owner */}
          {project.owner && (
            <div className="flex items-center gap-2">
              <UserAvatar user={project.owner} size="sm" />
              <span className="text-xs text-muted-foreground truncate">
                {getUserDisplayName(project.owner)}
              </span>
            </div>
          )}

          {/* Due Date */}
          {project.due_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className={cn(
                'text-xs',
                isOverdue(project.due_date) ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {formatDate(project.due_date)}
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{project._count?.comments || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                <span>{project._count?.completed_subtasks || 0}/{project._count?.subtasks || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
