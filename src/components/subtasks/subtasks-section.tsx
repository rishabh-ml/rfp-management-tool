'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { UserAvatar } from '@/components/ui/user-avatar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { DatePicker } from '@/components/ui/date-picker'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { formatDate, isOverdue, getUserDisplayName } from '@/lib/utils'
import type { SubtaskWithUser, User } from '@/lib/types'
import { CheckSquare, Plus, Calendar, User as UserIcon, Clock } from 'lucide-react'
import { toast } from 'sonner'

const subtaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title is too long'),
  description: z.string().optional(),
  due_date: z.date().optional()
})

type SubtaskFormData = z.infer<typeof subtaskSchema>

interface SubtasksSectionProps {
  projectId: string
  subtasks: SubtaskWithUser[]
  currentUser: User | null
  onSubtaskAdded?: (subtask: SubtaskWithUser) => void
  onSubtaskToggled?: (subtaskId: string, completed: boolean) => void
}

export function SubtasksSection({ 
  projectId, 
  subtasks: initialSubtasks, 
  currentUser,
  onSubtaskAdded,
  onSubtaskToggled
}: SubtasksSectionProps) {
  const [subtasks, setSubtasks] = useState(initialSubtasks)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<SubtaskFormData>({
    resolver: zodResolver(subtaskSchema)
  })

  const onSubmit = async (data: SubtaskFormData) => {
    if (!currentUser) {
      toast.error('You must be logged in to create subtasks')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/subtasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          title: data.title,
          description: data.description,
          due_date: data.due_date?.toISOString(),
          created_by: currentUser.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create subtask')
      }

      const newSubtask = await response.json()
      
      // Add the new subtask to the list
      const subtaskWithUser: SubtaskWithUser = {
        ...newSubtask,
        creator: currentUser,
        assignee: null
      }
      
      setSubtasks(prev => [...prev, subtaskWithUser])
      onSubtaskAdded?.(subtaskWithUser)
      setIsCreateDialogOpen(false)
      reset()
      toast.success('Subtask created successfully!')
    } catch (error) {
      console.error('Error creating subtask:', error)
      toast.error('Failed to create subtask')
    } finally {
      setIsSubmitting(false)
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
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subtask
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Subtask</DialogTitle>
                  <DialogDescription>
                    Break down the project into smaller, manageable tasks
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      {...register('title')}
                      placeholder="Enter subtask title"
                      disabled={isSubmitting}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      placeholder="Enter subtask description"
                      rows={3}
                      disabled={isSubmitting}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <DatePicker
                      date={watch('due_date')}
                      onDateChange={(date) => setValue('due_date', date)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
                      Create Subtask
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
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
