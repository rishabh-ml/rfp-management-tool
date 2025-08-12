import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '@/lib/supabase'
import { z } from 'zod'

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'manager', 'member'])
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

    const { id: targetUserId } = await params
    const body = await request.json()
    const { role } = updateRoleSchema.parse(body)

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

    // Check permissions
    if (currentUser.role !== 'admin' && !(currentUser.role === 'manager' && role === 'member')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get target user
    const { data: targetUser } = await supabase
      .from('users')
      .select('id, role, first_name, last_name, email')
      .eq('id', targetUserId)
      .single()

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }

    // Prevent self-role change
    if (currentUser.id === targetUser.id) {
      return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 })
    }

    // Update user role
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating user role:', updateError)
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_user_id: currentUser.id,
      p_action: 'role_updated',
      p_entity_type: 'user',
      p_entity_id: targetUserId,
      p_old_values: { role: targetUser.role },
      p_new_values: { role }
    })

    // Create notification for the user whose role was changed
    await supabase.rpc('create_notification', {
      p_user_id: targetUserId,
      p_title: 'Role Updated',
      p_message: `Your role has been changed to ${role} by ${currentUser.first_name || 'an administrator'}`,
      p_type: 'role_change',
      p_entity_type: 'user',
      p_entity_id: targetUserId,
      p_created_by: currentUser.id
    })

    return NextResponse.json({ 
      user: updatedUser,
      message: 'User role updated successfully' 
    })

  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
