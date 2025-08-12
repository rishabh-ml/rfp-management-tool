import { createClient } from '@supabase/supabase-js'
import { auth, currentUser } from '@clerk/nextjs/server'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create Supabase client with service role for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export interface UserSyncResult {
  success: boolean
  userId?: string
  error?: string
  action?: 'created' | 'updated' | 'exists'
}

export class UserSyncService {
  /**
   * Sync current authenticated user from Clerk to Supabase
   */
  static async syncCurrentUser(): Promise<UserSyncResult> {
    try {
      const { userId } = await auth()
      if (!userId) {
        return { success: false, error: 'User not authenticated' }
      }

      const clerkUser = await currentUser()
      if (!clerkUser) {
        return { success: false, error: 'Clerk user not found' }
      }

      return await this.syncUserById(clerkUser.id, {
        email: clerkUser.emailAddresses[0]?.emailAddress || null,
        first_name: clerkUser.firstName || null,
        last_name: clerkUser.lastName || null,
        avatar_url: clerkUser.imageUrl || null
      })
    } catch (error) {
      console.error('Error syncing current user:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Sync a specific user by ID with provided data
   */
  static async syncUserById(
    userId: string, 
    userData: {
      email: string | null
      first_name: string | null
      last_name: string | null
      avatar_url: string | null
    }
  ): Promise<UserSyncResult> {
    try {
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        return { success: false, error: `Database error: ${checkError.message}` }
      }

      if (existingUser) {
        // User exists, update their data
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            avatar_url: userData.avatar_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (updateError) {
          return { success: false, error: `Update failed: ${updateError.message}` }
        }

        return { success: true, userId, action: 'updated' }
      } else {
        // User doesn't exist, create new user using the database function
        const { data: newUserId, error: createError } = await supabaseAdmin.rpc('sync_user_from_clerk', {
          p_id: userId,
          p_email: userData.email,
          p_first_name: userData.first_name,
          p_last_name: userData.last_name,
          p_avatar_url: userData.avatar_url
        })

        if (createError) {
          return { success: false, error: `Creation failed: ${createError.message}` }
        }

        return { success: true, userId: newUserId, action: 'created' }
      }
    } catch (error) {
      console.error('Error in syncUserById:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Check if a user exists in the database
   */
  static async userExists(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()

      return !error && !!data
    } catch (error) {
      console.error('Error checking user existence:', error)
      return false
    }
  }

  /**
   * Get user data from database
   */
  static async getUserData(userId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        throw new Error(`Failed to get user data: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error getting user data:', error)
      throw error
    }
  }

  /**
   * Soft delete a user (mark as inactive)
   */
  static async deactivateUser(userId: string): Promise<UserSyncResult> {
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        return { success: false, error: `Deactivation failed: ${error.message}` }
      }

      return { success: true, userId, action: 'updated' }
    } catch (error) {
      console.error('Error deactivating user:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Reactivate a user
   */
  static async reactivateUser(userId: string): Promise<UserSyncResult> {
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        return { success: false, error: `Reactivation failed: ${error.message}` }
      }

      return { success: true, userId, action: 'updated' }
    } catch (error) {
      console.error('Error reactivating user:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Bulk sync multiple users (useful for migration)
   */
  static async bulkSyncUsers(users: Array<{
    id: string
    email: string | null
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  }>): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0
    let failed = 0
    const errors: string[] = []

    for (const user of users) {
      const result = await this.syncUserById(user.id, {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url
      })

      if (result.success) {
        success++
      } else {
        failed++
        errors.push(`User ${user.id}: ${result.error}`)
      }
    }

    return { success, failed, errors }
  }
}
