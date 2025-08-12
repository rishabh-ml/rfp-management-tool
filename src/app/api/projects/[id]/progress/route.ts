import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '@/lib/supabase'
import { z } from 'zod'

const updateProgressSchema = z.object({
  progress_percentage: z.number().min(0).max(100),
  status_notes: z.string().optional()
})

export async function PUT(
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
    const { progress_percentage, status_notes } = updateProgressSchema.parse(body)

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

    // Get project to check permissions
    const { data: project } = await supabase
      .from('projects')
      .select('id, title, owner_id, stage, progress_percentage')
      .eq('id', projectId)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check permissions (owner, admin, or manager can update progress)
    const canUpdate = 
      project.owner_id === currentUser.id || 
      ['admin', 'manager'].includes(currentUser.role)

    if (!canUpdate) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Update project progress
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({
        progress_percentage,
        status_notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating project progress:', updateError)
      return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_user_id: currentUser.id,
      p_action: 'progress_updated',
      p_entity_type: 'project',
      p_entity_id: projectId,
      p_old_values: { 
        progress_percentage: project.progress_percentage,
        status_notes: null 
      },
      p_new_values: { 
        progress_percentage,
        status_notes 
      }
    })

    // Create notification for project owner if updated by someone else
    if (project.owner_id && project.owner_id !== currentUser.id) {
      await supabase.rpc('create_notification', {
        p_user_id: project.owner_id,
        p_title: 'Project Progress Updated',
        p_message: `Progress on "${project.title}" updated to ${progress_percentage}%`,
        p_type: 'progress_updated',
        p_entity_type: 'project',
        p_entity_id: projectId
      })
    }

    return NextResponse.json({ 
      project: updatedProject,
      message: 'Progress updated successfully' 
    })

  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    // Get project progress history
    const { data: progressHistory, error } = await supabase
      .from('activity_log')
      .select(`
        *,
        user:users!activity_log_user_id_fkey(id, first_name, last_name)
      `)
      .eq('entity_type', 'project')
      .eq('entity_id', projectId)
      .eq('action', 'progress_updated')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching progress history:', error)
      return NextResponse.json({ error: 'Failed to fetch progress history' }, { status: 500 })
    }

    return NextResponse.json({ progress_history: progressHistory || [] })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
