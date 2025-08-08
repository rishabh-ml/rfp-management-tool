'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { cn, getContrastColor } from '@/lib/utils'
import type { Tag as TagType } from '@/lib/types'

interface TagProps {
  tag: TagType
  className?: string
  variant?: 'default' | 'outline' | 'removable'
  onRemove?: () => void
  size?: 'sm' | 'md'
}

export function Tag({ 
  tag, 
  className,
  variant = 'default',
  onRemove,
  size = 'md'
}: TagProps) {
  const textColor = getContrastColor(tag.color)
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5'
  }

  if (variant === 'removable') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-medium',
          sizeClasses[size],
          className
        )}
        style={{
          backgroundColor: tag.color,
          color: textColor
        }}
      >
        <span>{tag.name}</span>
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-black/10"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove tag</span>
          </Button>
        )}
      </div>
    )
  }

  return (
    <Badge
      variant={variant}
      className={cn(
        'font-medium',
        sizeClasses[size],
        variant === 'default' && 'border-0',
        className
      )}
      style={{
        backgroundColor: variant === 'default' ? tag.color : undefined,
        color: variant === 'default' ? textColor : tag.color,
        borderColor: variant === 'outline' ? tag.color : undefined
      }}
    >
      {tag.name}
    </Badge>
  )
}
