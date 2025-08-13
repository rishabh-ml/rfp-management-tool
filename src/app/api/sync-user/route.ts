import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { UserSyncService } from '@/lib/services/user-sync-service'

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Sync the current user
    const result = await UserSyncService.syncCurrentUser()

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'User sync failed', 
          details: result.error 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `User ${result.action} successfully`,
      data: {
        userId: result.userId,
        action: result.action
      }
    })

  } catch (error) {
    console.error('Error in sync-user API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user exists in database
    const exists = await UserSyncService.userExists(userId)
    
    if (exists) {
      const userData = await UserSyncService.getUserData(userId)
      return NextResponse.json({
        exists: true,
        user: userData
      })
    } else {
      return NextResponse.json({
        exists: false,
        message: 'User not found in database'
      })
    }

  } catch (error) {
    console.error('Error checking user sync status:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
