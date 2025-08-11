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
import type { User as UserType, Tag, CustomAttribute } from '@/lib/types'

const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title is too long'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  due_date: z.date().optional(),
  owner_id: z.string().optional(),
  estimated_hours: z.number().min(1).optional(),
  budget_amount: z.number().min(0).optional(),
  client_name: z.string().optional(),
  client_email: z.string().email().optional().or(z.literal('')),
  rfp_document_url: z.string().url().optional().or(z.literal('')),
  submission_url: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  custom_attributes: z.record(z.any()).optional()
})

type ProjectFormData = z.infer<typeof projectSchema>

interface EnhancedProjectFormProps {
  users?: UserType[]
  tags?: Tag[]
  customAttributes?: CustomAttribute[]
  initialData?: Partial<ProjectFormData>
  onSubmit?: (data: ProjectFormData) => void
  isEditing?: boolean
}

export function EnhancedProjectForm({ 
  users = [], 
  tags = [], 
  customAttributes = [],
  initialData,
  onSubmit,
  isEditing = false
}: EnhancedProjectFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || [])
  const [showAdvanced, setShowAdvanced] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      priority: 'medium',
      ...initialData
    }
  })

  const watchedFields = watch()

  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        setValue(key as keyof ProjectFormData, value)
      })
      setSelectedTags(initialData.tags || [])
    }
  }, [initialData, setValue])

  const handleFormSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true)
    try {
      const formData = {
        ...data,
        tags: selectedTags,
        client_email: data.client_email || undefined,
        rfp_document_url: data.rfp_document_url || undefined,
        submission_url: data.submission_url || undefined
      }

      if (onSubmit) {
        await onSubmit(formData)
      } else {
        const response = await fetch('/api/projects', {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        })

        if (!response.ok) {
          throw new Error('Failed to save project')
        }

        const project = await response.json()
        toast.success(`Project ${isEditing ? 'updated' : 'created'} successfully!`)
        router.push(`/dashboard/projects/${project.id}`)
      }
    } catch (error) {
      console.error('Error saving project:', error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} project`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
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

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Essential project details and requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter project title"
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe the project requirements and scope"
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select 
                value={watchedFields.priority} 
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

            <div className="space-y-2">
              <Label>Due Date</Label>
              <DatePicker
                date={watchedFields.due_date}
                onDateChange={(date) => setValue('due_date', date)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_id">Project Owner</Label>
              <Select
                value={watchedFields.owner_id || 'unassigned'}
                onValueChange={(value) => setValue('owner_id', value === 'unassigned' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {user.first_name} {user.last_name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      {tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TagIcon className="h-5 w-5" />
              Tags
            </CardTitle>
            <CardDescription>
              Categorize your project with relevant tags
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag.id)}
                  style={{
                    backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
                    borderColor: tag.color,
                    color: selectedTags.includes(tag.id) ? 'white' : tag.color
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Settings Toggle */}
      <div className="flex items-center space-x-2">
        <Switch
          id="advanced"
          checked={showAdvanced}
          onCheckedChange={setShowAdvanced}
        />
        <Label htmlFor="advanced">Show advanced settings</Label>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <>
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Client Information
              </CardTitle>
              <CardDescription>
                Details about the client and RFP requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Client Name</Label>
                  <Input
                    id="client_name"
                    {...register('client_name')}
                    placeholder="Enter client organization name"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_email">Client Email</Label>
                  <Input
                    id="client_email"
                    type="email"
                    {...register('client_email')}
                    placeholder="client@organization.com"
                    disabled={isSubmitting}
                  />
                  {errors.client_email && (
                    <p className="text-sm text-destructive">{errors.client_email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rfp_document_url">RFP Document URL</Label>
                  <Input
                    id="rfp_document_url"
                    type="url"
                    {...register('rfp_document_url')}
                    placeholder="https://example.com/rfp-document.pdf"
                    disabled={isSubmitting}
                  />
                  {errors.rfp_document_url && (
                    <p className="text-sm text-destructive">{errors.rfp_document_url.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="submission_url">Submission URL</Label>
                  <Input
                    id="submission_url"
                    type="url"
                    {...register('submission_url')}
                    placeholder="https://example.com/submit-proposal"
                    disabled={isSubmitting}
                  />
                  {errors.submission_url && (
                    <p className="text-sm text-destructive">{errors.submission_url.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Planning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Project Planning
              </CardTitle>
              <CardDescription>
                Estimation and budget information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="estimated_hours">Estimated Hours</Label>
                  <Input
                    id="estimated_hours"
                    type="number"
                    {...register('estimated_hours', { valueAsNumber: true })}
                    placeholder="Enter estimated hours"
                    min="1"
                    disabled={isSubmitting}
                  />
                  {errors.estimated_hours && (
                    <p className="text-sm text-destructive">{errors.estimated_hours.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget_amount">Budget Amount (USD)</Label>
                  <Input
                    id="budget_amount"
                    type="number"
                    {...register('budget_amount', { valueAsNumber: true })}
                    placeholder="Enter budget amount"
                    min="0"
                    step="1000"
                    disabled={isSubmitting}
                  />
                  {errors.budget_amount && (
                    <p className="text-sm text-destructive">{errors.budget_amount.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
          {isEditing ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  )
}
