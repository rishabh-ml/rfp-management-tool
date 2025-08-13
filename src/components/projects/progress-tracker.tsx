'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { BarChart3, Save, TrendingUp, Clock, Target, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { ProjectWithDetails, ProjectStage } from '@/lib/types'

const progressSchema = z.object({
  progress_percentage: z.number().min(0).max(100),
  status_notes: z.string().optional(),
  stage: z.enum(['unassigned', 'assigned', 'reviewed', 'submitted', 'skipped', 'won', 'lost']).optional()
})

type ProgressFormData = z.infer<typeof progressSchema>

interface ProgressTrackerProps {
  project: ProjectWithDetails
  onProgressUpdate?: (progress: number, notes?: string) => void
  canEdit?: boolean
}

export function ProgressTracker({ project, onProgressUpdate, canEdit = true }: ProgressTrackerProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting }
  } = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      progress_percentage: project.progress_percentage || 0,
      status_notes: project.status_notes || '',
      stage: project.stage
    }
  })

  const currentProgress = watch('progress_percentage')
  const currentStage = watch('stage')

  const onSubmit = async (data: ProgressFormData) => {
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progress_percentage: data.progress_percentage,
          status_notes: data.status_notes,
          stage: data.stage
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update project')
      }

      toast.success('Project updated successfully!')
      onProgressUpdate?.(data.progress_percentage, data.status_notes)
      setIsOpen(false)
      router.refresh() // Refresh to show updated data
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error('Failed to update project')
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500'
    if (progress >= 70) return 'bg-blue-500'
    if (progress >= 40) return 'bg-yellow-500'
    if (progress >= 20) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getProgressStatus = (progress: number) => {
    if (progress >= 90) return { label: 'Near Completion', color: 'text-green-600' }
    if (progress >= 70) return { label: 'On Track', color: 'text-blue-600' }
    if (progress >= 40) return { label: 'In Progress', color: 'text-yellow-600' }
    if (progress >= 20) return { label: 'Getting Started', color: 'text-orange-600' }
    return { label: 'Just Started', color: 'text-red-600' }
  }

  const progressStatus = getProgressStatus(project.progress_percentage || 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <CardTitle className="text-base">Project Progress</CardTitle>
          </div>
          {canEdit && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Update
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Update Project Progress & Stage</DialogTitle>
                  <DialogDescription>
                    Update the project stage, completion percentage, and add status notes
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Project Stage */}
                  <div className="space-y-2">
                    <Label>Project Stage</Label>
                    <Select 
                      value={currentStage} 
                      onValueChange={(value) => setValue('stage', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                            Unassigned
                          </div>
                        </SelectItem>
                        <SelectItem value="assigned">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            In Progress
                          </div>
                        </SelectItem>
                        <SelectItem value="submitted">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            Submitted
                          </div>
                        </SelectItem>
                        <SelectItem value="won">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            Won
                          </div>
                        </SelectItem>
                        <SelectItem value="lost">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            Lost
                          </div>
                        </SelectItem>
                        <SelectItem value="skipped">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            Skipped
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Progress Slider */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Progress Percentage</Label>
                      <Badge variant="outline" className="font-mono">
                        {currentProgress}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Slider
                        value={[currentProgress]}
                        onValueChange={(value) => setValue('progress_percentage', value[0])}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Progress Preview */}
                    <div className="space-y-2">
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all ${getProgressColor(currentProgress)}`}
                          style={{ width: `${currentProgress}%` }}
                        />
                      </div>
                      <div className="text-center">
                        <span className={`text-sm font-medium ${getProgressStatus(currentProgress).color}`}>
                          {getProgressStatus(currentProgress).label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="status_notes">Status Notes</Label>
                    <Textarea
                      id="status_notes"
                      {...register('status_notes')}
                      placeholder="Add notes about current progress, blockers, or next steps..."
                      rows={4}
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">
                      Describe what&apos;s been completed and what&apos;s coming next
                    </p>
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
                      Update Progress
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Progress Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Completion</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                {project.progress_percentage || 0}%
              </Badge>
              <span className={`text-sm ${progressStatus.color}`}>
                {progressStatus.label}
              </span>
            </div>
          </div>
          
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all ${getProgressColor(project.progress_percentage || 0)}`}
              style={{ width: `${project.progress_percentage || 0}%` }}
            />
          </div>
        </div>

        {/* Status Notes */}
        {project.status_notes && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Latest Update</Label>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{project.status_notes}</p>
            </div>
          </div>
        )}

        {/* Progress Milestones */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className={`text-center p-2 rounded ${(project.progress_percentage || 0) >= 25 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            <Target className="h-4 w-4 mx-auto mb-1" />
            <div>Started</div>
            <div>25%</div>
          </div>
          <div className={`text-center p-2 rounded ${(project.progress_percentage || 0) >= 50 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            <TrendingUp className="h-4 w-4 mx-auto mb-1" />
            <div>Halfway</div>
            <div>50%</div>
          </div>
          <div className={`text-center p-2 rounded ${(project.progress_percentage || 0) >= 75 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            <Clock className="h-4 w-4 mx-auto mb-1" />
            <div>Nearly Done</div>
            <div>75%</div>
          </div>
          <div className={`text-center p-2 rounded ${(project.progress_percentage || 0) >= 100 ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
            <BarChart3 className="h-4 w-4 mx-auto mb-1" />
            <div>Complete</div>
            <div>100%</div>
          </div>
        </div>

        {project.stage !== 'assigned' && (
          <div className="text-center text-sm text-muted-foreground">
            Progress tracking is available for assigned projects
          </div>
        )}
      </CardContent>
    </Card>
  )
}
