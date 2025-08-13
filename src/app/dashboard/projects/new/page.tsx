'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
// Remove server-side imports - using API routes instead
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

const projectSchema = z.object({
  // Basic project fields
  title: z.string().min(3, 'RFP Title must be at least 3 characters').max(200, 'RFP Title must be less than 200 characters'),
  description: z.string().optional(),
  due_date: z.date({ message: 'Due Date is required' }),
  
  // RFP-specific fields
  rfp_added_date: z.date(),
  client_name: z.string().min(1, 'Client Name is required').max(200),
  state: z.string().optional(),
  portal_url: z.string().url('Invalid URL').optional(),
  folder_url: z.string().url('Invalid URL').optional(),
  
  // Management fields
  owner_id: z.string().optional(),
  
  // Post-review fields (conditional) - Priority Banding will be used as the main priority
  priority_banding: z.enum(['P1', 'P2', 'P3', 'No bid']).optional(),
  review_comment: z.string().max(1000, 'Review comment must be less than 1000 characters').optional(),
  assigned_to: z.string().optional(),
  company_assignment: z.enum(['DatamanHealth', 'DatamanUSA', 'CCSI']).optional()
})

type ProjectFormData = z.infer<typeof projectSchema>

export default function NewProjectPage() {
  const router = useRouter()
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<Array<{ id: string; first_name: string; last_name: string; email: string }>>([])
  const [showReviewFields, setShowReviewFields] = useState(false)

  // Load users for assignment dropdown
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch('/api/users')
        if (response.ok) {
          const usersData = await response.json()
          setUsers(usersData)
        }
      } catch (error) {
        console.error('Error loading users:', error)
      }
    }
    loadUsers()
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      rfp_added_date: new Date()
    }
  })

  // Load users for assignment
  useState(() => {
    // For demo purposes, use mock users
    setUsers([
      { id: '1', first_name: 'Alice', last_name: 'Admin', email: 'admin@company.com' },
      { id: '2', first_name: 'Bob', last_name: 'Manager', email: 'manager@company.com' },
      { id: '3', first_name: 'John', last_name: 'Developer', email: 'john@company.com' },
      { id: '4', first_name: 'Sarah', last_name: 'Designer', email: 'sarah@company.com' }
    ])
  })

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true)
    try {
      const projectData = {
        // Basic fields (title is the RFP title now)
        title: data.title,
        rfp_title: data.title, // Same as title
        description: data.description || null,
        due_date: data.due_date.toISOString(),
        
        // RFP fields
        rfp_added_date: data.rfp_added_date.toISOString(),
        client_name: data.client_name,
        state: data.state || null,
        portal_url: data.portal_url || null,
        folder_url: data.folder_url || null,
        
        // Management fields
        owner_id: data.owner_id || user?.id || '',
        
        // Post-review fields (only if being reviewed)
        priority_banding: data.priority_banding || null,
        review_comment: data.review_comment || null,
        assigned_to: data.assigned_to || null,
        company_assignment: data.company_assignment || null,
        
        // System fields
        stage: data.assigned_to ? 'assigned' : 'unassigned',
        progress_percentage: 0,
        is_archived: false
      }

      // Create project via API
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', errorData)
        throw new Error(errorData.error || `Failed to create project (${response.status})`)
      }

      const project = await response.json()
      toast.success('RFP project created successfully!')
      router.push(`/dashboard/projects/${project.id}`)
    } catch (error) {
      console.error('Error creating project:', error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating the project.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New RFP Project</h1>
          <p className="text-muted-foreground">
            Add a new RFP project with comprehensive details to your dashboard
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>RFP Project Details</CardTitle>
          <CardDescription>
            Fill in the comprehensive RFP information below to create a new project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <p className="text-sm text-muted-foreground">General project details</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">RFP Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter RFP title"
                  disabled={isLoading}
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
                  placeholder="Enter project description"
                  rows={3}
                  disabled={isLoading}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* RFP Details Section */}
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold">RFP Details</h3>
                <p className="text-sm text-muted-foreground">Client and RFP-specific information</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rfp_added_date">RFP Added Date</Label>
                  <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded border">
                    {new Date().toLocaleDateString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Automatically set to current date
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date *</Label>
                  <DatePicker
                    date={watch('due_date')}
                    onDateChange={(date) => setValue('due_date', date || new Date())}
                    disabled={isLoading}
                  />
                  {errors.due_date && (
                    <p className="text-sm text-destructive">{errors.due_date.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name *</Label>
                <Input
                  id="client_name"
                  {...register('client_name')}
                  placeholder="Enter client name"
                  disabled={isLoading}
                />
                {errors.client_name && (
                  <p className="text-sm text-destructive">{errors.client_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  {...register('state')}
                  placeholder="Enter state/location (optional)"
                  disabled={isLoading}
                />
                {errors.state && (
                  <p className="text-sm text-destructive">{errors.state.message}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="portal_url">Portal URL</Label>
                  <Input
                    id="portal_url"
                    type="url"
                    {...register('portal_url')}
                    placeholder="https://portal.example.com"
                    disabled={isLoading}
                  />
                  {errors.portal_url && (
                    <p className="text-sm text-destructive">{errors.portal_url.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="folder_url">Folder URL</Label>
                  <Input
                    id="folder_url"
                    type="url"
                    {...register('folder_url')}
                    placeholder="https://folder.example.com"
                    disabled={isLoading}
                  />
                  {errors.folder_url && (
                    <p className="text-sm text-destructive">{errors.folder_url.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Project Management Section */}
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold">Project Management</h3>
                <p className="text-sm text-muted-foreground">Priority and assignment information</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select
                    value={watch('assigned_to') || 'unassigned'}
                    onValueChange={(value) => setValue('assigned_to', value === 'unassigned' ? undefined : value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Company Assignment</Label>
                  <Select
                    value={watch('company_assignment') || 'none'}
                    onValueChange={(value) => setValue('company_assignment', value === 'none' ? undefined : value as 'DatamanHealth' | 'DatamanUSA' | 'CCSI')}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not Assigned</SelectItem>
                      <SelectItem value="DatamanHealth">DatamanHealth</SelectItem>
                      <SelectItem value="DatamanUSA">DatamanUSA</SelectItem>
                      <SelectItem value="CCSI">CCSI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Post-Review Section (Optional) */}
            <div className="space-y-6">
              <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Post-Review Fields</h3>
                    <p className="text-sm text-muted-foreground">Optional fields for reviewed projects</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReviewFields(!showReviewFields)}
                    disabled={isLoading}
                  >
                    {showReviewFields ? 'Hide' : 'Show'} Review Fields
                  </Button>
                </div>
              </div>

              {showReviewFields && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Priority Banding</Label>
                      <Select
                        value={watch('priority_banding') || 'none'}
                        onValueChange={(value) => setValue('priority_banding', value === 'none' ? undefined : value as 'P1' | 'P2' | 'P3' | 'No bid')}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority band" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not Set</SelectItem>
                          <SelectItem value="P1">P1 - High Priority</SelectItem>
                          <SelectItem value="P2">P2 - Medium Priority</SelectItem>
                          <SelectItem value="P3">P3 - Low Priority</SelectItem>
                          <SelectItem value="No bid">No Bid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="review_comment">Review Comment</Label>
                    <Textarea
                      id="review_comment"
                      {...register('review_comment')}
                      placeholder="Enter review comments (max 1000 characters)"
                      rows={3}
                      disabled={isLoading}
                      maxLength={1000}
                    />
                    {errors.review_comment && (
                      <p className="text-sm text-destructive">{errors.review_comment.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {watch('review_comment')?.length || 0}/1000 characters
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-4 pt-6 border-t">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                Create RFP Project
              </Button>
              <Button variant="outline" type="button" asChild disabled={isLoading}>
                <Link href="/dashboard/projects">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
