import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, isValid, differenceInDays, differenceInHours, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns'
import type { ProjectPriority, ProjectStage, User, Project } from './types'
import { PROJECT_PRIORITIES, PROJECT_STAGES } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utilities
export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return 'Invalid date'
    return format(dateObj, formatStr)
  } catch {
    return 'Invalid date'
  }
}

export function formatRelativeDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return 'Invalid date'

    const now = new Date()
    const diffInDays = differenceInDays(now, dateObj)
    const diffInHours = differenceInHours(now, dateObj)

    if (diffInDays === 0) {
      if (diffInHours === 0) return 'Just now'
      if (diffInHours === 1) return '1 hour ago'
      if (diffInHours < 24) return `${diffInHours} hours ago`
    }

    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`

    return `${Math.floor(diffInDays / 365)} years ago`
  } catch {
    return 'Invalid date'
  }
}

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  try {
    const due = parseISO(dueDate)
    return isValid(due) && isBefore(due, new Date())
  } catch {
    return false
  }
}

export function isDueSoon(dueDate: string | null, days: number = 7): boolean {
  if (!dueDate) return false
  try {
    const due = parseISO(dueDate)
    const threshold = new Date()
    threshold.setDate(threshold.getDate() + days)
    return isValid(due) && isAfter(due, new Date()) && isBefore(due, threshold)
  } catch {
    return false
  }
}

// User utilities
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Unknown User'

  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`
  }
  if (user.first_name) return user.first_name
  if (user.last_name) return user.last_name
  return user.email.split('@')[0]
}

export function getUserInitials(user: User | null): string {
  if (!user) return 'U'

  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
  }
  if (user.first_name) return user.first_name[0].toUpperCase()
  if (user.last_name) return user.last_name[0].toUpperCase()
  return user.email[0].toUpperCase()
}

// Project utilities
export function getProjectPriorityColor(priority: ProjectPriority): string {
  return PROJECT_PRIORITIES[priority]?.color || '#6B7280'
}

export function getProjectStageColor(stage: ProjectStage): string {
  return PROJECT_STAGES[stage]?.color || '#6B7280'
}

export function getProjectPriorityWeight(priority: ProjectPriority): number {
  return PROJECT_PRIORITIES[priority]?.weight || 0
}

export function sortProjectsByPriority(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const weightA = getProjectPriorityWeight(a.priority)
    const weightB = getProjectPriorityWeight(b.priority)
    return weightB - weightA // Higher weight first
  })
}

export function getProjectProgress(project: Project): {
  percentage: number
  status: 'not-started' | 'in-progress' | 'completed'
  color: string
} {
  const percentage = project.progress_percentage || 0

  let status: 'not-started' | 'in-progress' | 'completed'
  let color: string

  if (percentage === 0) {
    status = 'not-started'
    color = '#6B7280' // gray
  } else if (percentage === 100) {
    status = 'completed'
    color = '#10B981' // green
  } else {
    status = 'in-progress'
    color = '#3B82F6' // blue
  }

  return { percentage, status, color }
}

// String utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Color utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor)
  if (!rgb) return '#000000'

  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

// Array utilities
export function groupBy<T, K extends keyof any>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const group = key(item)
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<K, T[]>)
}

export function uniqueBy<T, K>(array: T[], key: (item: T) => K): T[] {
  const seen = new Set<K>()
  return array.filter(item => {
    const k = key(item)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Local storage utilities
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue

  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Silently fail
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(key)
  } catch {
    // Silently fail
  }
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
