'use client'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
  label?: string
}

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4'
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = true,
  size = 'md',
  color,
  className,
  label
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  return (
    <div className={cn('space-y-2', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {label || 'Progress'}
          </span>
          <span className="font-medium">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <Progress
        value={percentage}
        className={cn(sizeClasses[size])}
        style={color ? { '--progress-background': color } as any : undefined}
      />
    </div>
  )
}

export function CircularProgress({
  value,
  max = 100,
  size = 40,
  strokeWidth = 4,
  color = '#3B82F6',
  className
}: {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: string
  className?: string
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}
