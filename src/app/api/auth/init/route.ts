import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '@/lib/supabase'

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: 'Clerk user not found' }, { status: 404 })
    }

    const supabase = await createClerkSupabaseClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists', user: existingUser })
    }

    // Create user record using the database function
    const { error } = await supabase
      .rpc('sync_user_from_clerk', {
        p_id: userId,
        p_email: clerkUser.emailAddresses[0]?.emailAddress || '',
        p_first_name: clerkUser.firstName || null,
        p_last_name: clerkUser.lastName || null,
        p_avatar_url: clerkUser.imageUrl || null
      })

    if (error) {
      console.error('Error creating user:', error)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Get the created/updated user
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    return NextResponse.json({ message: 'User initialized successfully', user: userData })
  } catch (error) {
    console.error('Error in auth init:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
