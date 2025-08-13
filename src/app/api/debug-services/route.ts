import { NextResponse } from 'next/server'
import { ProjectService } from '@/lib/services/project-service'
import { UserService } from '@/lib/services/user-service'
import { TagService } from '@/lib/services/tag-service'

export async function GET() {
  try {
    console.log('Testing individual services...')
    
    const results = {
      users: null as any,
      tags: null as any,
      projects: null as any,
      errors: {
        users: null as string | null,
        tags: null as string | null,
        projects: null as string | null
      }
    }
    
    // Test UserService
    try {
      console.log('Testing UserService.getAllUsers()...')
      const users = await UserService.getAllUsers()
      results.users = { count: users.length, sample: users[0] }
      console.log(`Users: ${users.length} found`)
    } catch (error) {
      console.error('UserService error:', error)
      results.errors.users = error instanceof Error ? error.message : String(error)
    }
    
    // Test TagService
    try {
      console.log('Testing TagService.getTags()...')
      const tags = await TagService.getTags()
      results.tags = { count: tags.length, sample: tags[0] }
      console.log(`Tags: ${tags.length} found`)
    } catch (error) {
      console.error('TagService error:', error)
      results.errors.tags = error instanceof Error ? error.message : String(error)
    }
    
    // Test ProjectService
    try {
      console.log('Testing ProjectService.getProjects()...')
      const projects = await ProjectService.getProjects()
      results.projects = { count: projects.length, sample: projects[0] }
      console.log(`Projects: ${projects.length} found`)
    } catch (error) {
      console.error('ProjectService error:', error)
      results.errors.projects = error instanceof Error ? error.message : String(error)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Service test completed',
      results
    })
    
  } catch (error) {
    console.error('Service test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Service test failed',
      details: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error
    }, { status: 500 })
  }
}
