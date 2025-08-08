import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ProjectService } from '@/lib/services/project-service'
import { z } from 'zod'

const createProjectSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  due_date: z.string().optional(),
  owner_id: z.string().optional(),
  stage: z.enum(['unassigned', 'assigned', 'submitted', 'skipped', 'won', 'lost']).optional()
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const projectData = createProjectSchema.parse(body)

    // Create project
    const project = await ProjectService.createProject({
      ...projectData,
      description: projectData.description || null,
      due_date: projectData.due_date || null,
      owner_id: projectData.owner_id || null,
      stage: projectData.stage || (projectData.owner_id ? 'assigned' : 'unassigned')
    })

    if (!project) {
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error in projects API:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get projects
    const projects = await ProjectService.getProjects()

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error in projects GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
