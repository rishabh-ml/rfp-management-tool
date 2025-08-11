import { createClerkSupabaseClient } from '@/lib/supabase'
import type { Comment, CommentInsert, CommentUpdate, CommentWithUser } from '@/lib/types'

export class CommentService {
  /**
   * Get comments for a project
   */
  static async getProjectComments(projectId: string): Promise<CommentWithUser[]> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users(id, first_name, last_name, email, avatar_url, role)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching project comments:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getProjectComments:', error)
      return []
    }
  }

  /**
   * Get comment by ID
   */
  static async getCommentById(commentId: string): Promise<CommentWithUser | null> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users(id, first_name, last_name, email, avatar_url, role)
        `)
        .eq('id', commentId)
        .single()

      if (error) {
        console.error('Error fetching comment by ID:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getCommentById:', error)
      return null
    }
  }

  /**
   * Create a new comment
   */
  static async createComment(commentData: CommentInsert): Promise<CommentWithUser | null> {
    try {
      const supabase = await createClerkSupabaseClient()

      const { data, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select(`
          *,
          user:users(id, first_name, last_name, email, avatar_url, role)
        `)
        .single()

      if (error) {
        console.error('Error creating comment:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createComment:', error)
      return null
    }
  }

  // Mock methods removed for production

  /**
   * Update a comment
   */
  static async updateComment(commentId: string, updates: CommentUpdate): Promise<CommentWithUser | null> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { data, error } = await supabase
        .from('comments')
        .update(updates)
        .eq('id', commentId)
        .select(`
          *,
          user:users(id, first_name, last_name, email, avatar_url, role)
        `)
        .single()

      if (error) {
        console.error('Error updating comment:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in updateComment:', error)
      return null
    }
  }

  /**
   * Delete a comment
   */
  static async deleteComment(commentId: string): Promise<boolean> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) {
        console.error('Error deleting comment:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteComment:', error)
      return false
    }
  }

  /**
   * Get recent comments across all projects
   */
  static async getRecentComments(limit: number = 10): Promise<CommentWithUser[]> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users(id, first_name, last_name, email, avatar_url, role),
          project:projects(id, title)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching recent comments:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getRecentComments:', error)
      return []
    }
  }

  /**
   * Get comments by user
   */
  static async getUserComments(userId: string, limit?: number): Promise<CommentWithUser[]> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      let query = supabase
        .from('comments')
        .select(`
          *,
          user:users(id, first_name, last_name, email, avatar_url, role),
          project:projects(id, title)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching user comments:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserComments:', error)
      return []
    }
  }

  /**
   * Search comments by content
   */
  static async searchComments(query: string, projectId?: string): Promise<CommentWithUser[]> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      let dbQuery = supabase
        .from('comments')
        .select(`
          *,
          user:users(id, first_name, last_name, email, avatar_url, role),
          project:projects(id, title)
        `)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(50)

      if (projectId) {
        dbQuery = dbQuery.eq('project_id', projectId)
      }

      const { data, error } = await dbQuery

      if (error) {
        console.error('Error searching comments:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in searchComments:', error)
      return []
    }
  }

  /**
   * Get comment count for a project
   */
  static async getProjectCommentCount(projectId: string): Promise<number> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)

      if (error) {
        console.error('Error getting project comment count:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Error in getProjectCommentCount:', error)
      return 0
    }
  }

  /**
   * Get comment statistics
   */
  static async getCommentStats(): Promise<{
    total: number
    today: number
    this_week: number
    this_month: number
  }> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      // Get total count
      const { count: total } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })

      // Get today's count
      const { count: todayCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      // Get this week's count
      const { count: weekCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString())

      // Get this month's count
      const { count: monthCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthAgo.toISOString())

      return {
        total: total || 0,
        today: todayCount || 0,
        this_week: weekCount || 0,
        this_month: monthCount || 0
      }
    } catch (error) {
      console.error('Error in getCommentStats:', error)
      return {
        total: 0,
        today: 0,
        this_week: 0,
        this_month: 0
      }
    }
  }

  /**
   * Mark comment as edited
   */
  static async markCommentAsEdited(commentId: string): Promise<boolean> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { error } = await supabase
        .from('comments')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', commentId)

      if (error) {
        console.error('Error marking comment as edited:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in markCommentAsEdited:', error)
      return false
    }
  }
}
