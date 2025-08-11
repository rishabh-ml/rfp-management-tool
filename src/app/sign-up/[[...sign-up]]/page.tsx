import { SignUp } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderKanban, Shield, Users, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Features */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary">
              <FolderKanban className="h-8 w-8" />
              RFP Manager
            </Link>
            <h1 className="text-3xl font-bold">Join our platform</h1>
            <p className="text-muted-foreground text-lg">
              Streamline your RFP management process with our comprehensive platform
            </p>
          </div>

          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Project Management</h3>
                <p className="text-sm text-muted-foreground">
                  Track RFP projects from initial request to final submission with our intuitive dashboard
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Team Collaboration</h3>
                <p className="text-sm text-muted-foreground">
                  Collaborate seamlessly with team members, assign tasks, and track progress in real-time
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Role-Based Access</h3>
                <p className="text-sm text-muted-foreground">
                  Secure role-based permissions ensure team members access only what they need
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground">
              "              This platform has transformed how we handle RFPs. Our response time improved by 60% and our win rate increased significantly."
            </p>
            <p className="text-sm font-medium mt-2">— Sarah Johnson, Project Manager</p>
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle>Create Your Account</CardTitle>
              <CardDescription>
                Get started with your free account today
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <SignUp
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-primary hover:bg-primary/90',
                    card: 'shadow-none border-0',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    socialButtonsBlockButton: 'border-input hover:bg-accent',
                    formFieldInput: 'border-input',
                    footerActionLink: 'text-primary hover:text-primary/90'
                  }
                }}
                redirectUrl="/dashboard"
                signInUrl="/sign-in"
              />
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Already have an account?{' '}
              <Link href="/sign-in" className="text-primary hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
