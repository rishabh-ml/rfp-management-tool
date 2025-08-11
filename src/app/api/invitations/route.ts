import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '@/lib/supabase'
import { z } from 'zod'

const createInvitationSchema = z.object({
  emails: z.array(z.string().email()),
  role: z.enum(['admin', 'manager', 'member']),
  message: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { emails, role, message } = createInvitationSchema.parse(body)

    const supabase = await createClerkSupabaseClient()

    // Get current user
    const { data: currentUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('clerk_id', userId)
      .single()

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has permission to invite (admin only for now)
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check for existing users with these emails
    const { data: existingUsers } = await supabase
      .from('users')
      .select('email')
      .in('email', emails)

    const existingEmails = existingUsers?.map(u => u.email) || []
    const newEmails = emails.filter(email => !existingEmails.includes(email))

    if (newEmails.length === 0) {
      return NextResponse.json({ 
        error: 'All provided emails are already registered users',
        existing_emails: existingEmails
      }, { status: 400 })
    }

    // Check for existing pending invitations
    const { data: existingInvitations } = await supabase
      .from('invitations')
      .select('email')
      .in('email', newEmails)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())

    const pendingEmails = existingInvitations?.map(i => i.email) || []
    const emailsToInvite = newEmails.filter(email => !pendingEmails.includes(email))

    if (emailsToInvite.length === 0) {
      return NextResponse.json({ 
        error: 'All emails already have pending invitations',
        pending_emails: pendingEmails,
        existing_emails: existingEmails
      }, { status: 400 })
    }

    // Create invitations using the database function
    const invitations = []
    for (const email of emailsToInvite) {
      const { data: invitationId, error } = await supabase
        .rpc('create_invitation', {
          p_email: email,
          p_role: role,
          p_invited_by: currentUser.id
        })

      if (error) {
        console.error('Error creating invitation:', error)
        continue
      }

      invitations.push({
        id: invitationId,
        email,
        role,
        invited_by: currentUser.id
      })
    }

    // Email sending would be implemented here with your preferred email service
    
    return NextResponse.json({
      message: `Successfully created ${invitations.length} invitation(s)`,
      invitations,
      skipped: {
        existing_users: existingEmails,
        pending_invitations: pendingEmails
      }
    }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClerkSupabaseClient()

    // Get current user
    const { data: currentUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('clerk_id', userId)
      .single()

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check permissions (admin and manager can view invitations)
    if (!['admin', 'manager'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get invitations
    const { data: invitations, error } = await supabase
      .from('invitations')
      .select(`
        *,
        invited_by_user:users!invitations_invited_by_fkey(id, first_name, last_name, email),
        accepted_by_user:users!invitations_accepted_by_fkey(id, first_name, last_name, email)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invitations:', error)
      return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
    }

    return NextResponse.json({ invitations })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
