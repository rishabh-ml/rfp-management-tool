// Test database connection and run schema update
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

async function runDatabaseUpdate() {
  try {
    // Load environment variables
    require('dotenv').config({ path: '.env.local' })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables:')
      console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
      console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
      return
    }

    console.log('Connecting to Supabase...')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Testing current schema...')
    
    // First, test if the new columns exist
    const { data: existingProjects, error: testError } = await supabase
      .from('projects')
      .select('id, title')
      .limit(1)

    if (testError) {
      console.error('Database connection error:', testError)
      return
    }

    console.log('✅ Database connection successful!')
    
    // Test if new columns exist
    const { data: columnTest, error: columnError } = await supabase
      .from('projects')
      .select('rfp_added_date, portal_url')
      .limit(1)

    if (columnError && columnError.code === 'PGRST116') {
      console.log('❌ New columns do not exist. Schema needs to be updated.')
      console.log('Please run the schema update manually in Supabase SQL Editor:')
      console.log('File: database/04_enhanced_projects_schema.sql')
    } else {
      console.log('✅ New columns already exist or schema is updated!')
    }

  } catch (error) {
    console.error('Script error:', error)
  }
}

runDatabaseUpdate()
