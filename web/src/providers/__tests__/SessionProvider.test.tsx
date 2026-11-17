import { publishSession } from '../../resources/auth/session';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useSession } from '../session';
import SessionProvider from '../SessionProvider';

vi.mock('../../resources/auth/flow', () => ({
  initializeAuthSession: () => () => {},
}));
afterEach(cleanup);

it('renova e limpa o cache ao trocar de conta ou sair', () => {
  publishSession('restoring');
  let client: QueryClient | undefined;

  function SessionDetails() {
    const session = useSession();
    client = useQueryClient();
    return (
      <p>
        {session.ready ? (session.uid ?? 'Sem sessão') : 'Aguardando sessão'}
      </p>
    );
  }

  render(
    <SessionProvider>
      <SessionDetails />
    </SessionProvider>,
  );
  expect(screen.getByText('Aguardando sessão')).toBeInTheDocument();

  const onAuthChange = (user: { uid: string } | null) =>
    publishSession(user ? 'authenticated' : 'disconnected', {
      uid: user?.uid ?? null,
    });
  act(() => onAuthChange({ uid: 'conta-a' }));
  const accountA = client!;
  accountA.setQueryData(['some-private-data'], 'Conta A');

  act(() => onAuthChange({ uid: 'conta-b' }));
  expect(screen.getByText('conta-b')).toBeInTheDocument();
  expect(client?.getQueryData(['some-private-data'])).toBeUndefined();
  expect(accountA.getQueryCache().getAll()).toHaveLength(0);
  const accountB = client!;
  accountB.setQueryData(['some-private-data'], 'Conta B');

  act(() => onAuthChange(null));
  expect(screen.getByText('Sem sessão')).toBeInTheDocument();
  expect(accountB.getQueryCache().getAll()).toHaveLength(0);
});
