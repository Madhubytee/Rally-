'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { getSupabaseBrowser } from '@/lib/supabase/client'

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  configured: false,
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

/**
 * Who is signed in, for the whole client tree.
 *
 * Only organizers ever sign in. Residents report and volunteers join with no
 * account at all, so `user === null` is the normal state for most visitors
 * and nothing outside the publish flow should gate on it.
 */
export default function AuthProvider({ children }) {
  const supabase = getSupabaseBrowser()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return undefined

    let active = true

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      setUser(data.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase])

  /* The host name shown on published events, kept separate from the account. */
  useEffect(() => {
    if (!supabase || !user) {
      setProfile(null)
      return
    }

    supabase
      .from('profiles')
      .select('host_name')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data ?? null))
  }, [supabase, user])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      configured: Boolean(supabase),
      hostName: profile?.host_name || user?.user_metadata?.host_name || 'A neighbor',
      signOut: async () => {
        await supabase?.auth.signOut()
        setUser(null)
      },
    }),
    [user, profile, loading, supabase],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
