import { NextResponse } from 'next/server'
import { createClerkSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing Supabase connection...')
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey
        }
      }, { status: 500 })
    }
    
    // Test basic connectivity
    console.log('Creating Supabase client...')
    const supabase = await createClerkSupabaseClient()
    
    // Simple query to test connection
    console.log('Testing query...')
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single()
    
    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: {
          message: error.message,
          code: error.code,
          hint: error.hint
        }
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      data: { queryResult: data }
    })
    
  } catch (error) {
    console.error('Connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error
    }, { status: 500 })
  }
}
