import { NextResponse } from 'next/server'
import { createClerkSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Checking database schema...')
    
    const supabase = await createClerkSupabaseClient()
    
    // Check what tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (tablesError) {
      // Fallback method - try to query specific tables
      const tableChecks = {
        users: false,
        projects: false,
        tags: false,
        project_tags: false,
        subtasks: false,
        comments: false
      }
      
      for (const tableName of Object.keys(tableChecks)) {
        try {
          const { error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1)
          
          tableChecks[tableName] = !error
        } catch {
          tableChecks[tableName] = false
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Schema check completed (fallback method)',
        tables: tableChecks,
        error: 'Could not access information_schema'
      })
    }
    
    // Check projects table columns specifically
    let projectsSchema = null
    try {
      const { data: columns } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'projects')
        .eq('table_schema', 'public')
      
      projectsSchema = columns
    } catch (error) {
      console.log('Could not get projects schema:', error)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database schema retrieved',
      data: {
        tables: tables?.map(t => t.table_name) || [],
        projectsSchema
      }
    })
    
  } catch (error) {
    console.error('Schema check failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Schema check failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
