import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const unreadOnly = searchParams.get('unread_only') === 'true'

    const supabase = await createClerkSupabaseClient()

    // Get current user
    const { data: currentUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let query = supabase
      .from('notifications')
      .select(`
        *
      `)
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    if (limit) {
      query = query.limit(limit)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', currentUser.id)
      .eq('is_read', false)

    return NextResponse.json({ 
      notifications: notifications || [],
      unread_count: unreadCount || 0
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { user_id, title, message, type, entity_type, entity_id } = body

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

    // Create notification using database function
    const { data: notificationId, error } = await supabase
      .rpc('create_notification', {
        p_user_id: user_id,
        p_title: title,
        p_message: message,
        p_type: type,
        p_entity_type: entity_type,
        p_entity_id: entity_id,
        p_created_by: currentUser.id
      })

    if (error) {
      console.error('Error creating notification:', error)
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
    }

    return NextResponse.json({ 
      notification_id: notificationId,
      message: 'Notification created successfully' 
    }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
