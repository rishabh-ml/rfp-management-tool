'use client'

import { useEffect, useState } from 'react'
import { ValuePanel } from './value-panel'
import { ThemeToggle } from './theme-toggle'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  showValuePanel?: boolean
}

export function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  showValuePanel = true 
}: AuthLayoutProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50/20 dark:to-blue-950/20">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="flex min-h-screen w-full max-w-7xl mx-auto">
        {/* Value Panel - Desktop Only */}
        {showValuePanel && (
          <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 border-r border-border/40 backdrop-blur-sm">
            <ValuePanel />
          </div>
        )}

        {/* Auth Content */}
        <div className={`flex-1 flex items-center justify-center px-4 py-10 sm:p-8 ${
          showValuePanel ? 'lg:w-3/5 xl:w-1/2' : 'w-full'
        }`}>
          <div className={`w-full max-w-md transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {/* Mobile Value Panel */}
            {showValuePanel && (
              <div className="lg:hidden mb-8 text-center">
                <h1 className="text-2xl font-bold mb-2">Accelerate every RFP response</h1>
                <div className="space-y-2 text-muted-foreground">
                  <p>• Centralize collaboration</p>
                  <p>• Reuse winning answers</p>
                  <p>• Track compliance in real time</p>
                </div>
              </div>
            )}

            {/* Auth Card Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold tracking-tight mb-2" id="auth-title">{title}</h2>
              <p className="text-muted-foreground text-sm" id="auth-subtitle">{subtitle}</p>
            </div>

            {/* Auth Card */}
            <div className="bg-card/70 backdrop-blur-md border border-border/60 rounded-2xl shadow-xl p-6 sm:p-8" aria-labelledby="auth-title" aria-describedby="auth-subtitle">
              <div className="space-y-6">
                {children}
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                🔒 All data encrypted in transit & at rest.{' '}
                <a 
                  href="/security" 
                  className="text-primary hover:underline"
                >
                  Security & Compliance
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
