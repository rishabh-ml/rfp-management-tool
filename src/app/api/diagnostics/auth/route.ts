import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '@/lib/supabase'

function decodeJwt(token: string | null) {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'))
    return payload
  } catch {
    return null
  }
}

export async function GET() {
  try {
  const { userId, getToken } = await auth()
  const token = await getToken()
    const decoded = decodeJwt(token)

    const supabase = await createClerkSupabaseClient()

    // Try to resolve current user id from DB via RLS helper
    const { data: currentUserId, error: rlsError } = await supabase.rpc('get_current_user_id')

    // Try a trivial select to confirm access
    const { data: usersProbe, error: usersError, status: usersStatus } = await supabase
      .from('users')
      .select('id, email')
      .limit(1)

    return NextResponse.json({
      clerk: {
        userId,
        hasToken: !!token,
        tokenAud: decoded?.aud,
        tokenSub: decoded?.sub,
        tokenIss: decoded?.iss,
        tokenRole: decoded?.role,
      },
      supabaseProbe: {
        currentUserId,
        rlsError: rlsError ? { message: rlsError.message, details: rlsError.details } : null,
        usersStatus,
        usersError: usersError ? { message: usersError.message, details: usersError.details } : null,
        usersProbe,
      },
    })
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
