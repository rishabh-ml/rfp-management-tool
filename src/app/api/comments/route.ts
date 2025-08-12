import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { CommentService } from '@/lib/services/comment-service'
import { z } from 'zod'

const createCommentSchema = z.object({
  projectId: z.string().uuid(),
  content: z.string().min(1).max(5000)
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
    const { projectId, content } = createCommentSchema.parse(body)

    // Create comment using authenticated user ID
    const comment = await CommentService.createComment({
      project_id: projectId,
      user_id: userId,
      content: content
    })

    if (!comment) {
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Error in comments API:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 })
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

    // Get project ID from query params
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Get comments for project
    const comments = await CommentService.getProjectComments(projectId)

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error in comments GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
