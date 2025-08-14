import { SignUpWrapper } from '@/components/auth/sign-up-wrapper'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | RFP Platform',
  description: 'Create your RFP Platform workspace and start your free trial today.',
}

export default function SignUpPage() {
  return <SignUpWrapper />
}
