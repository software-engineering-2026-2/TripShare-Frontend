import { createContext } from 'react'
import type { Session } from './auth-storage'

export type AuthContextValue = {
  session: Session | null
  isAuthenticated: boolean
  signIn: (name: string, expiresInMs?: number) => void
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
