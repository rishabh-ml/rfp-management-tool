'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InlineAlert } from './inline-alert'
import { LoadingSpinner } from './loading-spinner'
import { Mail, ArrowRight } from 'lucide-react'

interface MagicLinkSignInProps {
  onBack?: () => void
}

/**
 * Example: Magic link UI component
 * In a real implementation, this would integrate with Clerk's magic link strategy
 * This demonstrates the UI patterns for advanced auth flows
 */
export function MagicLinkSignIn({ onBack }: MagicLinkSignInProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)
    setError('')

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsEmailSent(true)
  } catch {
      setError('Failed to send magic link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Check your email</h3>
        <p className="text-muted-foreground mb-6">
          We sent a secure sign-in link to <strong>{email}</strong>
        </p>
        <div className="space-y-4">
          <Button 
            onClick={() => {
              setIsEmailSent(false)
              setEmail('')
            }}
            variant="outline"
            className="w-full"
          >
            Try different email
          </Button>
          {onBack && (
            <Button 
              onClick={onBack}
              variant="ghost"
              className="w-full"
            >
              Back to sign in options
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Get a secure sign-in link</h3>
        <p className="text-sm text-muted-foreground">
          We&apos;ll send you a magic link for secure, password-free access
        </p>
      </div>

      {error && (
        <InlineAlert type="error">
          {error}
        </InlineAlert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="w-full"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading || !email}
          className="w-full"
          data-track="auth_magic_link_submit"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Sending link...
            </>
          ) : (
            <>
              Send magic link
              <ArrowRight className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      {onBack && (
        <div className="text-center">
          <Button onClick={onBack} variant="ghost" size="sm">
            Back to sign in options
          </Button>
        </div>
      )}

      {/* Future integration note */}
      <div className="text-xs text-muted-foreground text-center p-3 bg-muted/30 rounded-lg">
  💡 This component demonstrates UI patterns for magic link authentication.
  In production, integrate with Clerk&apos;s email_link strategy.
      </div>
    </div>
  )
}
