import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    // Get Clerk authentication info
    const { userId, getToken } = await auth()
    const clerkUser = await currentUser()
    const token = await getToken()

    // Create Supabase client
    const supabase = await createClerkSupabaseClient()

    // Test database connection and authentication
    const { data: authInfo, error: authError } = await supabase.rpc('debug_auth_info')
    
    // Test user lookup
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    // Test projects access
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, owner_id')
      .limit(5)

    return NextResponse.json({
      success: true,
      clerk: {
        userId,
        hasToken: !!token,
        tokenLength: token?.length || 0,
        userEmail: clerkUser?.emailAddresses[0]?.emailAddress,
        userName: `${clerkUser?.firstName || ''} ${clerkUser?.lastName || ''}`.trim()
      },
      database: {
        authInfo: authInfo || null,
        authError: authError?.message || null,
        userRecord: userRecord || null,
        userError: userError?.message || null,
        projectsCount: projects?.length || 0,
        projectsError: projectsError?.message || null
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Debug auth error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
