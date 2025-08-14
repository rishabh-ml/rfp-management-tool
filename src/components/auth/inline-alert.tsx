'use client'

import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'

interface InlineAlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  children: React.ReactNode
  className?: string
}

export function InlineAlert({ type, children, className = '' }: InlineAlertProps) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }

  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-200',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-200',
  }

  const IconComponent = icons[type]

  return (
    <div
      className={`flex items-start space-x-3 p-4 border rounded-xl ${styles[type]} ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        {children}
      </div>
    </div>
  )
}
