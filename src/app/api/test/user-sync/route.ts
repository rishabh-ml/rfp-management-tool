import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { UserSyncService } from '@/lib/services/user-sync-service'
import { createClerkSupabaseClient } from '@/lib/supabase'

export async function POST() {
  try {
    // Get Clerk authentication info
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: 'Clerk user not found' }, { status: 404 })
    }

    // Test user sync
    console.log('Testing user sync for:', userId)
    const syncResult = await UserSyncService.syncCurrentUser()

    // Test database access after sync
    const supabase = await createClerkSupabaseClient()
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    // Test auth info
    const { data: authInfo, error: authError } = await supabase.rpc('debug_auth_info')

    return NextResponse.json({
      success: true,
      clerk: {
        userId,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()
      },
      sync: syncResult,
      database: {
        userRecord: userRecord || null,
        userError: userError?.message || null,
        authInfo: authInfo || null,
        authError: authError?.message || null
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('User sync test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Get Clerk authentication info
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user exists in database
  const exists = await UserSyncService.userExists(userId)

    return NextResponse.json({
      success: true,
      userId,
      exists,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('User check error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
