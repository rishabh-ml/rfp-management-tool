import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ProjectService } from '@/lib/services/project-service'
import { z } from 'zod'

const createProjectSchema = z.object({
  // Basic Project Info
  title: z.string().min(1, 'Project title is required').max(200),
  description: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
  
  // RFP Details
  rfp_added_date: z.date(),
  rfp_title: z.string().min(1, 'RFP title is required').max(500),
  client_name: z.string().min(1, 'Client name is required').max(200),
  state: z.string().min(1, 'State is required').max(100),
  portal_url: z.string().url('Invalid portal URL').optional().or(z.literal('')),
  folder_url: z.string().url('Invalid folder URL').optional().or(z.literal('')),
  
  // Project Management
  assigned_to: z.string().optional().nullable(),
  company_assignment: z.string().optional().nullable(),
  
  // Post-Review (all optional)
  priority_banding: z.enum(['P1', 'P2', 'P3']).optional(),
  review_comment: z.string().max(1000).optional().nullable(),
  
  // System fields
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
    console.log('Received project data:', body) // Debug log
    
    // Convert date strings back to Date objects for validation
    if (body.rfp_added_date) {
      body.rfp_added_date = new Date(body.rfp_added_date)
    }
    
    const projectData = createProjectSchema.parse(body)

    // Create project with authenticated user as owner
    const project = await ProjectService.createProject({
      title: projectData.title,
      description: projectData.description || null,
      due_date: projectData.due_date || null,
      // RFP fields
      rfp_added_date: projectData.rfp_added_date.toISOString(),
      rfp_title: projectData.rfp_title,
      client_name: projectData.client_name,
      state: projectData.state,
      portal_url: projectData.portal_url || null,
      folder_url: projectData.folder_url || null,
      // Management fields
      assigned_to: projectData.assigned_to || null,
      company_assignment: projectData.company_assignment || null,
      // Post-review fields
      priority_banding: projectData.priority_banding || null,
      review_comment: projectData.review_comment || null,
      // System fields
      owner_id: userId, // Use authenticated user ID
      stage: projectData.stage || 'assigned' // Default to assigned since owner_id is required
    })

    if (!project) {
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error in projects API:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
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
