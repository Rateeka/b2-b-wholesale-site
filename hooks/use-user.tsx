"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

type Store = {
  store_id: string
  name: string
  tier: 'gold' | 'silver' | 'bronze'
  status: string
  credit_limit: number
  credit_used: number
  credit_available: number
  contact_email: string
  contact_phone: string | null
  address: string | null
  city: string | null
  province: string | null
  postal_code: string | null
}

type UserContextType = {
  user: User | null
  store: Store | null
  isLoading: boolean
  error: string | null
  refreshStore: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [store, setStore] = useState<Store | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchStore = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('store_id, name, tier, status, credit_limit, credit_used, credit_available, contact_email, contact_phone, address, city, province, postal_code')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Supabase error fetching store:', error)
        throw error
      }
      console.log('[use-user] Store data loaded:', data)
      setStore(data)
      setError(null)
    } catch (err) {
      console.error('[use-user] Error fetching store:', err)
      setError('Failed to load store information')
      setStore(null)
    }
  }

  const refreshStore = async () => {
    if (user) {
      await fetchStore(user.id)
    }
  }

  useEffect(() => {
    const initUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          await fetchStore(user.id)
        }
      } catch (err) {
        console.error('Error initializing user:', err)
        setError('Failed to load user information')
      } finally {
        setIsLoading(false)
      }
    }

    initUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchStore(session.user.id)
        } else {
          setStore(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <UserContext.Provider value={{ user, store, isLoading, error, refreshStore }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
