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

    // Prevent self-deactivation
    if (currentUser.id === targetUser.id) {
      return NextResponse.json({ error: 'Cannot deactivate yourself' }, { status: 400 })
    }

    // Prevent managers from deactivating admins
    if (currentUser.role === 'manager' && targetUser.role === 'admin') {
      return NextResponse.json({ error: 'Cannot deactivate administrators' }, { status: 403 })
    }

    // Check if already deactivated
    if (!targetUser.is_active) {
      return NextResponse.json({ error: 'User is already deactivated' }, { status: 400 })
    }

    // Deactivate user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId)
      .select()
      .single()

    if (updateError) {
      console.error('Error deactivating user:', updateError)
      return NextResponse.json({ error: 'Failed to deactivate user' }, { status: 500 })
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_user_id: currentUser.id,
      p_action: 'user_deactivated',
      p_entity_type: 'user',
      p_entity_id: targetUserId,
      p_old_values: { is_active: true },
      p_new_values: { is_active: false }
    })

    // Create notification for the deactivated user
    await supabase.rpc('create_notification', {
      p_user_id: targetUserId,
      p_title: 'Account Deactivated',
      p_message: `Your account has been deactivated by ${currentUser.first_name || 'an administrator'}. Contact support if you believe this is an error.`,
      p_type: 'account_status',
      p_entity_type: 'user',
      p_entity_id: targetUserId,
      p_created_by: currentUser.id
    })

    return NextResponse.json({ 
      user: updatedUser,
      message: 'User deactivated successfully' 
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
