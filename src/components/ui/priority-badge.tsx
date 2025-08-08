'use client'

import { Badge } from '@/components/ui/badge'
import { cn, getProjectPriorityColor } from '@/lib/utils'
import { PROJECT_PRIORITIES } from '@/lib/constants'
import type { ProjectPriority } from '@/lib/types'

interface PriorityBadgeProps {
  priority: ProjectPriority
  className?: string
  variant?: 'default' | 'outline' | 'secondary'
}

export function PriorityBadge({ 
  priority, 
  className,
  variant = 'default' 
}: PriorityBadgeProps) {
  const priorityConfig = PROJECT_PRIORITIES[priority]
  const color = getProjectPriorityColor(priority)
  
  return (
    <Badge
      variant={variant}
      className={cn(
        'text-xs font-medium',
        variant === 'default' && 'text-white',
        className
      )}
      style={{
        backgroundColor: variant === 'default' ? color : undefined,
        borderColor: variant === 'outline' ? color : undefined,
        color: variant === 'outline' ? color : undefined
      }}
    >
      {priorityConfig.label}
    </Badge>
  )
}
