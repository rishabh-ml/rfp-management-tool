import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

// TODO: Add proper error handling for missing environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a Supabase client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create a Supabase client with Clerk JWT for server-side operations using native TPA integration
export async function createClerkSupabaseClient() {
  try {
    const { getToken } = await auth()

    // Create Supabase client with native TPA integration
    // This uses the new accessToken() method instead of Authorization headers
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: (input, init) => {
          console.log('Supabase fetch request:', input)
          return fetch(input, init)
        }
      },
      async accessToken() {
        try {
          // Get the Clerk session token - no custom template needed with TPA
          const token = await getToken()
          return token ?? null
        } catch (error) {
          console.error('Error getting Clerk token:', error)
          return null
        }
      },
    })
  } catch (error) {
    console.error('Error creating Clerk Supabase client:', error)
    // Fallback to anonymous client
    return createClient(supabaseUrl, supabaseAnonKey)
  }
}

// Create a Supabase client for client-side operations with Clerk JWT using native TPA integration
// Note: For client-side operations, prefer using the useRealtime hook which handles token management
export function createClerkSupabaseClientComponent(getToken: () => Promise<string | null>) {
  try {
    // Create Supabase client with native TPA integration for client-side
    return createClient(supabaseUrl, supabaseAnonKey, {
      async accessToken() {
        const token = await getToken()
        return token ?? null
      },
    })
  } catch (error) {
    console.error('Error creating client-side Clerk Supabase client:', error)
    return createClient(supabaseUrl, supabaseAnonKey)
  }
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
