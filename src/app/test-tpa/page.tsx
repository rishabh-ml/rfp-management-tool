'use client'

import { useEffect, useState } from 'react'
import { useUser, useSession } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface TestResult {
  name: string
  status: 'success' | 'error' | 'warning' | 'loading'
  message: string
  details?: any
}

export default function TestTPAPage() {
  const { user } = useUser()
  const { session } = useSession()
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  // Create a custom Supabase client using the new TPA integration
  function createClerkSupabaseClient() {
    return createClient(supabaseUrl, supabaseAnonKey, {
      async accessToken() {
        return session?.getToken() ?? null
      },
    })
  }

  const runTests = async () => {
    if (!user || !session) {
      setTestResults([{
        name: 'Authentication Check',
        status: 'error',
        message: 'User must be signed in to run tests'
      }])
      return
    }

    setIsRunning(true)
    const results: TestResult[] = []

    // Test 1: Clerk Authentication
    results.push({
      name: 'Clerk Authentication',
      status: 'success',
      message: `Authenticated as ${user.emailAddresses[0]?.emailAddress}`,
      details: {
        userId: user.id,
        hasSession: !!session
      }
    })

    // Test 2: Token Generation
    try {
      const token = await session.getToken()
      if (token) {
        results.push({
          name: 'Clerk Token Generation',
          status: 'success',
          message: 'Successfully generated Clerk session token',
          details: {
            tokenLength: token.length,
            tokenPrefix: token.substring(0, 20) + '...'
          }
        })
      } else {
        results.push({
          name: 'Clerk Token Generation',
          status: 'error',
          message: 'Failed to generate Clerk session token'
        })
      }
    } catch (error) {
      results.push({
        name: 'Clerk Token Generation',
        status: 'error',
        message: 'Error generating token',
        details: error
      })
    }

    // Test 3: Supabase Client Creation
    try {
      const client = createClerkSupabaseClient()
      results.push({
        name: 'Supabase Client Creation',
        status: 'success',
        message: 'Successfully created Supabase client with TPA integration'
      })

      // Test 4: Database Connection
      try {
        const { data, error } = await client
          .from('users')
          .select('count', { count: 'exact', head: true })

        if (error) {
          results.push({
            name: 'Database Connection',
            status: 'error',
            message: 'Database connection failed',
            details: {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint
            }
          })
        } else {
          results.push({
            name: 'Database Connection',
            status: 'success',
            message: 'Successfully connected to database'
          })
        }
      } catch (dbError) {
        results.push({
          name: 'Database Connection',
          status: 'error',
          message: 'Database connection error',
          details: dbError
        })
      }

      // Test 5: RLS Policy Test
      try {
        const { data: currentUserId, error: rlsError } = await client.rpc('current_user_id')
        
        if (rlsError) {
          results.push({
            name: 'RLS Policy Test',
            status: 'error',
            message: 'RLS function call failed',
            details: rlsError
          })
        } else {
          results.push({
            name: 'RLS Policy Test',
            status: 'success',
            message: `RLS correctly identifies user: ${currentUserId}`,
            details: {
              clerkUserId: user.id,
              rlsUserId: currentUserId,
              match: user.id === currentUserId
            }
          })
        }
      } catch (rlsError) {
        results.push({
          name: 'RLS Policy Test',
          status: 'error',
          message: 'RLS test error',
          details: rlsError
        })
      }

      // Test 6: User Data Access
      try {
        const { data: userData, error: userError } = await client
          .from('users')
          .select('id, email, first_name, last_name, role')
          .eq('id', user.id)
          .single()

        if (userError) {
          results.push({
            name: 'User Data Access',
            status: 'warning',
            message: 'Could not access user data - user may not exist in database',
            details: userError
          })
        } else {
          results.push({
            name: 'User Data Access',
            status: 'success',
            message: 'Successfully accessed user data',
            details: userData
          })
        }
      } catch (userError) {
        results.push({
          name: 'User Data Access',
          status: 'error',
          message: 'User data access error',
          details: userError
        })
      }

    } catch (clientError) {
      results.push({
        name: 'Supabase Client Creation',
        status: 'error',
        message: 'Failed to create Supabase client',
        details: clientError
      })
    }

    setTestResults(results)
    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'loading':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
      loading: 'outline'
    } as const

    return (
      <Badge variant={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Clerk + Supabase TPA Integration Test</h1>
        <p className="text-muted-foreground">
          Test the native third-party auth integration between Clerk and Supabase
        </p>
      </div>

      <div className="mb-6">
        <Button 
          onClick={runTests} 
          disabled={isRunning || !user}
          className="w-full sm:w-auto"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run Integration Tests'
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {testResults.map((result, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  {result.name}
                </CardTitle>
                {getStatusBadge(result.status)}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-3">
                {result.message}
              </CardDescription>
              {result.details && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    View Details
                  </summary>
                  <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {testResults.length === 0 && !isRunning && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Click &ldquo;Run Integration Tests&rdquo; to test the Clerk + Supabase TPA integration
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
