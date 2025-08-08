// Core domain types for RFP Management Tool

export type ProjectStage = 'unassigned' | 'assigned' | 'submitted' | 'skipped' | 'won' | 'lost'
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent'
export type UserRole = 'admin' | 'manager' | 'member'

// User types
export interface User {
  id: string
  clerk_id: string
  email: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface UserInsert {
  id?: string
  clerk_id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  avatar_url?: string | null
  role?: UserRole
  created_at?: string
  updated_at?: string
}

export interface UserUpdate {
  id?: string
  clerk_id?: string
  email?: string
  first_name?: string | null
  last_name?: string | null
  avatar_url?: string | null
  role?: UserRole
  created_at?: string
  updated_at?: string
}

// Project types
export interface Project {
  id: string
  title: string
  description: string | null
  stage: ProjectStage
  priority: ProjectPriority
  due_date: string | null
  owner_id: string | null
  progress_percentage: number
  status_notes: string | null
  created_at: string
  updated_at: string
}

export interface ProjectInsert {
  id?: string
  title: string
  description?: string | null
  stage?: ProjectStage
  priority?: ProjectPriority
  due_date?: string | null
  owner_id?: string | null
  progress_percentage?: number
  status_notes?: string | null
  created_at?: string
  updated_at?: string
}

export interface ProjectUpdate {
  id?: string
  title?: string
  description?: string | null
  stage?: ProjectStage
  priority?: ProjectPriority
  due_date?: string | null
  owner_id?: string | null
  progress_percentage?: number
  status_notes?: string | null
  created_at?: string
  updated_at?: string
}

// Enhanced project with related data
export interface ProjectWithDetails extends Project {
  owner?: User | null
  tags?: Tag[]
  comments?: CommentWithUser[]
  subtasks?: SubtaskWithUser[]
  _count?: {
    comments: number
    subtasks: number
    completed_subtasks: number
  }
}

// Tag types
export interface Tag {
  id: string
  name: string
  color: string
  created_by: string | null
  created_at: string
}

export interface TagInsert {
  id?: string
  name: string
  color?: string
  created_by?: string | null
  created_at?: string
}

export interface TagUpdate {
  id?: string
  name?: string
  color?: string
  created_by?: string | null
  created_at?: string
}

export interface TagWithCreator extends Tag {
  creator?: User | null
}

// Project-Tag junction
export interface ProjectTag {
  project_id: string
  tag_id: string
}

// Comment types
export interface Comment {
  id: string
  project_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface CommentInsert {
  id?: string
  project_id: string
  user_id: string
  content: string
  created_at?: string
  updated_at?: string
}

export interface CommentUpdate {
  id?: string
  project_id?: string
  user_id?: string
  content?: string
  created_at?: string
  updated_at?: string
}

export interface CommentWithUser extends Comment {
  user: User
}

// Subtask types
export interface Subtask {
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

export interface SubtaskInsert {
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

export interface SubtaskUpdate {
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

export interface SubtaskWithUser extends Subtask {
  assignee?: User | null
  creator?: User | null
}

// Activity log types
export interface ActivityLog {
  id: string
  project_id: string
  user_id: string | null
  action: string
  details: Record<string, any> | null
  created_at: string
}

export interface ActivityLogWithUser extends ActivityLog {
  user?: User | null
  project?: Project
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Filter and sort types
export interface ProjectFilters {
  stage?: ProjectStage[]
  priority?: ProjectPriority[]
  owner_id?: string[]
  tag_ids?: string[]
  due_date_from?: string
  due_date_to?: string
  search?: string
}

export interface ProjectSort {
  field: 'title' | 'created_at' | 'updated_at' | 'due_date' | 'priority' | 'progress_percentage'
  direction: 'asc' | 'desc'
}

// Kanban board types
export interface KanbanColumn {
  id: ProjectStage
  title: string
  projects: ProjectWithDetails[]
  color: string
}

export interface DragResult {
  draggableId: string
  type: string
  source: {
    droppableId: string
    index: number
  }
  destination?: {
    droppableId: string
    index: number
  } | null
}

// Form types
export interface ProjectFormData {
  title: string
  description?: string
  priority: ProjectPriority
  due_date?: string
  owner_id?: string
  tag_ids?: string[]
}

export interface CommentFormData {
  content: string
}

export interface SubtaskFormData {
  title: string
  description?: string
  assigned_to?: string
  due_date?: string
}

export interface TagFormData {
  name: string
  color: string
}

// Statistics types
export interface ProjectStats {
  total: number
  by_stage: Record<ProjectStage, number>
  by_priority: Record<ProjectPriority, number>
  overdue: number
  due_this_week: number
  completed_this_month: number
}

export interface UserWorkload {
  user_id: string
  user: User
  total_projects: number
  by_stage: Record<ProjectStage, number>
  overdue_projects: number
  avg_progress: number
}

// Notification types
export interface Notification {
  id: string
  type: 'assignment' | 'due_date' | 'comment' | 'stage_change' | 'subtask'
  title: string
  message: string
  project_id?: string
  user_id: string
  read: boolean
  created_at: string
}

// Real-time event types
export interface RealtimeEvent {
  type: 'project_updated' | 'comment_added' | 'subtask_updated' | 'user_assigned'
  payload: any
  timestamp: string
  user_id?: string
}
