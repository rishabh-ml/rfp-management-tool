'use client'

import { useDroppable } from '@dnd-kit/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { KanbanColumn as KanbanColumnType } from '@/lib/types'
import { KanbanCard } from './kanban-card'

interface KanbanColumnProps {
  column: KanbanColumnType
}

export function KanbanColumn({ column }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <Card className={cn(
      'h-fit transition-colors',
      isOver && 'ring-2 ring-primary ring-offset-2'
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            {column.title}
          </div>
          <Badge variant="secondary" className="text-xs">
            {column.projects.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div
          ref={setNodeRef}
          className={cn(
            'space-y-3 min-h-[200px] transition-colors rounded-lg p-2',
            isOver && 'bg-muted/50'
          )}
        >
          {column.projects.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              No projects in this stage
            </div>
          ) : (
            column.projects.map((project) => (
              <KanbanCard key={project.id} project={project} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
