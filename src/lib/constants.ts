import type { ProjectStage, ProjectPriority, UserRole, KanbanColumn } from './types'

// Project stage configurations
export const PROJECT_STAGES: Record<ProjectStage, { label: string; color: string; description: string }> = {
  unassigned: {
    label: 'Unassigned',
    color: '#6B7280', // gray-500
    description: 'New RFPs awaiting assignment'
  },
  assigned: {
    label: 'Assigned',
    color: '#3B82F6', // blue-500
    description: 'RFPs assigned to team members'
  },
  reviewed: {
    label: 'Reviewed',
    color: '#6366F1', // indigo-500
    description: 'RFPs that have been reviewed'
  },
  submitted: {
    label: 'Submitted',
    color: '#F59E0B', // amber-500
    description: 'Completed proposals submitted to clients'
  },
  skipped: {
    label: 'Skipped',
    color: '#6B7280', // gray-500
    description: 'RFPs we chose not to pursue'
  },
  won: {
    label: 'Won',
    color: '#10B981', // emerald-500
    description: 'Successful proposals that became contracts'
  },
  lost: {
    label: 'Lost',
    color: '#EF4444', // red-500
    description: 'Unsuccessful proposals'
  }
}

// Project priority configurations
export const PROJECT_PRIORITIES: Record<ProjectPriority, { label: string; color: string; weight: number }> = {
  low: {
    label: 'Low',
    color: '#10B981', // emerald-500
    weight: 1
  },
  medium: {
    label: 'Medium',
    color: '#F59E0B', // amber-500
    weight: 2
  },
  high: {
    label: 'High',
    color: '#F97316', // orange-500
    weight: 3
  },
  urgent: {
    label: 'Urgent',
    color: '#EF4444', // red-500
    weight: 4
  }
}

// User role configurations
export const USER_ROLES: Record<UserRole, { label: string; permissions: string[] }> = {
  member: {
    label: 'Member',
    permissions: ['read_projects', 'create_comments', 'update_own_tasks']
  },
  manager: {
    label: 'Manager',
    permissions: ['read_projects', 'create_projects', 'assign_projects', 'create_comments', 'manage_tags', 'update_tasks']
  },
  admin: {
    label: 'Admin',
    permissions: ['all']
  }
}

// Kanban column configurations
export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'unassigned',
    title: PROJECT_STAGES.unassigned.label,
    projects: [],
    color: PROJECT_STAGES.unassigned.color
  },
  {
    id: 'assigned',
    title: PROJECT_STAGES.assigned.label,
    projects: [],
    color: PROJECT_STAGES.assigned.color
  },
  {
    id: 'submitted',
    title: PROJECT_STAGES.submitted.label,
    projects: [],
    color: PROJECT_STAGES.submitted.color
  },
  {
    id: 'skipped',
    title: PROJECT_STAGES.skipped.label,
    projects: [],
    color: PROJECT_STAGES.skipped.color
  },
  {
    id: 'won',
    title: PROJECT_STAGES.won.label,
    projects: [],
    color: PROJECT_STAGES.won.color
  },
  {
    id: 'lost',
    title: PROJECT_STAGES.lost.label,
    projects: [],
    color: PROJECT_STAGES.lost.color
  }
]

// Default tag colors
export const DEFAULT_TAG_COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#8B5CF6', // violet-500
  '#EF4444', // red-500
  '#F97316', // orange-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#EC4899', // pink-500
  '#6B7280', // gray-500
]

// Date format constants
export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  displayWithTime: 'MMM dd, yyyy HH:mm',
  input: 'yyyy-MM-dd',
  inputWithTime: 'yyyy-MM-dd\'T\'HH:mm',
  iso: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx'
}

// Pagination constants
export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
  defaultPage: 1
}

// Real-time channel names
export const REALTIME_CHANNELS = {
  projects: 'projects',
  comments: 'comments',
  subtasks: 'subtasks',
  notifications: 'notifications'
}

// Activity log action types
export const ACTIVITY_ACTIONS = {
  created: 'Project Created',
  updated: 'Project Updated',
  assigned: 'Project Assigned',
  stage_changed: 'Stage Changed',
  progress_updated: 'Progress Updated',
  comment_added: 'Comment Added',
  subtask_created: 'Subtask Created',
  subtask_completed: 'Subtask Completed',
  tag_added: 'Tag Added',
  tag_removed: 'Tag Removed'
}

// Validation constants
export const VALIDATION = {
  project: {
    titleMinLength: 3,
    titleMaxLength: 200,
    descriptionMaxLength: 2000
  },
  comment: {
    contentMinLength: 1,
    contentMaxLength: 5000
  },
  subtask: {
    titleMinLength: 3,
    titleMaxLength: 200,
    descriptionMaxLength: 1000
  },
  tag: {
    nameMinLength: 2,
    nameMaxLength: 50
  }
}

// File upload constants (for future use)
export const FILE_UPLOAD = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
  maxFiles: 5
}

// Notification settings
export const NOTIFICATIONS = {
  autoHideDelay: 5000, // 5 seconds
  maxVisible: 5
}

// Local storage keys
export const STORAGE_KEYS = {
  theme: 'rfp-theme',
  sidebarCollapsed: 'rfp-sidebar-collapsed',
  kanbanFilters: 'rfp-kanban-filters',
  userPreferences: 'rfp-user-preferences'
}

// API endpoints
export const API_ENDPOINTS = {
  projects: '/api/projects',
  users: '/api/users',
  tags: '/api/tags',
  comments: '/api/comments',
  subtasks: '/api/subtasks',
  stats: '/api/stats',
  notifications: '/api/notifications'
}

// Error messages
export const ERROR_MESSAGES = {
  generic: 'An unexpected error occurred. Please try again.',
  network: 'Network error. Please check your connection.',
  unauthorized: 'You are not authorized to perform this action.',
  notFound: 'The requested resource was not found.',
  validation: 'Please check your input and try again.',
  server: 'Server error. Please try again later.'
}
