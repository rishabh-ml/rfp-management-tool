'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { EnhancedProjectForm } from '@/components/forms/enhanced-project-form'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  Edit, 
  MoreHorizontal, 
  Copy, 
  Archive, 
  Share2, 
  Download,
  Trash2,
  ExternalLink,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'
import type { ProjectWithDetails, User, Tag, CustomAttribute } from '@/lib/types'

interface ProjectActionsMenuProps {
  project: ProjectWithDetails
  currentUser: User | null
  users?: User[]
  tags?: Tag[]
  customAttributes?: CustomAttribute[]
}

export function ProjectActionsMenu({ 
  project, 
  currentUser, 
  users = [], 
  tags = [], 
  customAttributes = [] 
}: ProjectActionsMenuProps) {
  const router = useRouter()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const canEdit = currentUser?.id === project.owner_id || 
                  ['admin', 'manager'].includes(currentUser?.role || '')

  const canDelete = currentUser?.id === project.owner_id || 
                    currentUser?.role === 'admin'

  const handleEditProject = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to update project')
      }

      toast.success('Project updated successfully!')
      setIsEditDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error('Failed to update project')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloneProject = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/projects/${project.id}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to clone project')
      }

      const clonedProject = await response.json()
      toast.success('Project cloned successfully!')
      router.push(`/dashboard/projects/${clonedProject.id}`)
    } catch (error) {
      console.error('Error cloning project:', error)
      toast.error('Failed to clone project')
    } finally {
      setIsLoading(false)
    }
  }

  const handleArchiveProject = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/projects/${project.id}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to archive project')
      }

      toast.success('Project archived successfully!')
      router.push('/dashboard/projects')
    } catch (error) {
      console.error('Error archiving project:', error)
      toast.error('Failed to archive project')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProject = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete project')
      }

      toast.success('Project deleted successfully!')
      router.push('/dashboard/projects')
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShareProject = async () => {
    const shareUrl = `${window.location.origin}/dashboard/projects/${project.id}`
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Project link copied to clipboard!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleExportProject = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/export`, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error('Failed to export project')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${project.title}-export.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Project exported successfully!')
    } catch (error) {
      console.error('Error exporting project:', error)
      toast.error('Failed to export project')
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Edit Button */}
      {canEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update the project details and settings
              </DialogDescription>
            </DialogHeader>
            
            <EnhancedProjectForm
              initialData={{
                title: project.title,
                description: project.description || '',
                rfp_title: project.rfp_title || project.title,
                client_name: project.client_name || '',
                state: project.state || '',
                priority_banding: project.priority_banding as 'P1' | 'P2' | 'P3' | undefined,
                due_date: project.due_date ? new Date(project.due_date) : undefined,
                rfp_added_date: project.rfp_added_date ? new Date(project.rfp_added_date) : new Date(),
                portal_url: project.portal_url || '',
                folder_url: project.folder_url || '',
                owner_id: project.owner_id || '',
                assigned_to: project.assigned_to || '',
                company_assignment: project.company_assignment || '',
                review_comment: project.review_comment || ''
              }}
              users={users}
              customAttributes={customAttributes}
              onSubmit={handleEditProject}
              isEditing={true}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* More Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleCloneProject} disabled={isLoading}>
            <Copy className="mr-2 h-4 w-4" />
            Clone Project
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleShareProject}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Link
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleExportProject}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </DropdownMenuItem>

          {project.rfp_document_url && (
            <DropdownMenuItem asChild>
              <a href={project.rfp_document_url} target="_blank" rel="noopener noreferrer">
                <FileText className="mr-2 h-4 w-4" />
                View RFP Document
                <ExternalLink className="ml-auto h-3 w-3" />
              </a>
            </DropdownMenuItem>
          )}

          {project.submission_url && (
            <DropdownMenuItem asChild>
              <a href={project.submission_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Submit Proposal
              </a>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          
          {canEdit && (
            <DropdownMenuItem onClick={handleArchiveProject} disabled={isLoading}>
              <Archive className="mr-2 h-4 w-4" />
              Archive Project
            </DropdownMenuItem>
          )}

          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Project
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Project</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete &ldquo;{project.title}&rdquo;? This action cannot be undone.
                      All subtasks, comments, and related data will be permanently removed.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsDeleteDialogOpen(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteProject}
                      disabled={isLoading}
                    >
                      {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                      Delete Project
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
