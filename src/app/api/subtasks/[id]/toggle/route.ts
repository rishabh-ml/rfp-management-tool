import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { SubtaskService } from '@/lib/services/subtask-service'
import { z } from 'zod'

const toggleSubtaskSchema = z.object({
  completed: z.boolean()
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get subtask ID from params
    const { id } = await params

    // Parse request body
    const body = await request.json()
    const { completed } = toggleSubtaskSchema.parse(body)

    // Update subtask
    const subtask = await SubtaskService.updateSubtask(id, { completed })

    if (!subtask) {
      return NextResponse.json({ error: 'Failed to update subtask' }, { status: 500 })
    }

    return NextResponse.json(subtask)
  } catch (error) {
    console.error('Error in subtask toggle API:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
