import { SignInWrapper } from '@/components/auth/sign-in-wrapper'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | RFP Platform',
  description: 'Sign in to your RFP Platform account and accelerate your proposal process.',
}

export default function SignInPage() {
  return <SignInWrapper />
}
