'use client'

import { SignIn } from '@clerk/nextjs'
import { AuthLayout } from '@/components/auth/auth-layout'
import { signInAppearance } from '@/lib/clerk-appearance'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function SignInWrapper() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Ship compliant proposals faster."
    >
      {/* Tabs */}
      <nav aria-label="Authentication navigation" className="mb-4">
        <div className="flex bg-muted/60 p-1 rounded-xl">
          <div className="flex-1 bg-background text-foreground h-10 rounded-lg inline-flex items-center justify-center font-medium text-sm shadow-sm">
            Sign In
          </div>
          <Link
            href="/sign-up"
            className="flex-1 h-10 inline-flex items-center justify-center text-muted-foreground hover:text-foreground font-medium text-sm rounded-lg transition-colors"
          >
            Create Account
          </Link>
        </div>
      </nav>

      {/* Clerk Sign In Component */}
      <div data-track="auth_component" data-variant="signin" className="flex flex-col items-stretch">
        <SignIn 
          appearance={signInAppearance}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
        />
      </div>

      {/* Additional Links */}
      <div className="pt-4 mt-2 border-t border-border/50">
        <p className="text-center text-sm text-muted-foreground">
          Need an account?{' '}
          <Link href="/sign-up" className="text-primary hover:underline font-medium inline-flex items-center">
            Create one
            <ArrowRight className="inline w-3 h-3 ml-1" />
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
