import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ProjectService } from '@/lib/services/project-service'
import { z } from 'zod'

const updateStageSchema = z.object({
  projectId: z.string().uuid(),
  newStage: z.enum(['unassigned', 'assigned', 'submitted', 'skipped', 'won', 'lost']),
  userId: z.string().optional()
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
    const { projectId, newStage, userId: requestUserId } = updateStageSchema.parse(body)

    // Use authenticated user ID
    const actualUserId = requestUserId || userId

    // Update project stage
    const success = await ProjectService.updateProjectStage(projectId, newStage, actualUserId)

    if (!success) {
      return NextResponse.json({ error: 'Failed to update project stage' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in update-stage API:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
