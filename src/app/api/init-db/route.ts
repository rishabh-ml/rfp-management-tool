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
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      console.error('Error checking user:', userCheckError)
      return NextResponse.json({ 
        error: 'Database error', 
        details: userCheckError.message 
      }, { status: 500 })
    }

    let user = existingUser

    // Create user if doesn't exist
    if (!existingUser) {
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          first_name: clerkUser.firstName || null,
          last_name: clerkUser.lastName || null,
          avatar_url: clerkUser.imageUrl || null,
          role: 'member'
        })
        .select()
        .single()

      if (createUserError) {
        console.error('Error creating user:', createUserError)
        return NextResponse.json({ 
          error: 'Failed to create user', 
          details: createUserError.message 
        }, { status: 500 })
      }

      user = newUser
    }

    // Test projects table access
    const { count: projectsCount, error: projectsError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    if (projectsError) {
      console.error('Projects table error:', projectsError)
      return NextResponse.json({ 
        error: 'Projects table access failed',
        details: projectsError.message,
        suggestion: 'Please run the database schema setup scripts'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Database initialized successfully',
      user: user,
      projects_count: projectsCount || 0
    })
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
