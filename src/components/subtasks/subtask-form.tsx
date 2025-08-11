'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { DatePicker } from '@/components/ui/date-picker'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Badge } from '@/components/ui/badge'
import { Plus, Save, User, Calendar, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { User as UserType, Subtask } from '@/lib/types'

const subtaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title is too long'),
  description: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
  due_date: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  estimated_hours: z.number().min(0.5).max(100).optional()
})

type SubtaskFormData = z.infer<typeof subtaskSchema>

interface SubtaskFormProps {
  projectId: string
  users?: UserType[]
  onSubtaskCreated?: (subtask: Subtask) => void
  initialData?: Partial<SubtaskFormData>
  isEditing?: boolean
  subtaskId?: string
}

export function SubtaskForm({ 
  projectId, 
  users = [], 
  onSubtaskCreated, 
  initialData,
  isEditing = false,
  subtaskId
}: SubtaskFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<SubtaskFormData>({
    resolver: zodResolver(subtaskSchema),
    defaultValues: {
      priority: 'medium',
      ...initialData
    }
  })

  const selectedAssignee = watch('assigned_to')
  const selectedPriority = watch('priority')
  const selectedDueDate = watch('due_date')

  const onSubmit = async (data: SubtaskFormData) => {
    setIsSubmitting(true)
    try {
      const url = isEditing ? `/api/projects/${projectId}/subtasks/${subtaskId}` : `/api/projects/${projectId}/subtasks`
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          due_date: data.due_date?.toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} subtask`)
      }

      const result = await response.json()
      
      toast.success(`Subtask ${isEditing ? 'updated' : 'created'} successfully!`)
      onSubtaskCreated?.(result.subtask)
      setIsOpen(false)
      reset()
    } catch (error) {
      console.error('Error saving subtask:', error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} subtask`)
    } finally {
      setIsSubmitting(false)
    }
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

  const assignedUser = users.find(user => user.id === selectedAssignee)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {isEditing ? 'Edit Subtask' : 'Add Subtask'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Subtask' : 'Create New Subtask'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the subtask details' : 'Add a new subtask to break down the project work'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe what needs to be done..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Assignment and Priority */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select
                value={selectedAssignee || 'unassigned'}
                onValueChange={(value) => setValue('assigned_to', value === 'unassigned' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <UserAvatar user={user} size="sm" />
                        <span>{user.first_name} {user.last_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {assignedUser && (
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <UserAvatar user={assignedUser} size="sm" />
                  <div>
                    <div className="text-sm font-medium">
                      {assignedUser.first_name} {assignedUser.last_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {assignedUser.email}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select 
                value={selectedPriority} 
                onValueChange={(value) => setValue('priority', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      Low Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Medium Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      High Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Urgent
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date and Estimated Hours */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <DatePicker
                date={selectedDueDate}
                onDateChange={(date) => setValue('due_date', date)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_hours">Estimated Hours</Label>
              <Input
                id="estimated_hours"
                type="number"
                step="0.5"
                min="0.5"
                max="100"
                {...register('estimated_hours', { valueAsNumber: true })}
                placeholder="e.g., 4.5"
                disabled={isSubmitting}
              />
              {errors.estimated_hours && (
                <p className="text-sm text-destructive">{errors.estimated_hours.message}</p>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="text-sm font-medium">Preview</div>
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(selectedPriority)}>
                {selectedPriority}
              </Badge>
              {assignedUser && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="text-xs">{assignedUser.first_name}</span>
                </div>
              )}
              {selectedDueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className="text-xs">{selectedDueDate.toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? 'Update' : 'Create'} Subtask
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
