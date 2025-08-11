import { createClerkSupabaseClient } from '@/lib/supabase'
import { currentUser } from '@clerk/nextjs/server'
import type { Database } from '@/lib/supabase'

type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

export class UserService {
  /**
   * Get current user from database using Clerk ID
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const clerkUser = await currentUser()
      if (!clerkUser) {
        console.log('No Clerk user found')
        return null
      }

      const supabase = await createClerkSupabaseClient()

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', clerkUser.id)
        .single()

      if (error) {
        console.error('Error fetching current user from database:', error)
        throw new Error('Failed to fetch user from database')
      }

      return data
    } catch (error) {
      console.error('Error in getCurrentUser:', error)
      return null
    }
  }

  // Mock methods removed for production

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user by ID:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getUserById:', error)
      return null
    }
  }

  /**
   * Get all users
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      const supabase = await createClerkSupabaseClient()

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('first_name', { ascending: true })

      if (error) {
        console.error('Error fetching all users:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllUsers:', error)
      return []
    }
  }

  // Mock methods removed for production

  /**
   * Update user profile
   */
  static async updateUser(userId: string, updates: UserUpdate): Promise<User | null> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in updateUser:', error)
      return null
    }
  }

  /**
   * Create or update user (used by webhook)
   */
  static async upsertUser(clerkId: string, userData: Partial<UserInsert>): Promise<User | null> {
    try {
      const supabase = await createClerkSupabaseClient()

      const { data, error } = await supabase
        .from('users')
        .upsert(
          {
            id: clerkId,  // Use id instead of clerk_id
            ...userData,
          },
          {
            onConflict: 'id',  // Conflict on id column
          }
        )
        .select()
        .single()

      if (error) {
        console.error('Error upserting user:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in upsertUser:', error)
      return null
    }
  }

  /**
   * Check if current user is admin
   */
  static async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      return user?.role === 'admin'
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: 'admin' | 'manager' | 'member'): Promise<User[]> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', role)
        .order('first_name', { ascending: true })

      if (error) {
        console.error('Error fetching users by role:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getUsersByRole:', error)
      return []
    }
  }

  /**
   * Get user display name
   */
  static getUserDisplayName(user: User): string {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    if (user.first_name) {
      return user.first_name
    }
    if (user.last_name) {
      return user.last_name
    }
    return user.email.split('@')[0] // Fallback to email username
  }

  /**
   * Get user initials for avatar
   */
  static getUserInitials(user: User): string {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    if (user.first_name) {
      return user.first_name[0].toUpperCase()
    }
    if (user.last_name) {
      return user.last_name[0].toUpperCase()
    }
    return user.email[0].toUpperCase()
  }
}
