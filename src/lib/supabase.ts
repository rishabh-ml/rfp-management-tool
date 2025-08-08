import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

// TODO: Add proper error handling for missing environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a Supabase client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create a Supabase client with Clerk JWT for server-side operations
export async function createClerkSupabaseClient() {
  try {
    const { getToken } = await auth()

    // Try to get the Clerk JWT token with 'supabase' template
    let token: string | null = null

    try {
      token = await getToken({ template: 'supabase' })
    } catch (error) {
      console.warn('Supabase JWT template not found in Clerk. Using default token.')
      // Fallback to default token if 'supabase' template doesn't exist
      token = await getToken()
    }

    if (!token) {
      console.warn('No Clerk token available, using anonymous Supabase client')
      // Return anonymous client if no token available
      return createClient(supabaseUrl, supabaseAnonKey)
    }

    // Create Supabase client with Clerk JWT
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })
  } catch (error) {
    console.error('Error creating Clerk Supabase client:', error)
    // Fallback to anonymous client
    return createClient(supabaseUrl, supabaseAnonKey)
  }
}

// Create a Supabase client for client-side operations with Clerk JWT
export function createClerkSupabaseClientComponent() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${getClerkToken()}`,
      },
    },
  })
}

// Helper function to get Clerk token on client side
function getClerkToken(): string {
  // This will be implemented when we set up the Clerk provider
  // For now, return empty string
  // TODO: Implement proper client-side token retrieval
  return ''
}

// Database types (will be generated from Supabase)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          clerk_id: string
          email: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          role: 'admin' | 'manager' | 'member'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'member'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'member'
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          stage: 'unassigned' | 'assigned' | 'submitted' | 'skipped' | 'won' | 'lost'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          due_date: string | null
          owner_id: string | null
          progress_percentage: number
          status_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          stage?: 'unassigned' | 'assigned' | 'submitted' | 'skipped' | 'won' | 'lost'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          owner_id?: string | null
          progress_percentage?: number
          status_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          stage?: 'unassigned' | 'assigned' | 'submitted' | 'skipped' | 'won' | 'lost'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          owner_id?: string | null
          progress_percentage?: number
          status_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_by?: string | null
          created_at?: string
        }
      }
      project_tags: {
        Row: {
          project_id: string
          tag_id: string
        }
        Insert: {
          project_id: string
          tag_id: string
        }
        Update: {
          project_id?: string
          tag_id?: string
        }
      }
      comments: {
        Row: {
          id: string
          project_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      subtasks: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          assigned_to: string | null
          completed: boolean
          due_date: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          assigned_to?: string | null
          completed?: boolean
          due_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          assigned_to?: string | null
          completed?: boolean
          due_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
