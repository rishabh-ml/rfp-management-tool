import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

if (!supabaseUrl || !supabaseServiceKey || !webhookSecret) {
  throw new Error('Missing required environment variables for Clerk webhook')
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Logging utility
function logWebhookEvent(level: 'info' | 'error' | 'warn', message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const logData = data ? JSON.stringify(data, null, 2) : ''
  console[level](`[${timestamp}] Clerk Webhook - ${message}`, logData)
}

// User data extraction helper
function extractUserData(clerkUser: any) {
  return {
    id: clerkUser.id as string,
    email: clerkUser.email_addresses?.[0]?.email_address || null,
    first_name: clerkUser.first_name || null,
    last_name: clerkUser.last_name || null,
    avatar_url: clerkUser.image_url || null,
    is_active: true,
    last_login_at: clerkUser.last_sign_in_at ? new Date(clerkUser.last_sign_in_at).toISOString() : null
  }
}

// User synchronization functions
async function handleUserCreated(userData: any) {
  logWebhookEvent('info', 'Processing user.created event', { userId: userData.id, email: userData.email })

  try {
    // Use the sync_user_from_clerk function for consistency
    const { data, error } = await supabase.rpc('sync_user_from_clerk', {
      p_id: userData.id,
      p_email: userData.email,
      p_first_name: userData.first_name,
      p_last_name: userData.last_name,
      p_avatar_url: userData.avatar_url
    })

    if (error) {
      logWebhookEvent('error', 'Failed to create user via RPC', { error, userData })
      throw error
    }

    logWebhookEvent('info', 'User created successfully', { userId: data })
    return { success: true, userId: data }
  } catch (error) {
    logWebhookEvent('error', 'Error in handleUserCreated', { error, userData })
    throw error
  }
}

async function handleUserUpdated(userData: any) {
  logWebhookEvent('info', 'Processing user.updated event', { userId: userData.id, email: userData.email })

  try {
    // Update user data
    const { error } = await supabase
      .from('users')
      .update({
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        avatar_url: userData.avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', userData.id)

    if (error) {
      logWebhookEvent('error', 'Failed to update user', { error, userData })
      throw error
    }

    logWebhookEvent('info', 'User updated successfully', { userId: userData.id })
    return { success: true, userId: userData.id }
  } catch (error) {
    logWebhookEvent('error', 'Error in handleUserUpdated', { error, userData })
    throw error
  }
}

async function handleUserDeleted(userId: string) {
  logWebhookEvent('info', 'Processing user.deleted event', { userId })

  try {
    // Soft delete: mark user as inactive instead of hard delete
    // This preserves referential integrity for projects, comments, etc.
    const { error } = await supabase
      .from('users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      logWebhookEvent('error', 'Failed to soft delete user', { error, userId })
      throw error
    }

    logWebhookEvent('info', 'User soft deleted successfully', { userId })
    return { success: true, userId }
  } catch (error) {
    logWebhookEvent('error', 'Error in handleUserDeleted', { error, userId })
    throw error
  }
}

export async function POST(req: Request) {
  logWebhookEvent('info', 'Received webhook request')

  try {
    // Get the headers
    const headerPayload = await headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      logWebhookEvent('error', 'Missing svix headers')
      return NextResponse.json(
        { error: 'Missing required svix headers' },
        { status: 400 }
      )
    }

    // Get the body
    const payload = await req.text()

    // Create a new Svix instance with your secret
    const wh = new Webhook(webhookSecret)

    let evt: WebhookEvent

    // Verify the payload with the headers
    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent
    } catch (err) {
      logWebhookEvent('error', 'Webhook verification failed', { error: err })
      return NextResponse.json(
        { error: 'Webhook verification failed' },
        { status: 400 }
      )
    }

    // Handle the webhook
    const eventType = evt.type
    const eventData = evt.data

    logWebhookEvent('info', `Processing webhook event: ${eventType}`, { eventId: evt.data?.id })

    // Process different event types
    switch (eventType) {
      case 'user.created': {
        const userData = extractUserData(eventData)
        const result = await handleUserCreated(userData)

        return NextResponse.json({
          success: true,
          message: 'User created successfully',
          data: result
        })
      }

      case 'user.updated': {
        const userData = extractUserData(eventData)
        const result = await handleUserUpdated(userData)

        return NextResponse.json({
          success: true,
          message: 'User updated successfully',
          data: result
        })
      }

      case 'user.deleted': {
        const userId = eventData.id as string
        const result = await handleUserDeleted(userId)

        return NextResponse.json({
          success: true,
          message: 'User deleted successfully',
          data: result
        })
      }

      default: {
        logWebhookEvent('warn', `Unhandled webhook event type: ${eventType}`)
        return NextResponse.json({
          success: true,
          message: `Event type ${eventType} received but not processed`
        })
      }
    }

  } catch (error) {
    logWebhookEvent('error', 'Webhook processing failed', { error })

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
