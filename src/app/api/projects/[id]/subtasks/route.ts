import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '@/lib/supabase'
import { z } from 'zod'

const createSubtaskSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
  due_date: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  estimated_hours: z.number().min(0.5).max(100).optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = await params
    const supabase = await createClerkSupabaseClient()

    // Get subtasks for the project
    const { data: subtasks, error } = await supabase
      .from('subtasks')
      .select(`
        *,
        assigned_user:users!subtasks_assigned_to_fkey(id, first_name, last_name, email, avatar_url),
        created_by_user:users!subtasks_created_by_fkey(id, first_name, last_name)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subtasks:', error)
      return NextResponse.json({ error: 'Failed to fetch subtasks' }, { status: 500 })
    }

    return NextResponse.json({ subtasks: subtasks || [] })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = await params
    const body = await request.json()
    const validatedData = createSubtaskSchema.parse(body)

    const supabase = await createClerkSupabaseClient()

    // Get current user
    const { data: currentUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .single()

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has permission to create subtasks for this project
    const { data: project } = await supabase
      .from('projects')
      .select('id, title, owner_id')
      .eq('id', projectId)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const canCreate = 
      project.owner_id === currentUser.id || 
      ['admin', 'manager'].includes(currentUser.role)

    if (!canCreate) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Create subtask
    const { data: subtask, error: createError } = await supabase
      .from('subtasks')
      .insert({
        project_id: projectId,
        title: validatedData.title,
        description: validatedData.description,
        assigned_to: validatedData.assigned_to,
        due_date: validatedData.due_date,
        priority: validatedData.priority,
        estimated_hours: validatedData.estimated_hours,
        created_by: currentUser.id
      })
      .select(`
        *,
        assigned_user:users!subtasks_assigned_to_fkey(id, first_name, last_name, email, avatar_url),
        created_by_user:users!subtasks_created_by_fkey(id, first_name, last_name)
      `)
      .single()

    if (createError) {
      console.error('Error creating subtask:', createError)
      return NextResponse.json({ error: 'Failed to create subtask' }, { status: 500 })
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_user_id: currentUser.id,
      p_action: 'subtask_created',
      p_entity_type: 'subtask',
      p_entity_id: subtask.id,
      p_new_values: { 
        title: subtask.title, 
        project_id: projectId,
        assigned_to: subtask.assigned_to 
      }
    })

    // Create notification for assigned user
    if (subtask.assigned_to && subtask.assigned_to !== currentUser.id) {
      await supabase.rpc('create_notification', {
        p_user_id: subtask.assigned_to,
        p_title: 'New Subtask Assigned',
        p_message: `You have been assigned to subtask "${subtask.title}" in project "${project.title}"`,
        p_type: 'assignment',
        p_entity_type: 'subtask',
        p_entity_id: subtask.id
      })
    }

    return NextResponse.json({ 
      subtask,
      message: 'Subtask created successfully' 
    }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
