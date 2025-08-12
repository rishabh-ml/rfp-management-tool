'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export function useUserSync() {
  const { isLoaded, userId } = useAuth()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [isSynced, setIsSynced] = useState(false)

  useEffect(() => {
    if (!isLoaded || !userId || isSynced) return

    const syncUser = async () => {
      try {
        setIsSyncing(true)
        setSyncError(null)

        // Check if user exists first
        const checkResponse = await fetch('/api/sync-user')
        const checkResult = await checkResponse.json()

        if (!checkResult.exists) {
          // User doesn't exist, sync them
          const syncResponse = await fetch('/api/sync-user', {
            method: 'POST'
          })
          
          if (!syncResponse.ok) {
            const errorData = await syncResponse.json()
            throw new Error(errorData.error || 'Failed to sync user')
          }

          console.log('User synced successfully')
        }

        setIsSynced(true)
      } catch (error) {
        console.error('User sync error:', error)
        setSyncError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setIsSyncing(false)
      }
    }

    syncUser()
  }, [isLoaded, userId, isSynced])

  return { isSyncing, syncError, isSynced }
}
