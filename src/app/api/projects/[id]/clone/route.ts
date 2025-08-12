import { NextRequest, NextResponse } from 'next/server'
import { ProjectService } from '@/lib/services/project-service'
import { UserService } from '@/lib/services/user-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await UserService.getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the original project
    const originalProject = await ProjectService.getProjectById(id)
    
    if (!originalProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if user can clone this project
    const canClone = currentUser.id === originalProject.owner_id || 
                     ['admin', 'manager'].includes(currentUser.role)

    if (!canClone) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Clone the project
    const clonedProject = await ProjectService.createProject({
      title: `${originalProject.title} (Copy)`,
      description: originalProject.description,
      priority: originalProject.priority,
      due_date: originalProject.due_date,
      owner_id: currentUser.id, // Assign clone to current user
      estimated_hours: originalProject.estimated_hours,
      budget_amount: originalProject.budget_amount,
      client_name: originalProject.client_name,
      client_email: originalProject.client_email,
      rfp_document_url: originalProject.rfp_document_url,
      submission_url: originalProject.submission_url
    })

    return NextResponse.json(clonedProject)

  } catch (error) {
    console.error('Error cloning project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
