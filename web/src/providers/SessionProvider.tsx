import { QueryClientProvider } from '@tanstack/react-query';
import {
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { createQueryClient } from '../commons/react-query/queryClient';
import { initializeAuthSession } from '../resources/auth/flow';
import {
  getAuthSession,
  subscribeAuthSession,
} from '../resources/auth/session';
import { SessionContext } from './session';

export default function SessionProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(subscribeAuthSession, getAuthSession);
  const account = session.status === 'authenticated' ? session.uid : null;
  const { client } = useMemo(
    () => ({ account, client: createQueryClient() }),
    [account],
  );
  useEffect(initializeAuthSession, []);
  useEffect(() => () => client.clear(), [client]);
  return (
    <SessionContext.Provider value={session}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </SessionContext.Provider>
  );
}
