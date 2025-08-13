import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClerkSupabaseClient()

    // Test basic connection
    const { count: userCount, error: connectionError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (connectionError) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: {
          message: connectionError.message,
          code: connectionError.code,
          details: connectionError.details,
          hint: connectionError.hint
        }
      }, { status: 500 })
    }

    // Test projects table
    const { count: projectsCount, error: projectsError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    if (projectsError) {
      return NextResponse.json({ 
        error: 'Projects table access failed',
        details: {
          message: projectsError.message,
          code: projectsError.code,
          details: projectsError.details,
          hint: projectsError.hint
        }
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Database connection successful',
  user_count: userCount || 0,
  projects_count: projectsCount || 0,
      user_id: userId
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
