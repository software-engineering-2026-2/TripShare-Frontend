import { createContext, useContext } from 'react';
import { getAuthSession, type AuthSession } from '../resources/auth/session';
export const SessionContext = createContext<AuthSession>(getAuthSession());
export function useSession() {
  return useContext(SessionContext);
}
