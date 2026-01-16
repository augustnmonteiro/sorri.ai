import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { UserPlan, UserRole } from '@/types'

interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  onboarding_completed: boolean
  plan: UserPlan
  role: UserRole
  video_edits_this_month: number
  video_edits_reset_at?: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null; profile: UserProfile | null }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const currentUserIdRef = useRef<string | null>(null)

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    // Check if video edits counter needs to be reset (new month)
    if (data.video_edits_reset_at) {
      const resetDate = new Date(data.video_edits_reset_at)
      const now = new Date()

      // Check if it's a different month or year
      const isDifferentMonth = resetDate.getMonth() !== now.getMonth() ||
                               resetDate.getFullYear() !== now.getFullYear()

      if (isDifferentMonth && data.video_edits_this_month > 0) {
        // Reset the counter
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            video_edits_this_month: 0,
            video_edits_reset_at: now.toISOString(),
          })
          .eq('id', userId)

        if (!updateError) {
          data.video_edits_this_month = 0
          data.video_edits_reset_at = now.toISOString()
        }
      }
    }

    return data as UserProfile
  }

  useEffect(() => {
    let mounted = true
    let initialLoadComplete = false

    // Get initial session
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          // AuthSessionMissingError is expected when no user is logged in if using getUser()
          if (error.name === 'AuthSessionMissingError' || error.message?.includes('Auth session missing')) {
            console.log('No active session found (clean state).')
          } else {
            console.error('Error getting user:', error)
          }
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
          initialLoadComplete = true
          return
        }

        setSession(session ?? null)

        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id)
          if (mounted) {
            currentUserIdRef.current = session.user.id
            setUser(session.user)
            setProfile(userProfile)
          }
        }
      } catch (err) {
        console.error('Session init error:', err)
        if (mounted) {
          setSession(null)
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
          initialLoadComplete = true
        }
      }
    }

    initSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      // Handle sign out or session expiry
      if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
        currentUserIdRef.current = null
        setSession(null)
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      setSession(session)

      const newUserId = session?.user?.id ?? null

      // Skip updates if user hasn't actually changed (prevents refresh on tab switch)
      // But don't set loading to false here - let initSession handle initial load
      if (newUserId === currentUserIdRef.current) {
        if (initialLoadComplete) setLoading(false)
        return
      }

      currentUserIdRef.current = newUserId
      setUser(session?.user ?? null)

      if (session?.user) {
        try {
          const userProfile = await fetchProfile(session.user.id)
          if (mounted) setProfile(userProfile)
        } catch (err) {
          console.error('Error fetching profile on auth change:', err)
        }
      } else {
        setProfile(null)
      }

      // Ensure loading is false after any auth state change
      if (mounted) setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { error: new Error(error.message), profile: null }
    }

    let userProfile = null

    // Manually update state to avoid race condition with onAuthStateChange
    if (data.user) {
      // Set ref FIRST to prevent onAuthStateChange from re-fetching
      currentUserIdRef.current = data.user.id

      // Fetch profile before updating React state
      userProfile = await fetchProfile(data.user.id)

      // Update all state together
      setUser(data.user)
      setSession(data.session)
      setProfile(userProfile)
      setLoading(false)
    }

    return { error: null, profile: userProfile }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { error: error ? new Error(error.message) : null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
  }

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchProfile(user.id)
      setProfile(userProfile)
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
