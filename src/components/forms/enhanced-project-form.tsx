'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { DatePicker } from '@/components/ui/date-picker'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { 
  FolderOpen, 
  Calendar, 
  User, 
  DollarSign, 
  Clock, 
  FileText,
  Link as LinkIcon,
  Tag as TagIcon,
  Plus,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import type { 
  User as UserType, 
  Tag, 
  CustomAttribute, 
  ProjectStage 
} from '@/lib/types'

const projectSchema = z.object({
  // Basic Project Information (title will be set to rfp_title)
  title: z.string().min(1).max(200), // Hidden field, auto-populated from rfp_title
  description: z.string().optional(),
  due_date: z.date().optional(),
  
  // RFP Details
  rfp_added_date: z.date(),
  rfp_title: z.string().min(1, 'RFP title is required').max(500),
  client_name: z.string().min(1, 'Client name is required').max(200),
  state: z.string().min(1, 'State is required').max(100),
  portal_url: z.string().url('Invalid portal URL').optional().or(z.literal('')),
  folder_url: z.string().url('Invalid folder URL').optional().or(z.literal('')),
  
  // Project Management (removed from UI but kept for API compatibility)
  owner_id: z.string().optional(),
  assigned_to: z.string().optional(),
  company_assignment: z.string().optional(),
  
  // Post-Review fields (all optional)
  priority_banding: z.enum(['P1', 'P2', 'P3']).optional(),
  review_comment: z.string().max(1000, 'Review comment cannot exceed 1000 characters').optional(),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface EnhancedProjectFormProps {
  users?: UserType[]
  tags?: Tag[]
  customAttributes?: CustomAttribute[]
  initialData?: Partial<ProjectFormData & { id?: string }>
  onSubmit?: (data: ProjectFormData) => void
  isEditing?: boolean
  currentStage?: ProjectStage
}

export function EnhancedProjectForm({ 
  users = [], 
  tags = [], 
  customAttributes = [],
  initialData,
  onSubmit,
  isEditing = false,
  currentStage = 'unassigned'
}: EnhancedProjectFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReviewFields, setShowReviewFields] = useState(currentStage === 'reviewed')

  // Watch for stage changes to show/hide review fields
  useEffect(() => {
    setShowReviewFields(currentStage === 'reviewed')
  }, [currentStage])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      rfp_added_date: initialData?.rfp_added_date ? new Date(initialData.rfp_added_date) : new Date(),
      ...initialData
    }
  })

  const watchedFields = watch()

  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        if (key === 'rfp_added_date' || key === 'due_date') {
          setValue(key as keyof ProjectFormData, value ? new Date(value as string) : undefined)
        } else {
          setValue(key as keyof ProjectFormData, value)
        }
      })
    }
  }, [initialData, setValue])

  const handleFormSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true)
    try {
      // Format dates for submission and set title from rfp_title
      const formattedData = {
        ...data,
        title: data.rfp_title, // Set title to rfp_title
        rfp_added_date: data.rfp_added_date?.toISOString(),
        due_date: data.due_date?.toISOString(),
      }

      if (onSubmit) {
        await onSubmit(formattedData as any)
      } else {
        // Default API submission
        const url = isEditing 
          ? `/api/projects/${initialData?.id}` 
          : '/api/projects'
        const method = isEditing ? 'PUT' : 'POST'

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData)
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || `Failed to ${isEditing ? 'update' : 'create'} project`)
        }

        toast.success(`Project ${isEditing ? 'updated' : 'created'} successfully!`)
        router.push('/dashboard/projects')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic RFP Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            RFP Information
          </CardTitle>
          <CardDescription>
            Essential RFP details and client information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rfp_title">RFP Title *</Label>
              <Input
                id="rfp_title"
                {...register('rfp_title')}
                placeholder="Enter RFP title"
                className={errors.rfp_title ? 'border-red-500' : ''}
              />
              {errors.rfp_title && (
                <p className="text-sm text-red-500">{errors.rfp_title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_name">Client Name *</Label>
              <Input
                id="client_name"
                {...register('client_name')}
                placeholder="Enter client name"
                className={errors.client_name ? 'border-red-500' : ''}
              />
              {errors.client_name && (
                <p className="text-sm text-red-500">{errors.client_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                {...register('state')}
                placeholder="Enter project state"
                className={errors.state ? 'border-red-500' : ''}
              />
              {errors.state && (
                <p className="text-sm text-red-500">{errors.state.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rfp_added_date">RFP Added Date</Label>
              <Input
                id="rfp_added_date"
                value={watch('rfp_added_date')?.toLocaleDateString() || ''}
                disabled
                className="bg-muted"
                placeholder="Auto-set date"
              />
              <p className="text-xs text-muted-foreground">This date is automatically set and cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <DatePicker
                date={watch('due_date')}
                onDateChange={(date: Date | undefined) => setValue('due_date', date)}
                placeholder="Select due date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter detailed project description (no character limit)"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* URLs and Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Links & Resources
          </CardTitle>
          <CardDescription>
            URLs and external resources related to this RFP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="portal_url">Portal URL</Label>
              <Input
                id="portal_url"
                {...register('portal_url')}
                placeholder="URL from where RFP is fetched"
                className={errors.portal_url ? 'border-red-500' : ''}
              />
              {errors.portal_url && (
                <p className="text-sm text-red-500">{errors.portal_url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="folder_url">Folder URL</Label>
              <Input
                id="folder_url"
                {...register('folder_url')}
                placeholder="SharePoint folder URL"
                className={errors.folder_url ? 'border-red-500' : ''}
              />
              {errors.folder_url && (
                <p className="text-sm text-red-500">{errors.folder_url.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Post-Review Fields - Only show when stage is 'reviewed' or manually enabled */}
      {(currentStage === 'reviewed' || showReviewFields) && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-700">
                <User className="h-5 w-5" />
                Post-Review Information
              </div>
              {currentStage !== 'reviewed' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReviewFields(!showReviewFields)}
                >
                  {showReviewFields ? 'Hide' : 'Show'} Review Fields
                </Button>
              )}
            </CardTitle>
            <CardDescription className="text-blue-600">
              Additional fields required after project review (stage: reviewed)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="priority_banding">Priority Banding *</Label>
                <Select value={watch('priority_banding')} onValueChange={(value) => setValue('priority_banding', value as 'P1' | 'P2' | 'P3' | undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority banding" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P1">P1</SelectItem>
                    <SelectItem value="P2">P2</SelectItem>
                    <SelectItem value="P3">P3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assigned To</Label>
                <Select value={watch('assigned_to')} onValueChange={(value) => setValue('assigned_to', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="company_assignment">Company Assignment</Label>
                <Select value={watch('company_assignment')} onValueChange={(value) => setValue('company_assignment', value as 'DatamanHealth' | 'DatamanUSA' | 'CCSI' | undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DatamanHealth">DatamanHealth</SelectItem>
                    <SelectItem value="DatamanUSA">DatamanUSA</SelectItem>
                    <SelectItem value="CCSI">CCSI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review_comment">Review Comment</Label>
              <Textarea
                id="review_comment"
                {...register('review_comment')}
                placeholder="Enter review comment (max 1000 characters)"
                rows={3}
                maxLength={1000}
                className={errors.review_comment ? 'border-red-500' : ''}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>
                  {errors.review_comment && (
                    <span className="text-red-500">{errors.review_comment.message}</span>
                  )}
                </span>
                <span>{watch('review_comment')?.length || 0}/1000</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <LoadingSpinner className="h-4 w-4" />
          ) : (
            isEditing ? 'Update Project' : 'Create Project'
          )}
        </Button>
      </div>
    </form>
  )
}
