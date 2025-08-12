// Core domain types for RFP Management Tool

export type ProjectStage = 'unassigned' | 'assigned' | 'reviewed' | 'submitted' | 'skipped' | 'won' | 'lost'
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent'
export type PriorityBanding = 'P1' | 'P2' | 'P3' | 'No bid'
export type CompanyType = 'DatamanHealth' | 'DatamanUSA' | 'CCSI'
export type UserRole = 'admin' | 'manager' | 'member'

// User types
export interface User {
  id: string                    // Clerk user ID (TEXT)
  email: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
  // Extended profile fields
  phone?: string | null
  location?: string | null
  bio?: string | null
  timezone?: string | null
  job_title?: string | null
  department?: string | null
}

export interface UserInsert {
  id: string                    // Clerk user ID (required)
  email: string
  first_name?: string | null
  last_name?: string | null
  avatar_url?: string | null
  role?: UserRole
  is_active?: boolean
  last_login_at?: string | null
  created_at?: string
  updated_at?: string
  // Extended profile fields
  phone?: string | null
  location?: string | null
  bio?: string | null
  timezone?: string | null
  job_title?: string | null
  department?: string | null
}

export interface UserUpdate {
  email?: string
  first_name?: string | null
  last_name?: string | null
  avatar_url?: string | null
  role?: UserRole
  is_active?: boolean
  last_login_at?: string | null
  updated_at?: string
  // Extended profile fields
  phone?: string | null
  location?: string | null
  bio?: string | null
  timezone?: string | null
  job_title?: string | null
  department?: string | null
}

// Project types
export interface Project {
  id: string
  title: string
  description: string | null
  stage: ProjectStage
  priority: ProjectPriority
  due_date: string | null
  owner_id: string                    // Required in database schema
  progress_percentage: number
  status_notes: string | null
  estimated_hours: number | null
  actual_hours: number | null
  budget_amount: number | null
  client_name: string | null
  client_email: string | null
  rfp_document_url: string | null
  submission_url: string | null
  is_archived: boolean
  created_at: string
  updated_at: string
  // New RFP-specific fields
  rfp_added_date: string | null
  rfp_title: string | null
  state: string | null
  portal_url: string | null
  folder_url: string | null
  // Post-review fields (using string types for database compatibility)
  priority_banding: string | null
  review_comment: string | null
  assigned_to: string | null
  company_assignment: string | null
}

export interface ProjectInsert {
  id?: string
  title: string
  description?: string | null
  stage?: ProjectStage
  priority?: ProjectPriority
  due_date?: string | null
  owner_id: string                    // Required in database schema
  progress_percentage?: number
  status_notes?: string | null
  estimated_hours?: number | null
  actual_hours?: number | null
  budget_amount?: number | null
  client_name?: string | null
  client_email?: string | null
  rfp_document_url?: string | null
  submission_url?: string | null
  is_archived?: boolean
  created_at?: string
  updated_at?: string
  // New RFP-specific fields
  rfp_added_date?: string | null
  rfp_title?: string | null
  state?: string | null
  portal_url?: string | null
  folder_url?: string | null
  // Post-review fields (using string types for database compatibility)
  priority_banding?: string | null
  review_comment?: string | null
  assigned_to?: string | null
  company_assignment?: string | null
}

export interface ProjectUpdate {
  title?: string
  description?: string | null
  stage?: ProjectStage
  priority?: ProjectPriority
  due_date?: string | null
  owner_id?: string
  progress_percentage?: number
  status_notes?: string | null
  estimated_hours?: number | null
  actual_hours?: number | null
  budget_amount?: number | null
  client_name?: string | null
  client_email?: string | null
  rfp_document_url?: string | null
  submission_url?: string | null
  is_archived?: boolean
  updated_at?: string
  // New RFP-specific fields
  rfp_added_date?: string | null
  rfp_title?: string | null
  state?: string | null
  portal_url?: string | null
  folder_url?: string | null
  // Post-review fields (using string types for database compatibility)
  priority_banding?: string | null
  review_comment?: string | null
  assigned_to?: string | null
  company_assignment?: string | null
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
  parent_id: string | null
  is_edited: boolean
  created_at: string
  updated_at: string
}

