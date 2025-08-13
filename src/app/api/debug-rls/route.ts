import { NextResponse } from 'next/server'
import { createClerkSupabaseClient } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing RLS and authentication...')
    
    const results = {
      withAuth: {},
      withoutAuth: {},
      authStatus: null
    }
    
    // Test with Clerk authentication
    try {
      console.log('Testing with Clerk auth...')
      const clerkSupabase = await createClerkSupabaseClient()
      
      const { data: authUser, error: userError } = await clerkSupabase.auth.getUser()
      results.authStatus = authUser ? 'authenticated' : 'not authenticated'
      
      const { data: projects, error: projectsError } = await clerkSupabase
        .from('projects')
        .select('id, title, rfp_title, client_name')
        .limit(5)
      
      const { data: tags, error: tagsError } = await clerkSupabase
        .from('tags')
        .select('id, name')
        .limit(5)
      
      const { data: users, error: usersError } = await clerkSupabase
        .from('users')
        .select('id, first_name, last_name, email')
        .limit(5)
      
      results.withAuth = {
        projects: projectsError ? { error: projectsError.message } : { count: projects?.length || 0, data: projects },
        tags: tagsError ? { error: tagsError.message } : { count: tags?.length || 0, data: tags },
        users: usersError ? { error: usersError.message } : { count: users?.length || 0, data: users }
      }
    } catch (error) {
      results.withAuth.error = error instanceof Error ? error.message : String(error)
    }
    
    // Test with service role (no RLS)
    try {
      console.log('Testing with anon key (RLS applies)...')
      
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, title, rfp_title, client_name')
        .limit(5)
      
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('id, name')
        .limit(5)
      
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .limit(5)
      
      results.withoutAuth = {
        projects: projectsError ? { error: projectsError.message } : { count: projects?.length || 0, data: projects },
        tags: tagsError ? { error: tagsError.message } : { count: tags?.length || 0, data: tags },
        users: usersError ? { error: usersError.message } : { count: users?.length || 0, data: users }
      }
    } catch (error) {
      results.withoutAuth.error = error instanceof Error ? error.message : String(error)
    }
    
    return NextResponse.json({
      success: true,
      message: 'RLS and auth test completed',
      results
    })
    
  } catch (error) {
    console.error('RLS test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'RLS test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
