'use client'

import { useEffect, useState } from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function useRealtime() {
  const { getToken, isSignedIn, sessionId } = useAuth()
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)

  useEffect(() => {
    let isMounted = true
    const initSupabase = async () => {
      try {
        // Create Supabase client with native TPA integration
        const client = createClient(supabaseUrl, supabaseAnonKey, {
          async accessToken() {
            // Get the Clerk session token - no custom template needed with TPA
            const token = await getToken()
            return token ?? null
          },
          realtime: {
            params: {
              eventsPerSecond: 10,
            },
          },
        })

        if (isMounted) setSupabase(client)
      } catch (e) {
        console.error('Error creating realtime Supabase client:', e)
        // Fallback to anonymous client if token retrieval fails
        const client = createClient(supabaseUrl, supabaseAnonKey, {
          realtime: {
            params: {
              eventsPerSecond: 10,
            },
          },
        })
        if (isMounted) setSupabase(client)
      }
    }

    initSupabase()

    // Re-init when session changes (sign-in/out) to refresh token
    return () => {
      isMounted = false
    }
  }, [getToken, isSignedIn, sessionId])

  return supabase
}

export function useRealtimeProjects(onUpdate?: (payload: any) => void) {
  const supabase = useRealtime()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!supabase) return

    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        (payload: any) => {
          console.log('Project change received:', payload)
          onUpdate?.(payload)
        }
      )
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      setIsConnected(false)
    }
  }, [supabase, onUpdate])

  return { isConnected }
}

export function useRealtimeComments(projectId: string, onUpdate?: (payload: any) => void) {
  const supabase = useRealtime()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!supabase || !projectId) return

    const channel = supabase
      .channel(`comments-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `project_id=eq.${projectId}`
        },
        (payload: any) => {
          console.log('Comment change received:', payload)
          onUpdate?.(payload)
        }
      )
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      setIsConnected(false)
    }
  }, [supabase, projectId, onUpdate])

  return { isConnected }
}

export function useRealtimeSubtasks(projectId: string, onUpdate?: (payload: any) => void) {
  const supabase = useRealtime()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!supabase || !projectId) return

    const channel = supabase
      .channel(`subtasks-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subtasks',
          filter: `project_id=eq.${projectId}`
        },
        (payload: any) => {
          console.log('Subtask change received:', payload)
          onUpdate?.(payload)
        }
      )
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      setIsConnected(false)
    }
  }, [supabase, projectId, onUpdate])

  return { isConnected }
}

export function useRealtimeNotifications(userId: string, onUpdate?: (payload: any) => void) {
  const supabase = useRealtime()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!supabase || !userId) return

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          console.log('Notification change received:', payload)
          onUpdate?.(payload)
        }
      )
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      setIsConnected(false)
    }
  }, [supabase, userId, onUpdate])

  return { isConnected }
}

export function useRealtimeActivityLog(onUpdate?: (payload: any) => void) {
  const supabase = useRealtime()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!supabase) return

    const channel = supabase
      .channel('activity-log')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log'
        },
        (payload: any) => {
          console.log('Activity log change received:', payload)
          onUpdate?.(payload)
        }
      )
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      setIsConnected(false)
    }
  }, [supabase, onUpdate])

  return { isConnected }
}

// Hook for real-time presence (who's online)
export function useRealtimePresence(channelName: string) {
  const supabase = useRealtime()
  const { userId } = useAuth()
  const [presenceState, setPresenceState] = useState<any>({})
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!supabase || !userId) return

    const channel = supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setPresenceState(state)
        setIsConnected(true)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
        console.log('User joined:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
        console.log('User left:', key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
      setIsConnected(false)
    }
  }, [supabase, userId, channelName])

  return { presenceState, isConnected }
}

// Hook for broadcasting real-time events
export function useRealtimeBroadcast(channelName: string) {
  const supabase = useRealtime()

  const broadcast = (event: string, payload: any) => {
    if (!supabase) return

    const channel = supabase.channel(channelName)
    channel.send({
      type: 'broadcast',
      event,
      payload
    })
  }

  const subscribe = (event: string, callback: (payload: any) => void) => {
    if (!supabase) return

    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event }, callback)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  return { broadcast, subscribe }
}
