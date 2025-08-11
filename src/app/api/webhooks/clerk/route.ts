import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

// TODO: Add proper error handling and logging
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.text()

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data
    const primaryEmail = email_addresses[0]?.email_address

    if (!primaryEmail) {
      console.error('No primary email found for user:', id)
      return new Response('No email address', { status: 400 })
    }

    try {
      // Use the database function to sync user
      const { data: userId, error } = await supabase.rpc('sync_user_from_clerk', {
        p_clerk_id: id,
        p_email: primaryEmail,
        p_first_name: first_name || null,
        p_last_name: last_name || null,
        p_avatar_url: image_url || null
      })

      if (error) {
        console.error('Error syncing user to Supabase:', error)
        return new Response('Error creating user', { status: 500 })
      }

      console.log('User created successfully:', userId)

      // Check if user was invited and update their role
      const { data: invitation } = await supabase
        .from('invitations')
        .select('role')
        .eq('email', primaryEmail)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (invitation) {
        // Update user role based on invitation
        await supabase
          .from('users')
          .update({ role: invitation.role })
          .eq('id', userId)

        // Mark invitation as accepted
        await supabase
          .from('invitations')
          .update({
            accepted_at: new Date().toISOString(),
            accepted_by: userId
          })
          .eq('email', primaryEmail)

        console.log(`User role updated to ${invitation.role} based on invitation`)
      }

    } catch (error) {
      console.error('Error processing user.created webhook:', error)
      return new Response('Error processing webhook', { status: 500 })
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    try {
      // Update user in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          email: email_addresses[0]?.email_address || '',
          first_name: first_name || null,
          last_name: last_name || null,
          avatar_url: image_url || null,
        })
        .eq('clerk_id', id)

      if (error) {
        console.error('Error updating user in Supabase:', error)
        return new Response('Error updating user', { status: 500 })
      }

      console.log('User updated successfully:', id)
    } catch (error) {
      console.error('Error processing user.updated webhook:', error)
      return new Response('Error processing webhook', { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    try {
      // Soft delete user (set is_active to false instead of hard delete)
      const { error } = await supabase
        .from('users')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('clerk_id', id)

      if (error) {
        console.error('Error deactivating user in Supabase:', error)
        return new Response('Error deactivating user', { status: 500 })
      }

      console.log('User deactivated successfully:', id)
    } catch (error) {
      console.error('Error processing user.deleted webhook:', error)
      return new Response('Error processing webhook', { status: 500 })
    }
  }

  return new Response('', { status: 200 })
}
