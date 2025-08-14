'use client'

import { SignUp } from '@clerk/nextjs'
import { AuthLayout } from '@/components/auth/auth-layout'
import { signUpAppearance } from '@/lib/clerk-appearance'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Shield, Zap } from 'lucide-react'

export function SignUpWrapper() {
  return (
    <AuthLayout
      title="Create your workspace"
      subtitle="Start your trial—no credit card required."
    >
      {/* Tabs */}
      <nav aria-label="Authentication navigation" className="mb-4">
        <div className="flex bg-muted/60 p-1 rounded-xl">
          <Link
            href="/sign-in"
            className="flex-1 h-10 inline-flex items-center justify-center text-muted-foreground hover:text-foreground font-medium text-sm rounded-lg transition-colors"
          >
            Sign In
          </Link>
          <div className="flex-1 bg-background text-foreground h-10 rounded-lg inline-flex items-center justify-center font-medium text-sm shadow-sm">
            Create Account
          </div>
        </div>
      </nav>

      {/* Quick Value Props */}
      <div className="grid grid-cols-3 gap-3 mb-4" aria-label="Key signup benefits">
        <div className="text-center space-y-1">
          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center mx-auto">
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 leading-tight">14-day trial</p>
        </div>
        <div className="text-center space-y-1">
          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center mx-auto">
            <Shield className="w-4 h-4 text-emerald-600" />
          </div>
            <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 leading-tight">Enterprise security</p>
        </div>
        <div className="text-center space-y-1">
          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center mx-auto">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 leading-tight">5 min setup</p>
        </div>
      </div>

      {/* Clerk Sign Up Component */}
      <div data-track="auth_component" data-variant="signup" className="flex flex-col items-stretch">
        <SignUp 
          appearance={signUpAppearance}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
        />
      </div>

      {/* Terms & Additional Links */}
      <div className="pt-4 mt-2 border-t border-border/50 space-y-4">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:underline font-medium">Terms</Link>{' '}and{' '}
          <Link href="/privacy" className="text-primary hover:underline font-medium">Privacy</Link>
        </p>
        <p className="text-center text-sm text-muted-foreground">
          Have an account?{' '}
          <Link href="/sign-in" className="text-primary hover:underline font-medium inline-flex items-center">
            Sign in
            <ArrowRight className="inline w-3 h-3 ml-1" />
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
