import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { SubtaskService } from '@/lib/services/subtask-service'
import { z } from 'zod'

const createSubtaskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  due_date: z.string().optional(),
  created_by: z.string().optional()
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
    const { projectId, title, description, due_date, created_by } = createSubtaskSchema.parse(body)

    // Use authenticated user ID
    const actualUserId = created_by || userId

    // Create subtask
    const subtask = await SubtaskService.createSubtask({
      project_id: projectId,
      title,
      description: description || null,
      due_date: due_date || null,
      created_by: actualUserId
    })

    if (!subtask) {
      return NextResponse.json({ error: 'Failed to create subtask' }, { status: 500 })
    }

    return NextResponse.json({ subtask })
  } catch (error) {
    console.error('Error in subtasks API:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
