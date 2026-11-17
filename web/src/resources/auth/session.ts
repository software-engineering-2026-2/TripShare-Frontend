import type { User } from 'firebase/auth';
import type { UserProfile } from '../api/auth/contract';
export type SessionStatus =
  | 'restoring'
  | 'disconnected'
  | 'authenticating'
  | 'pending'
  | 'authenticated'
  | 'error';
export interface AuthSession {
  status: SessionStatus;
  ready: boolean;
  uid: string | null;
  token: string | null;
  profile: UserProfile | null;
  user: User | null;
  error: string | null;
}
let session: AuthSession = {
  status: 'restoring',
  ready: false,
  uid: null,
  token: null,
  profile: null,
  user: null,
  error: null,
};
const listeners = new Set<() => void>();
export const getAuthSession = () => session;
export function subscribeAuthSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function publishSession(
  status: SessionStatus,
  values: Partial<AuthSession> = {},
) {
  session = {
    status,
    ready: status !== 'restoring',
    uid: null,
    token: null,
    profile: null,
    user: null,
    error: null,
    ...values,
  };
  listeners.forEach((listener) => listener());
}
