import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '@/lib/supabase'
import { z } from 'zod'

const updatePreferencesSchema = z.object({
  email_notifications: z.boolean(),
  project_assignments: z.boolean(),
  due_date_reminders: z.boolean(),
  comment_mentions: z.boolean(),
  weekly_summary: z.boolean(),
  notification_frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']),
  quiet_hours_start: z.string().optional(),
  quiet_hours_end: z.string().optional()
})

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClerkSupabaseClient()

    // Get user preferences
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user preferences:', error)
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
    }

    // Return default preferences if none exist
    const defaultPreferences = {
      email_notifications: true,
      project_assignments: true,
      due_date_reminders: true,
      comment_mentions: true,
      weekly_summary: false,
      notification_frequency: 'immediate',
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00'
    }

    return NextResponse.json({ 
      preferences: preferences || defaultPreferences 
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/profile/preferences called')
    
    const { userId } = await auth()
    console.log('User ID from auth:', userId)
    
    if (!userId) {
      console.log('No user ID found - unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Request body:', body)
    
    const validatedData = updatePreferencesSchema.parse(body)
    console.log('Validated data:', validatedData)

    const supabase = await createClerkSupabaseClient()

    // Get current user
    console.log('Looking for user in database:', userId)
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    console.log('User query result:', { currentUser, userError })

    if (!currentUser) {
      console.log('User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Upsert user preferences
    const { data: preferences, error: upsertError } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: currentUser.id,
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (upsertError) {
      console.error('Error updating user preferences:', upsertError)
      console.error('Upsert error details:', JSON.stringify(upsertError, null, 2))
      return NextResponse.json({ 
        error: 'Failed to update preferences', 
        details: upsertError.message 
      }, { status: 500 })
    }

    // Log activity (temporarily disabled - log_activity function not available yet)
    // await supabase.rpc('log_activity', {
    //   p_user_id: currentUser.id,
    //   p_action: 'preferences_updated',
    //   p_entity_type: 'user_preferences',
    //   p_entity_id: preferences.id,
    //   p_new_values: validatedData
    // })

    return NextResponse.json({ 
      preferences,
      message: 'Preferences updated successfully' 
    })

  } catch (error) {
    console.error('API error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid data', 
        details: error.issues 
      }, { status: 400 })
    }
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
