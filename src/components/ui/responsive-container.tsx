'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

// Hook to detect screen size
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setScreenSize('mobile')
      } else if (window.innerWidth < 1024) {
        setScreenSize('tablet')
      } else {
        setScreenSize('desktop')
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return screenSize
}

// Responsive container component
interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  mobileLayout?: React.ReactNode
  tabletLayout?: React.ReactNode
  desktopLayout?: React.ReactNode
}

export function ResponsiveContainer({
  children,
  className,
  mobileLayout,
  tabletLayout,
  desktopLayout
}: ResponsiveContainerProps) {
  const screenSize = useScreenSize()

  if (mobileLayout && screenSize === 'mobile') {
    return <div className={cn('w-full', className)}>{mobileLayout}</div>
  }

  if (tabletLayout && screenSize === 'tablet') {
    return <div className={cn('w-full', className)}>{tabletLayout}</div>
  }

  if (desktopLayout && screenSize === 'desktop') {
    return <div className={cn('w-full', className)}>{desktopLayout}</div>
  }

  return <div className={cn('w-full', className)}>{children}</div>
}

// Responsive grid component
interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: string
}

export function ResponsiveGrid({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'gap-4'
}: ResponsiveGridProps) {
  const gridClasses = cn(
    'grid',
    gap,
    cols.mobile && `grid-cols-${cols.mobile}`,
    cols.tablet && `md:grid-cols-${cols.tablet}`,
    cols.desktop && `lg:grid-cols-${cols.desktop}`,
    className
  )

  return <div className={gridClasses}>{children}</div>
}

// Responsive text component
interface ResponsiveTextProps {
  children: React.ReactNode
  className?: string
  sizes?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
}

export function ResponsiveText({
  children,
  className,
  sizes = { mobile: 'text-sm', tablet: 'text-base', desktop: 'text-lg' }
}: ResponsiveTextProps) {
  const textClasses = cn(
    sizes.mobile,
    sizes.tablet && `md:${sizes.tablet}`,
    sizes.desktop && `lg:${sizes.desktop}`,
    className
  )

  return <span className={textClasses}>{children}</span>
}

// Mobile-first navigation component
interface MobileNavProps {
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

export function MobileNav({ isOpen, onToggle, children }: MobileNavProps) {
  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="md:hidden p-2 rounded-md hover:bg-muted"
        aria-label="Toggle navigation"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <span
            className={cn(
              'bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm',
              isOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'
            )}
          />
          <span
            className={cn(
              'bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5',
              isOpen ? 'opacity-0' : 'opacity-100'
            )}
          />
          <span
            className={cn(
              'bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm',
              isOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'
            )}
          />
        </div>
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Mobile menu */}
      <div
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-background border-r transform transition-transform duration-300 ease-in-out z-50 md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {children}
      </div>
    </>
  )
}

// Responsive table wrapper
interface ResponsiveTableProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <div className="min-w-full inline-block align-middle">
        {children}
      </div>
    </div>
  )
}

// Responsive card stack (mobile: stack, desktop: grid)
interface ResponsiveCardStackProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveCardStack({ children, className }: ResponsiveCardStackProps) {
  return (
    <div className={cn(
      'flex flex-col gap-4',
      'md:grid md:grid-cols-2 md:gap-6',
      'lg:grid-cols-3',
      className
    )}>
      {children}
    </div>
  )
}

// Responsive spacing component
interface ResponsiveSpacingProps {
  children: React.ReactNode
  className?: string
  padding?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
  margin?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
}

export function ResponsiveSpacing({
  children,
  className,
  padding = { mobile: 'p-4', tablet: 'p-6', desktop: 'p-8' },
  margin
}: ResponsiveSpacingProps) {
  const spacingClasses = cn(
    padding.mobile,
    padding.tablet && `md:${padding.tablet}`,
    padding.desktop && `lg:${padding.desktop}`,
    margin?.mobile,
    margin?.tablet && `md:${margin.tablet}`,
    margin?.desktop && `lg:${margin.desktop}`,
    className
  )

  return <div className={spacingClasses}>{children}</div>
}

// Responsive sidebar component
interface ResponsiveSidebarProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function ResponsiveSidebar({
  children,
  isOpen,
  onClose,
  className
}: ResponsiveSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <div className={cn(
        'hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 md:bg-background md:border-r',
        className
      )}>
        {children}
      </div>

      {/* Mobile sidebar */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />
          <div className={cn(
            'fixed inset-y-0 left-0 w-64 bg-background border-r z-50 md:hidden',
            className
          )}>
            {children}
          </div>
        </>
      )}
    </>
  )
}

// Responsive form layout
interface ResponsiveFormProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveForm({ children, className }: ResponsiveFormProps) {
  return (
    <div className={cn(
      'space-y-4',
      'md:space-y-6',
      'lg:space-y-8',
      className
    )}>
      {children}
    </div>
  )
}

// Responsive button group
interface ResponsiveButtonGroupProps {
  children: React.ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical' | 'responsive'
}

export function ResponsiveButtonGroup({
  children,
  className,
  orientation = 'responsive'
}: ResponsiveButtonGroupProps) {
  const orientationClasses = {
    horizontal: 'flex flex-row gap-2',
    vertical: 'flex flex-col gap-2',
    responsive: 'flex flex-col gap-2 sm:flex-row'
  }

  return (
    <div className={cn(orientationClasses[orientation], className)}>
      {children}
    </div>
  )
}
