'use client'

import { useUserSync } from '@/lib/hooks/use-user-sync'
import { useAuth } from '@clerk/nextjs'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface UserSyncProviderProps {
  children: React.ReactNode
}

export function UserSyncProvider({ children }: UserSyncProviderProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const { isSyncing, syncError, isSynced } = useUserSync()

  // Show loading while auth is loading or user is being synced
  if (!isLoaded || (isSignedIn && !isSynced && isSyncing)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <LoadingSpinner />
          <span className="text-muted-foreground">
            {!isLoaded ? 'Loading...' : 'Syncing user...'}
          </span>
        </div>
      </div>
    )
  }

  // Show error if sync failed
  if (syncError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-2">User sync failed</div>
          <div className="text-sm text-muted-foreground">{syncError}</div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
