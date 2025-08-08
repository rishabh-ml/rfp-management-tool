'use client'

import { Badge } from '@/components/ui/badge'
import { cn, getProjectStageColor } from '@/lib/utils'
import { PROJECT_STAGES } from '@/lib/constants'
import type { ProjectStage } from '@/lib/types'

interface StageBadgeProps {
  stage: ProjectStage
  className?: string
  variant?: 'default' | 'outline' | 'secondary'
}

export function StageBadge({ 
  stage, 
  className,
  variant = 'default' 
}: StageBadgeProps) {
  const stageConfig = PROJECT_STAGES[stage]
  const color = getProjectStageColor(stage)
  
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
      {stageConfig.label}
    </Badge>
  )
}
