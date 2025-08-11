'use client'

import { useState, useEffect } from 'react'
import { useRealtimeComments, useRealtimeSubtasks, useRealtimeProjects } from '@/lib/hooks/use-realtime'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff } from 'lucide-react'
import { toast } from 'sonner'
import type { ProjectWithDetails, Comment, SubtaskWithUser } from '@/lib/types'

interface RealtimeProjectDetailProps {
  projectId: string
  initialProject: ProjectWithDetails
  initialComments: Comment[]
  initialSubtasks: SubtaskWithUser[]
  children: (data: {
    project: ProjectWithDetails
    comments: Comment[]
    subtasks: SubtaskWithUser[]
    isConnected: boolean
  }) => React.ReactNode
}

export function RealtimeProjectDetail({
  projectId,
  initialProject,
  initialComments,
  initialSubtasks,
  children
}: RealtimeProjectDetailProps) {
  const [project, setProject] = useState(initialProject)
  const [comments, setComments] = useState(initialComments)
  const [subtasks, setSubtasks] = useState(initialSubtasks)

  // Set up real-time subscriptions
  const { isConnected: projectConnected } = useRealtimeProjects((payload) => {
    if (payload.new?.id === projectId) {
      setProject(prev => ({ ...prev, ...payload.new }))
      
      if (payload.eventType === 'UPDATE') {
        toast.success('Project updated in real-time', {
          description: 'The project has been updated by another user'
        })
      }
    }
  })

  const { isConnected: commentsConnected } = useRealtimeComments(projectId, (payload) => {
    switch (payload.eventType) {
      case 'INSERT':
        setComments(prev => [payload.new, ...prev])
        toast.success('New comment added', {
          description: 'A new comment was added to this project'
        })
        break
      case 'UPDATE':
        setComments(prev => 
          prev.map(comment => 
            comment.id === payload.new.id ? { ...comment, ...payload.new } : comment
          )
        )
        break
      case 'DELETE':
        setComments(prev => prev.filter(comment => comment.id !== payload.old.id))
        toast.info('Comment deleted', {
          description: 'A comment was removed from this project'
        })
        break
    }
  })

  const { isConnected: subtasksConnected } = useRealtimeSubtasks(projectId, (payload) => {
    switch (payload.eventType) {
      case 'INSERT':
        setSubtasks(prev => [payload.new, ...prev])
        toast.success('New subtask added', {
          description: 'A new subtask was added to this project'
        })
        break
      case 'UPDATE':
        setSubtasks(prev => 
          prev.map(subtask => 
            subtask.id === payload.new.id ? { ...subtask, ...payload.new } : subtask
          )
        )
        if (payload.new.completed !== payload.old.completed) {
          toast.success(
            payload.new.completed ? 'Subtask completed' : 'Subtask reopened',
            {
              description: `"${payload.new.title}" was ${payload.new.completed ? 'completed' : 'reopened'}`
            }
          )
        }
        break
      case 'DELETE':
        setSubtasks(prev => prev.filter(subtask => subtask.id !== payload.old.id))
        toast.info('Subtask deleted', {
          description: 'A subtask was removed from this project'
        })
        break
    }
  })

  const isConnected = projectConnected || commentsConnected || subtasksConnected

  // Update initial data when props change
  useEffect(() => {
    setProject(initialProject)
  }, [initialProject])

  useEffect(() => {
    setComments(initialComments)
  }, [initialComments])

  useEffect(() => {
    setSubtasks(initialSubtasks)
  }, [initialSubtasks])

  return (
    <div className="space-y-4">
      {/* Real-time Status Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"} className="gap-1">
            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isConnected ? 'Live Updates' : 'Offline'}
          </Badge>
          {isConnected && (
            <span className="text-xs text-muted-foreground">
              Real-time updates enabled
            </span>
          )}
        </div>
      </div>

      {/* Render children with real-time data */}
      {children({
        project,
        comments,
        subtasks,
        isConnected
      })}
    </div>
  )
}
