export const SESSION_STORAGE_KEY = 'tripshare.session'

export type Session = {
  user: {
    id: string
    name: string
  }
  expiresAt: number
}

export function readSession(storage: Storage): Session | null {
  const value = storage.getItem(SESSION_STORAGE_KEY)
  if (!value) {
    return null
  }

  try {
    const session = JSON.parse(value) as Session
    if (
      typeof session.expiresAt !== 'number' ||
      !session.user?.id ||
      !session.user.name ||
      session.expiresAt <= Date.now()
    ) {
      storage.removeItem(SESSION_STORAGE_KEY)
      return null
    }

    return session
  } catch {
    storage.removeItem(SESSION_STORAGE_KEY)
    return null
  }
}

export function writeSession(storage: Storage, session: Session): void {
  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearSession(storage: Storage): void {
  storage.removeItem(SESSION_STORAGE_KEY)
}
