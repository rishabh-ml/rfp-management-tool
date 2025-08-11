import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const targetUserId = params.id
    const supabase = await createClerkSupabaseClient()

    // Get current user
    const { data: currentUser } = await supabase
      .from('users')
      .select('id, role, first_name, last_name')
      .eq('clerk_id', userId)
      .single()

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check permissions (admin or manager)
    if (!['admin', 'manager'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get target user
    const { data: targetUser } = await supabase
      .from('users')
      .select('id, role, first_name, last_name, email, is_active')
      .eq('id', targetUserId)
      .single()

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }

    // Check if already active
    if (targetUser.is_active) {
      return NextResponse.json({ error: 'User is already active' }, { status: 400 })
    }

    // Reactivate user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId)
      .select()
      .single()

    if (updateError) {
      console.error('Error reactivating user:', updateError)
      return NextResponse.json({ error: 'Failed to reactivate user' }, { status: 500 })
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_user_id: currentUser.id,
      p_action: 'user_reactivated',
      p_entity_type: 'user',
      p_entity_id: targetUserId,
      p_old_values: { is_active: false },
      p_new_values: { is_active: true }
    })

    // Create notification for the reactivated user
    await supabase.rpc('create_notification', {
      p_user_id: targetUserId,
      p_title: 'Account Reactivated',
      p_message: `Your account has been reactivated by ${currentUser.first_name || 'an administrator'}. Welcome back!`,
      p_type: 'account_status',
      p_entity_type: 'user',
      p_entity_id: targetUserId,
      p_created_by: currentUser.id
    })

    return NextResponse.json({ 
      user: updatedUser,
      message: 'User reactivated successfully' 
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
