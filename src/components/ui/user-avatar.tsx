'use client'

import { cn, getUserDisplayName, getUserInitials } from '@/lib/utils'
import type { User } from '@/lib/types'
import Image from 'next/image'

interface UserAvatarProps {
  user: User | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showTooltip?: boolean
}

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
  xl: 'h-12 w-12 text-lg'
}

export function UserAvatar({ 
  user, 
  size = 'md', 
  className,
  showTooltip = false 
}: UserAvatarProps) {
  const displayName = getUserDisplayName(user)
  const initials = getUserInitials(user)
  
  const avatarElement = (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground',
        sizeClasses[size],
        className
      )}
      title={showTooltip ? displayName : undefined}
    >
      {user?.avatar_url ? (
        <Image
          src={user.avatar_url}
          alt={displayName}
          fill
          className="rounded-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )

  return avatarElement
}
