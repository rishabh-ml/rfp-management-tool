'use client'

import * as React from 'react'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

// Skip to main content link
export function SkipToMain() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
    >
      Skip to main content
    </a>
  )
}

// Screen reader only text
interface ScreenReaderOnlyProps {
  children: React.ReactNode
  className?: string
}

export function ScreenReaderOnly({ children, className }: ScreenReaderOnlyProps) {
  return (
    <span className={cn('sr-only', className)}>
      {children}
    </span>
  )
}

// Focus trap component
interface FocusTrapProps {
  children: React.ReactNode
  isActive: boolean
  className?: string
}

export function FocusTrap({ children, isActive, className }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          e.preventDefault()
        }
      }
    }

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // You can add custom escape handling here
        e.preventDefault()
      }
    }

    document.addEventListener('keydown', handleTabKey)
    document.addEventListener('keydown', handleEscapeKey)

    // Focus first element when trap becomes active
    firstElement?.focus()

    return () => {
      document.removeEventListener('keydown', handleTabKey)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isActive])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

// Accessible button with proper ARIA attributes
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  loadingText?: string
  ariaLabel?: string
  ariaDescribedBy?: string
}

export function AccessibleButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText = 'Loading...',
  ariaLabel,
  ariaDescribedBy,
  className,
  disabled,
  ...props
}: AccessibleButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
  }
  
  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8 text-lg'
  }

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="sr-only">{loadingText}</span>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}

// Accessible form field with proper labeling
interface AccessibleFieldProps<T extends React.ElementType = any> {
  children: React.ReactElement<any, T>
  label: string
  id: string
  error?: string
  description?: string
  required?: boolean
  className?: string
}

export function AccessibleField({
  children,
  label,
  id,
  error,
  description,
  required = false,
  className
}: AccessibleFieldProps) {
  const errorId = error ? `${id}-error` : undefined
  const descriptionId = description ? `${id}-description` : undefined

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      <div>
        {React.isValidElement(children) ? (() => {
          const enhancement: any = {
            id,
            'aria-describedby': [descriptionId, errorId].filter(Boolean).join(' ') || undefined,
            'aria-invalid': error ? 'true' : undefined,
            'aria-required': required
          }
          return React.cloneElement(children as React.ReactElement<any>, enhancement)
        })() : children}
      </div>
      
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Accessible modal/dialog
interface AccessibleModalProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  className?: string
}

export function AccessibleModal({
  children,
  isOpen,
  onClose,
  title,
  description,
  className
}: AccessibleModalProps) {
  const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`
  const descriptionId = description ? `modal-description-${Math.random().toString(36).substr(2, 9)}` : undefined

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal content */}
      <FocusTrap isActive={isOpen} className={cn(
        'relative bg-background rounded-lg shadow-lg max-w-md w-full mx-4 p-6',
        className
      )}>
        <h2 id={titleId} className="text-lg font-semibold mb-2">
          {title}
        </h2>
        
        {description && (
          <p id={descriptionId} className="text-sm text-muted-foreground mb-4">
            {description}
          </p>
        )}
        
        {children}
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md hover:bg-muted"
          aria-label="Close modal"
        >
          <span className="sr-only">Close</span>
          ×
        </button>
      </FocusTrap>
    </div>
  )
}

// Accessible status announcer for screen readers
interface StatusAnnouncerProps {
  message: string
  priority?: 'polite' | 'assertive'
}

export function StatusAnnouncer({ message, priority = 'polite' }: StatusAnnouncerProps) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

// Accessible progress indicator
interface AccessibleProgressProps {
  value: number
  max?: number
  label: string
  className?: string
}

export function AccessibleProgress({
  value,
  max = 100,
  label,
  className
}: AccessibleProgressProps) {
  const percentage = Math.round((value / max) * 100)

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${percentage}% complete`}
        className="w-full bg-muted rounded-full h-2"
      >
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Accessible tooltip
interface AccessibleTooltipProps<T extends React.ElementType = any> {
  children: React.ReactElement<any, T>
  content: string
  className?: string
}

export function AccessibleTooltip({ children, content, className }: AccessibleTooltipProps) {
  const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={cn('relative inline-block', className)}>
      {React.isValidElement(children) ? (() => {
        const enhancement: any = { 'aria-describedby': tooltipId }
        return React.cloneElement(children as React.ReactElement<any>, enhancement)
      })() : children}
      <div
        id={tooltipId}
        role="tooltip"
        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-black text-white rounded opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-focus:opacity-100"
      >
        {content}
      </div>
    </div>
  )
}
