import { createContext, useContext, useEffect, useState, useRef, useMemo, useCallback, type ReactNode } from 'react'
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

  // Use refs to track state across async operations
  const currentUserIdRef = useRef<string | null>(null)
  const initialLoadCompleteRef = useRef(false)

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    console.log('[Auth] fetchProfile called for user:', userId)

    try {
      console.log('[Auth] Starting profile query...')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('[Auth] Profile fetch failed:', error.message)
        return null
      }

      console.log('[Auth] Query completed:', { data: data?.id })

      if (!data) {
        console.warn('[Auth] No profile found for user:', userId)
        return null
      }

      console.log('[Auth] Profile fetched successfully:', data.id)

      // Check if video edits counter needs to be reset (new month)
      if (data.video_edits_reset_at) {
        const resetDate = new Date(data.video_edits_reset_at)
        const now = new Date()

        const isDifferentMonth = resetDate.getMonth() !== now.getMonth() ||
          resetDate.getFullYear() !== now.getFullYear()

        if (isDifferentMonth && data.video_edits_this_month > 0) {
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
    } catch (err) {
      console.error('[Auth] Profile fetch error:', err)
      return null
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const initSession = async () => {
      console.log('[Auth] initSession starting...')
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('[Auth] getSession result:', { hasSession: !!session, error: error?.message })

        if (!mounted) return

        if (error) {
          if (error.name !== 'AuthSessionMissingError' && !error.message?.includes('Auth session missing')) {
            console.error('[Auth] Error getting session:', error)
          }
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
          initialLoadCompleteRef.current = true
          console.log('[Auth] No session, loading set to false')
          return
        }

        if (session?.user) {
          console.log('[Auth] Session found, fetching profile for:', session.user.id)
          currentUserIdRef.current = session.user.id
          const userProfile = await fetchProfile(session.user.id)

          if (mounted) {
            setSession(session)
            setUser(session.user)
            setProfile(userProfile)
            console.log('[Auth] State updated with profile:', userProfile?.id)
          }
        } else {
          console.log('[Auth] No user in session')
          setSession(null)
          setUser(null)
          setProfile(null)
        }
      } catch (err) {
        console.error('[Auth] Session init error:', err)
        if (mounted) {
          setSession(null)
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
          initialLoadCompleteRef.current = true
          console.log('[Auth] initSession complete, loading set to false')
        }
      }
    }

    initSession()

    // Listen for auth changes (but skip the initial event since initSession handles it)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return

      // Skip if initial load hasn't completed (initSession will handle it)
      if (!initialLoadCompleteRef.current && event === 'INITIAL_SESSION') {
        return
      }

      // Handle sign out
      if (event === 'SIGNED_OUT') {
        currentUserIdRef.current = null
        setSession(null)
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      const newUserId = newSession?.user?.id ?? null

      // Skip if user hasn't changed
      if (newUserId === currentUserIdRef.current && initialLoadCompleteRef.current) {
        return
      }

      currentUserIdRef.current = newUserId
      setSession(newSession)
      setUser(newSession?.user ?? null)

      if (newSession?.user) {
        const userProfile = await fetchProfile(newSession.user.id)
        if (mounted) {
          setProfile(userProfile)
        }
      } else {
        setProfile(null)
      }

      if (mounted) {
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return { error: new Error(error.message), profile: null }
    }

    let userProfile = null

    if (data.user) {
      // Set ref FIRST to prevent onAuthStateChange from re-fetching
      currentUserIdRef.current = data.user.id
      userProfile = await fetchProfile(data.user.id)

      // Batch state updates
      setUser(data.user)
      setSession(data.session)
      setProfile(userProfile)
      setLoading(false)
    }

    return { error: null, profile: userProfile }
  }, [fetchProfile])

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
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
  }, [])

  const signOut = useCallback(async () => {
    currentUserIdRef.current = null
    await supabase.auth.signOut()
    setProfile(null)
    setUser(null)
    setSession(null)
  }, [])

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
  }, [])

  const refreshProfile = useCallback(async () => {
    console.log('[Auth] refreshProfile called, user:', user?.id)
    if (user) {
      const userProfile = await fetchProfile(user.id)
      setProfile(userProfile)
      console.log('[Auth] Profile refreshed:', userProfile?.plan)
    }
  }, [user, fetchProfile])

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    refreshProfile,
  }), [user, profile, session, loading, signIn, signUp, signOut, signInWithGoogle, refreshProfile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