export interface CommentInsert {
  id?: string
  project_id: string
  user_id: string
  content: string
  parent_id?: string | null
  is_edited?: boolean
  created_at?: string
  updated_at?: string
}

export interface CommentUpdate {
  content?: string
  is_edited?: boolean
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
  estimated_hours: number | null
  actual_hours: number | null
  priority: ProjectPriority
  created_by: string | null
  completed_at: string | null
  completed_by: string | null
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
  estimated_hours?: number | null
  actual_hours?: number | null
  priority?: ProjectPriority
  created_by?: string | null
  completed_at?: string | null
  completed_by?: string | null
  created_at?: string
  updated_at?: string
}

export interface SubtaskUpdate {
  title?: string
  description?: string | null
  assigned_to?: string | null
  completed?: boolean
  due_date?: string | null
  estimated_hours?: number | null
  actual_hours?: number | null
  priority?: ProjectPriority
  completed_at?: string | null
  completed_by?: string | null
  updated_at?: string
}

export interface SubtaskWithUser extends Subtask {
  assignee?: User | null
  creator?: User | null
  completed_by_user?: User | null
}

// Activity log types
export interface ActivityLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string
  old_values: Record<string, any> | null
  new_values: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface ActivityLogWithUser extends ActivityLog {
  user?: User | null
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
  priority_banding?: PriorityBanding[]
  owner_id?: string[]
  tag_ids?: string[]
  due_date_from?: string
  due_date_to?: string
  search?: string
}

export interface ProjectSort {
  field: 'title' | 'created_at' | 'updated_at' | 'due_date' | 'priority_banding' | 'progress_percentage'
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
  due_date: Date
  owner_id?: string
  tag_ids?: string[]
  // RFP Details
  rfp_added_date: Date
  rfp_title?: string
  client_name: string
  state: string
  portal_url?: string
  folder_url?: string
  // Project Management
  assigned_to?: string
  company_assignment?: string
  // Post-Review
  priority_banding?: PriorityBanding
  review_comment?: string
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
  by_priority_banding: Record<PriorityBanding, number>
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

// Custom Attributes types
export type AttributeType =
  | 'text' | 'long_text' | 'number' | 'date' | 'checkbox' | 'dropdown'
  | 'label' | 'checklist' | 'link' | 'member' | 'vote' | 'progress'
  | 'rating' | 'created_at' | 'updated_at' | 'created_by' | 'button' | 'custom_id'

export interface CustomAttribute {
  id: string
  name: string
  label: string
  type: AttributeType
  description: string | null
  is_required: boolean
  is_active: boolean
  options: Record<string, any> | null
  default_value: string | null
  validation_rules: Record<string, any> | null
  display_order: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CustomAttributeInsert {
  id?: string
  name: string
  label: string
  type: AttributeType
  description?: string | null
  is_required?: boolean
  is_active?: boolean
  options?: Record<string, any> | null
  default_value?: string | null
  validation_rules?: Record<string, any> | null
  display_order?: number
  created_by?: string | null
}

export interface ProjectAttributeValue {
  id: string
  project_id: string
  attribute_id: string
  value: string | null
  value_json: Record<string, any> | null
  created_at: string
  updated_at: string
}

// Invitations types
export interface Invitation {
  id: string
  email: string
  role: UserRole
  invited_by: string | null
  token: string
  expires_at: string
  accepted_at: string | null
  accepted_by: string | null
  created_at: string
}

// User Preferences types
export interface UserPreferences {
  id: string
  user_id: string
  email_notifications: boolean
  project_assignments: boolean
  due_date_reminders: boolean
  comment_mentions: boolean
  weekly_summary: boolean
  notification_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  quiet_hours_start: string | null
  quiet_hours_end: string | null
  timezone: string
  theme: 'light' | 'dark' | 'system'
  created_at: string
  updated_at: string
}
