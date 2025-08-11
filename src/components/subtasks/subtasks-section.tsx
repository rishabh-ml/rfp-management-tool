'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { UserAvatar } from '@/components/ui/user-avatar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Badge } from '@/components/ui/badge'
import { SubtaskForm } from './subtask-form'
import { formatDate, isOverdue, getUserDisplayName } from '@/lib/utils'
import type { SubtaskWithUser, User } from '@/lib/types'
import { CheckSquare, Calendar, User as UserIcon, Clock, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface SubtasksSectionProps {
  projectId: string
  subtasks: SubtaskWithUser[]
  currentUser: User | null
  users?: User[]
  onSubtaskAdded?: (subtask: SubtaskWithUser) => void
  onSubtaskToggled?: (subtaskId: string, completed: boolean) => void
}

export function SubtasksSection({
  projectId,
  subtasks: initialSubtasks,
  currentUser,
  users = [],
  onSubtaskAdded,
  onSubtaskToggled
}: SubtasksSectionProps) {
  const [subtasks, setSubtasks] = useState(initialSubtasks)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setSubtasks(initialSubtasks)
  }, [initialSubtasks])

  const handleSubtaskCreated = (newSubtask: SubtaskWithUser) => {
    setSubtasks(prev => [newSubtask, ...prev])
    onSubtaskAdded?.(newSubtask)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/subtasks/${subtaskId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed })
      })

      if (!response.ok) {
        throw new Error('Failed to update subtask')
      }

      // Update local state
      setSubtasks(prev => prev.map(subtask => 
        subtask.id === subtaskId 
          ? { ...subtask, completed }
          : subtask
      ))
      
      onSubtaskToggled?.(subtaskId, completed)
      toast.success(completed ? 'Subtask completed!' : 'Subtask reopened')
    } catch (error) {
      console.error('Error toggling subtask:', error)
      toast.error('Failed to update subtask')
    }
  }

  const completedCount = subtasks.filter(st => st.completed).length
  const totalCount = subtasks.length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Subtasks ({completedCount}/{totalCount})
          </CardTitle>
          {currentUser && (
            <SubtaskForm
              projectId={projectId}
              users={users}
              onSubtaskCreated={handleSubtaskCreated}
            />
          )}

        </div>
      </CardHeader>
      <CardContent>
        {subtasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No subtasks yet.</p>
            {currentUser && (
              <p className="text-sm text-muted-foreground mt-1">
                Break down this project into smaller tasks!
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <Checkbox
                  checked={subtask.completed}
                  onCheckedChange={(checked) => 
                    handleToggleSubtask(subtask.id, checked as boolean)
                  }
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {subtask.title}
                    </span>
                    {subtask.completed && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                  {subtask.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {subtask.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {subtask.assignee && (
                      <div className="flex items-center gap-1">
                        <UserIcon className="h-3 w-3" />
                        <UserAvatar user={subtask.assignee} size="sm" />
                        <span>{getUserDisplayName(subtask.assignee)}</span>
                      </div>
                    )}
                    {subtask.due_date && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className={isOverdue(subtask.due_date) && !subtask.completed ? 'text-destructive' : ''}>
                          Due {formatDate(subtask.due_date)}
                        </span>
                      </div>
                    )}
                    {subtask.creator && (
                      <div className="flex items-center gap-1">
                        <span>Created by {getUserDisplayName(subtask.creator)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
