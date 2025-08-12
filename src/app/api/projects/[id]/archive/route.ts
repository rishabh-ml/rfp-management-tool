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

    // Get the project
    const project = await ProjectService.getProjectById(id)
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if user can archive this project
    const canArchive = currentUser.id === project.owner_id || 
                       ['admin', 'manager'].includes(currentUser.role)

    if (!canArchive) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Archive the project by updating its stage to 'skipped' (closest to archived)
    const archivedProject = await ProjectService.updateProject(id, {
      stage: 'skipped'
    })

    return NextResponse.json({ 
      message: 'Project archived successfully',
      project: archivedProject 
    })

  } catch (error) {
    console.error('Error archiving project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
