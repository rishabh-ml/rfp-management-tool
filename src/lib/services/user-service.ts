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
        .eq('clerk_id', clerkUser.id)
        .single()

      if (error) {
        console.error('Error fetching current user from database:', error)
        // Return a mock user based on Clerk data if database query fails
        return this.createMockUserFromClerk(clerkUser)
      }

      return data
    } catch (error) {
      console.error('Error in getCurrentUser:', error)
      // Try to get Clerk user and create mock user
      try {
        const clerkUser = await currentUser()
        if (clerkUser) {
          return this.createMockUserFromClerk(clerkUser)
        }
      } catch (clerkError) {
        console.error('Error getting Clerk user:', clerkError)
      }
      return null
    }
  }

  /**
   * Create a mock user from Clerk user data
   * TODO: Remove this once database sync is working properly
   */
  private static createMockUserFromClerk(clerkUser: any): User {
    return {
      id: clerkUser.id,
      clerk_id: clerkUser.id,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || 'user@example.com',
      first_name: clerkUser.firstName || 'Demo',
      last_name: clerkUser.lastName || 'User',
      avatar_url: clerkUser.imageUrl || null,
      role: 'member',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

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
        return this.getMockUsers()
      }

      return data || this.getMockUsers()
    } catch (error) {
      console.error('Error in getAllUsers:', error)
      return this.getMockUsers()
    }
  }

  /**
   * Get mock users for development
   * TODO: Remove once database is properly set up
   */
  private static getMockUsers(): User[] {
    return [
      {
        id: '1',
        clerk_id: 'user_admin',
        email: 'admin@company.com',
        first_name: 'Alice',
        last_name: 'Admin',
        avatar_url: null,
        role: 'admin',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '2',
        clerk_id: 'user_manager',
        email: 'manager@company.com',
        first_name: 'Bob',
        last_name: 'Manager',
        avatar_url: null,
        role: 'manager',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '3',
        clerk_id: 'user_member1',
        email: 'john@company.com',
        first_name: 'John',
        last_name: 'Developer',
        avatar_url: null,
        role: 'member',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '4',
        clerk_id: 'user_member2',
        email: 'sarah@company.com',
        first_name: 'Sarah',
        last_name: 'Designer',
        avatar_url: null,
        role: 'member',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      }
    ]
  }

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
            clerk_id: clerkId,
            ...userData,
          },
          {
            onConflict: 'clerk_id',
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
