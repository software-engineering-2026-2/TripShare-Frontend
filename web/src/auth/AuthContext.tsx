import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AuthContext } from './auth-context'
import {
  clearSession,
  readSession,
  SESSION_STORAGE_KEY,
  writeSession,
  type Session,
} from './auth-storage'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(() =>
    readSession(window.localStorage),
  )

  const signOut = useCallback(() => {
    clearSession(window.localStorage)
    setSession(null)
  }, [])

  useEffect(() => {
    if (!session) {
      return
    }

    const remainingTime = session.expiresAt - Date.now()
    if (remainingTime <= 0) {
      const timeoutId = window.setTimeout(signOut, 0)
      return () => window.clearTimeout(timeoutId)
    }

    const timeoutId = window.setTimeout(signOut, remainingTime)
    return () => window.clearTimeout(timeoutId)
  }, [session, signOut])

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SESSION_STORAGE_KEY) {
        setSession(readSession(window.localStorage))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const signIn = useCallback((name: string, expiresInMs = 60 * 60 * 1000) => {
    const nextSession: Session = {
      user: {
        id: name.toLowerCase().replaceAll(' ', '-'),
        name,
      },
      expiresAt: Date.now() + expiresInMs,
    }
    writeSession(window.localStorage, nextSession)
    setSession(nextSession)
  }, [])

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: session !== null,
      signIn,
      signOut,
    }),
    [session, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
