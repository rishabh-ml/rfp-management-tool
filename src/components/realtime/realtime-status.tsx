'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Wifi, WifiOff, Users, Activity, RefreshCw } from 'lucide-react'
import { useRealtimePresence, useRealtimeActivityLog } from '@/lib/hooks/use-realtime'
import { formatRelativeDate } from '@/lib/utils'

interface RealtimeStatusProps {
  channelName?: string
  showPresence?: boolean
  showActivity?: boolean
}

export function RealtimeStatus({ 
  channelName = 'global', 
  showPresence = true,
  showActivity = true 
}: RealtimeStatusProps) {
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const { presenceState, isConnected: presenceConnected } = useRealtimePresence(channelName)
  const { isConnected: activityConnected } = useRealtimeActivityLog((payload) => {
    if (showActivity) {
      setRecentActivity(prev => [payload.new, ...prev.slice(0, 9)]) // Keep last 10 activities
    }
  })

  const isConnected = presenceConnected || activityConnected
  const onlineUsers = Object.keys(presenceState).length

  const getConnectionStatus = () => {
    if (isConnected) {
      return {
        icon: <Wifi className="h-3 w-3" />,
        text: 'Connected',
        variant: 'default' as const,
        color: 'text-green-600'
      }
    } else {
      return {
        icon: <WifiOff className="h-3 w-3" />,
        text: 'Disconnected',
        variant: 'destructive' as const,
        color: 'text-red-600'
      }
    }
  }

  const status = getConnectionStatus()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          {status.icon}
          <span className={`text-xs ${status.color}`}>
            {status.text}
          </span>
          {showPresence && onlineUsers > 0 && (
            <Badge variant="secondary" className="text-xs">
              {onlineUsers}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Real-time Status</span>
          <div className="flex items-center gap-2">
            {status.icon}
            <span className={`text-xs ${status.color}`}>
              {status.text}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Connection Info */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Connection Status:</span>
            <Badge variant={status.variant} className="text-xs">
              {status.text}
            </Badge>
          </div>
          
          {showPresence && (
            <div className="flex items-center justify-between text-sm">
              <span>Online Users:</span>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{onlineUsers}</span>
              </div>
            </div>
          )}
        </div>

        {/* Online Users */}
        {showPresence && onlineUsers > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Online Now</DropdownMenuLabel>
            <div className="max-h-32 overflow-y-auto">
              {Object.entries(presenceState).map(([key, presences]: [string, any]) => (
                <DropdownMenuItem key={key} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">User {key.slice(0, 8)}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formatRelativeDate(presences[0]?.online_at)}
                  </span>
                </DropdownMenuItem>
              ))}
            </div>
          </>
        )}

        {/* Recent Activity */}
        {showActivity && recentActivity.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Activity
            </DropdownMenuLabel>
            <div className="max-h-40 overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <DropdownMenuItem key={index} className="flex flex-col items-start gap-1 p-3">
                  <div className="flex items-center gap-2 w-full">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">
                      {activity.action?.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatRelativeDate(activity.created_at)}
                    </span>
                  </div>
                  {activity.entity_type && (
                    <span className="text-xs text-muted-foreground ml-4">
                      {activity.entity_type}: {activity.entity_id?.slice(0, 8)}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          </>
        )}

        {/* Actions */}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Connection
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
