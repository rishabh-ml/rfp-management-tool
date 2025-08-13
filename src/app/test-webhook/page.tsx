'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw, User, Database } from 'lucide-react'
import { toast } from 'sonner'

interface SyncStatus {
  exists: boolean
  user?: any
  error?: string
}

interface SyncResult {
  success: boolean
  message?: string
  data?: any
  error?: string
  details?: string
}

export default function TestWebhookPage() {
  const { user, isLoaded } = useUser()
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Check sync status on load
  useEffect(() => {
    if (isLoaded && user) {
      checkSyncStatus()
    }
  }, [isLoaded, user])

  const checkSyncStatus = async () => {
    if (!user) return

    setIsChecking(true)
    try {
      const response = await fetch('/api/sync-user')
      const data = await response.json()

      if (response.ok) {
        setSyncStatus(data)
      } else {
        setSyncStatus({ exists: false, error: data.error || 'Failed to check sync status' })
      }
    } catch (error) {
      console.error('Error checking sync status:', error)
      setSyncStatus({ exists: false, error: 'Network error' })
    } finally {
      setIsChecking(false)
    }
  }

  const syncUser = async () => {
    if (!user) return

    setIsSyncing(true)
    try {
      const response = await fetch('/api/sync-user', { method: 'POST' })
      const data: SyncResult = await response.json()

      if (response.ok && data.success) {
        toast.success(data.message || 'User synced successfully')
        await checkSyncStatus() // Refresh status
      } else {
        toast.error(data.error || 'Failed to sync user')
      }
    } catch (error) {
      console.error('Error syncing user:', error)
      toast.error('Network error during sync')
    } finally {
      setIsSyncing(false)
    }
  }

  const getStatusBadge = (exists: boolean, error?: string) => {
    if (error) {
      return <Badge variant="destructive">Error</Badge>
    }
    return exists ? 
      <Badge variant="default">Synced</Badge> : 
      <Badge variant="secondary">Not Synced</Badge>
  }

  const getStatusIcon = (exists: boolean, error?: string) => {
    if (error) {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
    return exists ? 
      <CheckCircle className="h-5 w-5 text-green-500" /> : 
      <AlertCircle className="h-5 w-5 text-yellow-500" />
  }

  if (!isLoaded) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please sign in to test webhook integration
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Clerk Webhook Integration Test</h1>
        <p className="text-muted-foreground">
          Test and validate the synchronization between Clerk and Supabase
        </p>
      </div>

      {/* User Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Clerk User Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">User ID</p>
              <p className="font-mono text-sm">{user.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{user.emailAddresses[0]?.emailAddress}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-sm">{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-sm">{new Date(user.createdAt!).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Sync Status
            </CardTitle>
            <div className="flex items-center gap-2">
              {syncStatus && getStatusBadge(syncStatus.exists, syncStatus.error)}
              <Button
                variant="outline"
                size="sm"
                onClick={checkSyncStatus}
                disabled={isChecking}
              >
                {isChecking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isChecking ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Checking sync status...</span>
            </div>
          ) : syncStatus ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                {getStatusIcon(syncStatus.exists, syncStatus.error)}
                <span className="font-medium">
                  {syncStatus.error ? 
                    `Error: ${syncStatus.error}` :
                    syncStatus.exists ? 
                      'User is synced to database' : 
                      'User not found in database'
                  }
                </span>
              </div>

              {syncStatus.user && (
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm font-medium mb-2">Database User Data:</p>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(syncStatus.user, null, 2)}
                  </pre>
                </div>
              )}

              {!syncStatus.exists && !syncStatus.error && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    This user needs to be synced to the database for the application to work properly.
                  </p>
                  <Button onClick={syncUser} disabled={isSyncing}>
                    {isSyncing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Syncing User...
                      </>
                    ) : (
                      'Sync User to Database'
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Click refresh to check sync status</p>
          )}
        </CardContent>
      </Card>

      {/* Webhook Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Setup Instructions</CardTitle>
          <CardDescription>
            Follow these steps to set up Clerk webhooks for automatic user synchronization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Configure Webhook in Clerk Dashboard</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Go to Clerk Dashboard → Webhooks</li>
              <li>• Click &ldquo;Add endpoint&rdquo;</li>
              <li>• Set endpoint URL to: <code className="bg-muted px-1 rounded">https://your-domain.com/api/webhooks/clerk</code></li>
              <li>• Select events: <code className="bg-muted px-1 rounded">user.created</code>, <code className="bg-muted px-1 rounded">user.updated</code>, <code className="bg-muted px-1 rounded">user.deleted</code></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">2. Update Environment Variables</h4>
            <p className="text-sm text-muted-foreground">
              Copy the webhook signing secret from Clerk and add it to your <code className="bg-muted px-1 rounded">.env.local</code>:
            </p>
            <code className="block bg-muted p-2 rounded text-sm">
              CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
            </code>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">3. Test the Integration</h4>
            <p className="text-sm text-muted-foreground">
              Create a new user account or update your profile in Clerk to test automatic synchronization.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
