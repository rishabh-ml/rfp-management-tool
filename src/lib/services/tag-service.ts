import { createClerkSupabaseClient } from '@/lib/supabase'
import type { Tag, TagInsert, TagUpdate, TagWithCreator } from '@/lib/types'

export class TagService {
  /**
   * Get all tags
   */
  static async getTags(): Promise<TagWithCreator[]> {
    try {
      const supabase = await createClerkSupabaseClient()

      const { data, error } = await supabase
        .from('tags')
        .select(`
          *,
          creator:users!tags_created_by_fkey(id, first_name, last_name, email, avatar_url)
        `)
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching tags:', error)
        return this.getMockTags()
      }

      return data || this.getMockTags()
    } catch (error) {
      console.error('Error in getTags:', error)
      return this.getMockTags()
    }
  }

  /**
   * Get mock tags for development
   * TODO: Remove once database is properly set up
   */
  private static getMockTags(): TagWithCreator[] {
    return [
      {
        id: '1',
        name: 'Web Development',
        color: '#3B82F6',
        created_by: '1',
        created_at: '2024-01-01T00:00:00.000Z',
        creator: {
          id: '1',
          clerk_id: 'user_admin',
          email: 'admin@company.com',
          first_name: 'Alice',
          last_name: 'Admin',
          avatar_url: null,
          role: 'admin',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z'
        }
      },
      {
        id: '2',
        name: 'Mobile App',
        color: '#10B981',
        created_by: '1',
        created_at: '2024-01-01T00:00:00.000Z',
        creator: {
          id: '1',
          clerk_id: 'user_admin',
          email: 'admin@company.com',
          first_name: 'Alice',
          last_name: 'Admin',
          avatar_url: null,
          role: 'admin',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z'
        }
      },
      {
        id: '3',
        name: 'E-commerce',
        color: '#F59E0B',
        created_by: '2',
        created_at: '2024-01-01T00:00:00.000Z',
        creator: {
          id: '2',
          clerk_id: 'user_manager',
          email: 'manager@company.com',
          first_name: 'Bob',
          last_name: 'Manager',
          avatar_url: null,
          role: 'manager',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z'
        }
      },
      {
        id: '4',
        name: 'Enterprise',
        color: '#8B5CF6',
        created_by: '2',
        created_at: '2024-01-01T00:00:00.000Z',
        creator: {
          id: '2',
          clerk_id: 'user_manager',
          email: 'manager@company.com',
          first_name: 'Bob',
          last_name: 'Manager',
          avatar_url: null,
          role: 'manager',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z'
        }
      },
      {
        id: '5',
        name: 'Urgent',
        color: '#EF4444',
        created_by: '1',
        created_at: '2024-01-01T00:00:00.000Z',
        creator: {
          id: '1',
          clerk_id: 'user_admin',
          email: 'admin@company.com',
          first_name: 'Alice',
          last_name: 'Admin',
          avatar_url: null,
          role: 'admin',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z'
        }
      }
    ]
  }

  /**
   * Get tag by ID
   */
  static async getTagById(tagId: string): Promise<TagWithCreator | null> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { data, error } = await supabase
        .from('tags')
        .select(`
          *,
          creator:users!tags_created_by_fkey(id, first_name, last_name, email, avatar_url)
        `)
        .eq('id', tagId)
        .single()

      if (error) {
        console.error('Error fetching tag by ID:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getTagById:', error)
      return null
    }
  }

  /**
   * Create a new tag
   */
  static async createTag(tagData: TagInsert): Promise<Tag | null> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { data, error } = await supabase
        .from('tags')
        .insert(tagData)
        .select()
        .single()

      if (error) {
        console.error('Error creating tag:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createTag:', error)
      return null
    }
  }

  /**
   * Update a tag
   */
  static async updateTag(tagId: string, updates: TagUpdate): Promise<Tag | null> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { data, error } = await supabase
        .from('tags')
        .update(updates)
        .eq('id', tagId)
        .select()
        .single()

      if (error) {
        console.error('Error updating tag:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in updateTag:', error)
      return null
    }
  }

  /**
   * Delete a tag
   */
  static async deleteTag(tagId: string): Promise<boolean> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId)

      if (error) {
        console.error('Error deleting tag:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteTag:', error)
      return false
    }
  }

  /**
   * Get tags for a specific project
   */
  static async getProjectTags(projectId: string): Promise<Tag[]> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { data, error } = await supabase
        .from('project_tags')
        .select(`
          tag:tags(id, name, color, created_by, created_at)
        `)
        .eq('project_id', projectId)

      if (error) {
        console.error('Error fetching project tags:', error)
        return []
      }

      return (data || []).map((pt: any) => pt.tag)
    } catch (error) {
      console.error('Error in getProjectTags:', error)
      return []
    }
  }

  /**
   * Get projects that have a specific tag
   */
  static async getProjectsWithTag(tagId: string): Promise<string[]> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { data, error } = await supabase
        .from('project_tags')
        .select('project_id')
        .eq('tag_id', tagId)

      if (error) {
        console.error('Error fetching projects with tag:', error)
        return []
      }

      return (data || []).map(pt => pt.project_id)
    } catch (error) {
      console.error('Error in getProjectsWithTag:', error)
      return []
    }
  }

  /**
   * Check if tag name is available
   */
  static async isTagNameAvailable(name: string, excludeId?: string): Promise<boolean> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      let query = supabase
        .from('tags')
        .select('id')
        .eq('name', name)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error checking tag name availability:', error)
        return false
      }

      return (data || []).length === 0
    } catch (error) {
      console.error('Error in isTagNameAvailable:', error)
      return false
    }
  }

  /**
   * Get tag usage statistics
   */
  static async getTagUsageStats(): Promise<Array<{ tag: Tag; usage_count: number }>> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { data, error } = await supabase
        .from('tags')
        .select(`
          *,
          project_tags(count)
        `)
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching tag usage stats:', error)
        return []
      }

      return (data || []).map(tag => ({
        tag: {
          id: tag.id,
          name: tag.name,
          color: tag.color,
          created_by: tag.created_by,
          created_at: tag.created_at
        },
        usage_count: tag.project_tags?.length || 0
      }))
    } catch (error) {
      console.error('Error in getTagUsageStats:', error)
      return []
    }
  }

  /**
   * Get most used tags
   */
  static async getMostUsedTags(limit: number = 10): Promise<Array<{ tag: Tag; usage_count: number }>> {
    try {
      const stats = await this.getTagUsageStats()
      return stats
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, limit)
    } catch (error) {
      console.error('Error in getMostUsedTags:', error)
      return []
    }
  }

  /**
   * Search tags by name
   */
  static async searchTags(query: string): Promise<Tag[]> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('name', { ascending: true })
        .limit(20)

      if (error) {
        console.error('Error searching tags:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in searchTags:', error)
      return []
    }
  }

  /**
   * Bulk create tags
   */
  static async bulkCreateTags(tagsData: TagInsert[]): Promise<Tag[]> {
    try {
      const supabase = await createClerkSupabaseClient()
      
      const { data, error } = await supabase
        .from('tags')
        .insert(tagsData)
        .select()

      if (error) {
        console.error('Error bulk creating tags:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in bulkCreateTags:', error)
      return []
    }
  }

  /**
   * Get or create tag by name
   */
  static async getOrCreateTag(name: string, color: string, createdBy: string): Promise<Tag | null> {
    try {
      // First, try to find existing tag
      const supabase = await createClerkSupabaseClient()
      
      const { data: existingTag, error: findError } = await supabase
        .from('tags')
        .select('*')
        .eq('name', name)
        .single()

      if (findError && findError.code !== 'PGRST116') {
        console.error('Error finding existing tag:', findError)
        return null
      }

      if (existingTag) {
        return existingTag
      }

      // Create new tag if not found
      return await this.createTag({
        name,
        color,
        created_by: createdBy
      })
    } catch (error) {
      console.error('Error in getOrCreateTag:', error)
      return null
    }
  }
}
