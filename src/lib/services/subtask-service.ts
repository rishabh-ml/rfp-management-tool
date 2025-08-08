import { createClerkSupabaseClient } from '@/lib/supabase'
import type { Subtask, SubtaskInsert, SubtaskUpdate, SubtaskWithUser } from '@/lib/types'

export class SubtaskService {
  /**
   * Get subtasks for a project
   */
  static async getProjectSubtasks(projectId: string): Promise<SubtaskWithUser[]> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { data, error } = await supabase
        .from('subtasks')
        .select(`
          *,
          assignee:users!subtasks_assigned_to_fkey(id, first_name, last_name, email, avatar_url, role),
          creator:users!subtasks_created_by_fkey(id, first_name, last_name, email, avatar_url, role)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching project subtasks:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getProjectSubtasks:', error)
      return []
    }
  }

  /**
   * Get subtask by ID
   */
  static async getSubtaskById(subtaskId: string): Promise<SubtaskWithUser | null> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { data, error } = await supabase
        .from('subtasks')
        .select(`
          *,
          assignee:users!subtasks_assigned_to_fkey(id, first_name, last_name, email, avatar_url, role),
          creator:users!subtasks_created_by_fkey(id, first_name, last_name, email, avatar_url, role),
          project:projects(id, title)
        `)
        .eq('id', subtaskId)
        .single()

      if (error) {
        console.error('Error fetching subtask by ID:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getSubtaskById:', error)
      return null
    }
  }

  /**
   * Create a new subtask
   */
  static async createSubtask(subtaskData: SubtaskInsert): Promise<SubtaskWithUser | null> {
    try {
      const supabase = await createClerkSupabaseClient()

      const { data, error } = await supabase
        .from('subtasks')
        .insert(subtaskData)
        .select(`
          *,
          assignee:users!subtasks_assigned_to_fkey(id, first_name, last_name, email, avatar_url, role),
          creator:users!subtasks_created_by_fkey(id, first_name, last_name, email, avatar_url, role)
        `)
        .single()

      if (error) {
        console.error('Error creating subtask:', error)
        // Return mock subtask for demo purposes
        return this.createMockSubtask(subtaskData)
      }

      return data
    } catch (error) {
      console.error('Error in createSubtask:', error)
      // Return mock subtask for demo purposes
      return this.createMockSubtask(subtaskData)
    }
  }

  /**
   * Create a mock subtask for demo purposes
   * TODO: Remove once database is properly set up
   */
  private static createMockSubtask(subtaskData: SubtaskInsert): SubtaskWithUser {
    const now = new Date().toISOString()
    return {
      id: `subtask_${Date.now()}`,
      project_id: subtaskData.project_id,
      title: subtaskData.title,
      description: subtaskData.description || null,
      assigned_to: subtaskData.assigned_to || null,
      completed: false,
      due_date: subtaskData.due_date || null,
      created_by: subtaskData.created_by || null,
      created_at: now,
      updated_at: now,
      assignee: null,
      creator: subtaskData.created_by ? {
        id: subtaskData.created_by,
        clerk_id: 'demo_user',
        email: 'demo@example.com',
        first_name: 'Demo',
        last_name: 'User',
        avatar_url: null,
        role: 'member',
        created_at: now,
        updated_at: now
      } : null
    }
  }

  /**
   * Update a subtask
   */
  static async updateSubtask(subtaskId: string, updates: SubtaskUpdate): Promise<SubtaskWithUser | null> {
    try {
      const supabase = await createClerkSupabaseClient()

      const { data, error } = await supabase
        .from('subtasks')
        .update(updates)
        .eq('id', subtaskId)
        .select(`
          *,
          assignee:users!subtasks_assigned_to_fkey(id, first_name, last_name, email, avatar_url, role),
          creator:users!subtasks_created_by_fkey(id, first_name, last_name, email, avatar_url, role)
        `)
        .single()

      if (error) {
        console.error('Error updating subtask:', error)
        // Return mock updated subtask for demo purposes
        return this.createMockUpdatedSubtask(subtaskId, updates)
      }

      return data
    } catch (error) {
      console.error('Error in updateSubtask:', error)
      // Return mock updated subtask for demo purposes
      return this.createMockUpdatedSubtask(subtaskId, updates)
    }
  }

  /**
   * Create a mock updated subtask for demo purposes
   * TODO: Remove once database is properly set up
   */
  private static createMockUpdatedSubtask(subtaskId: string, updates: SubtaskUpdate): SubtaskWithUser {
    const now = new Date().toISOString()
    return {
      id: subtaskId,
      project_id: 'demo_project',
      title: 'Demo Subtask',
      description: null,
      assigned_to: null,
      completed: updates.completed ?? false,
      due_date: null,
      created_by: 'demo_user',
      created_at: now,
      updated_at: now,
      assignee: null,
      creator: {
        id: 'demo_user',
        clerk_id: 'demo_user',
        email: 'demo@example.com',
        first_name: 'Demo',
        last_name: 'User',
        avatar_url: null,
        role: 'member',
        created_at: now,
        updated_at: now
      }
    }
  }

  /**
   * Toggle subtask completion
   */
  static async toggleSubtaskCompletion(subtaskId: string): Promise<SubtaskWithUser | null> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      // First get current completion status
      const { data: currentSubtask, error: fetchError } = await supabase
        .from('subtasks')
        .select('completed')
        .eq('id', subtaskId)
        .single()

      if (fetchError) {
        console.error('Error fetching current subtask:', fetchError)
        return null
      }

      // Toggle completion
      const { data, error } = await supabase
        .from('subtasks')
        .update({ completed: !currentSubtask.completed })
        .eq('id', subtaskId)
        .select(`
          *,
          assignee:users!subtasks_assigned_to_fkey(id, first_name, last_name, email, avatar_url, role),
          creator:users!subtasks_created_by_fkey(id, first_name, last_name, email, avatar_url, role)
        `)
        .single()

      if (error) {
        console.error('Error toggling subtask completion:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in toggleSubtaskCompletion:', error)
      return null
    }
  }

  /**
   * Delete a subtask
   */
  static async deleteSubtask(subtaskId: string): Promise<boolean> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', subtaskId)

      if (error) {
        console.error('Error deleting subtask:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteSubtask:', error)
      return false
    }
  }

  /**
   * Get subtasks assigned to a user
   */
  static async getUserSubtasks(userId: string, includeCompleted: boolean = true): Promise<SubtaskWithUser[]> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      let query = supabase
        .from('subtasks')
        .select(`
          *,
          assignee:users!subtasks_assigned_to_fkey(id, first_name, last_name, email, avatar_url, role),
          creator:users!subtasks_created_by_fkey(id, first_name, last_name, email, avatar_url, role),
          project:projects(id, title, stage)
        `)
        .eq('assigned_to', userId)
        .order('due_date', { ascending: true, nullsFirst: false })

      if (!includeCompleted) {
        query = query.eq('completed', false)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching user subtasks:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserSubtasks:', error)
      return []
    }
  }

  /**
   * Get overdue subtasks
   */
  static async getOverdueSubtasks(userId?: string): Promise<SubtaskWithUser[]> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      let query = supabase
        .from('subtasks')
        .select(`
          *,
          assignee:users!subtasks_assigned_to_fkey(id, first_name, last_name, email, avatar_url, role),
          creator:users!subtasks_created_by_fkey(id, first_name, last_name, email, avatar_url, role),
          project:projects(id, title, stage)
        `)
        .eq('completed', false)
        .not('due_date', 'is', null)
        .lt('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })

      if (userId) {
        query = query.eq('assigned_to', userId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching overdue subtasks:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getOverdueSubtasks:', error)
      return []
    }
  }

  /**
   * Get subtasks due soon
   */
  static async getSubtasksDueSoon(days: number = 7, userId?: string): Promise<SubtaskWithUser[]> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const now = new Date()
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

      let query = supabase
        .from('subtasks')
        .select(`
          *,
          assignee:users!subtasks_assigned_to_fkey(id, first_name, last_name, email, avatar_url, role),
          creator:users!subtasks_created_by_fkey(id, first_name, last_name, email, avatar_url, role),
          project:projects(id, title, stage)
        `)
        .eq('completed', false)
        .not('due_date', 'is', null)
        .gte('due_date', now.toISOString())
        .lte('due_date', futureDate.toISOString())
        .order('due_date', { ascending: true })

      if (userId) {
        query = query.eq('assigned_to', userId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching subtasks due soon:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getSubtasksDueSoon:', error)
      return []
    }
  }

  /**
   * Get subtask completion statistics for a project
   */
  static async getProjectSubtaskStats(projectId: string): Promise<{
    total: number
    completed: number
    pending: number
    overdue: number
    completion_rate: number
  }> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { data, error } = await supabase
        .from('subtasks')
        .select('completed, due_date')
        .eq('project_id', projectId)

      if (error) {
        console.error('Error fetching project subtask stats:', error)
        return {
          total: 0,
          completed: 0,
          pending: 0,
          overdue: 0,
          completion_rate: 0
        }
      }

      const subtasks = data || []
      const total = subtasks.length
      const completed = subtasks.filter(st => st.completed).length
      const pending = total - completed
      
      const now = new Date()
      const overdue = subtasks.filter(st => 
        !st.completed && 
        st.due_date && 
        new Date(st.due_date) < now
      ).length

      const completion_rate = total > 0 ? (completed / total) * 100 : 0

      return {
        total,
        completed,
        pending,
        overdue,
        completion_rate: Math.round(completion_rate * 100) / 100
      }
    } catch (error) {
      console.error('Error in getProjectSubtaskStats:', error)
      return {
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
        completion_rate: 0
      }
    }
  }

  /**
   * Assign subtask to user
   */
  static async assignSubtask(subtaskId: string, assigneeId: string): Promise<SubtaskWithUser | null> {
    try {
      return await this.updateSubtask(subtaskId, { assigned_to: assigneeId })
    } catch (error) {
      console.error('Error in assignSubtask:', error)
      return null
    }
  }

  /**
   * Unassign subtask
   */
  static async unassignSubtask(subtaskId: string): Promise<SubtaskWithUser | null> {
    try {
      return await this.updateSubtask(subtaskId, { assigned_to: null })
    } catch (error) {
      console.error('Error in unassignSubtask:', error)
      return null
    }
  }

  /**
   * Bulk update subtasks
   */
  static async bulkUpdateSubtasks(
    subtaskIds: string[], 
    updates: SubtaskUpdate
  ): Promise<boolean> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { error } = await supabase
        .from('subtasks')
        .update(updates)
        .in('id', subtaskIds)

      if (error) {
        console.error('Error bulk updating subtasks:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in bulkUpdateSubtasks:', error)
      return false
    }
  }
}
