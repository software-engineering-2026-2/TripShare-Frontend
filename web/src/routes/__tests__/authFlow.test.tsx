import { publishSession } from '../../resources/auth/session';
import type { User } from 'firebase/auth';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { appRoutes } from '..';
import { routes } from '../paths';
import SessionProvider from '../../providers/SessionProvider';

const { authMock, createUser, signIn, signInGoogle, signOut, listeners } =
  vi.hoisted(() => ({
    authMock: { currentUser: null as User | null, authStateReady: vi.fn() },
    createUser: vi.fn(),
    signIn: vi.fn(),
    signInGoogle: vi.fn(),
    signOut: vi.fn(),
    listeners: new Set<(user: User | null) => void>(),
  }));

vi.mock('../../resources/client/firebase', () => ({ auth: authMock }));
vi.mock('../../commons/config/env', () => ({ USE_MOCKS: false }));
vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: class {},
  createUserWithEmailAndPassword: createUser,
  signInWithEmailAndPassword: signIn,
  signInWithPopup: signInGoogle,
  signOut,
  browserLocalPersistence: {},
  setPersistence: async () => {},
  validatePassword: async () => ({ isValid: true }),
  deleteUser: async () => {
    authMock.currentUser = null;
    listeners.forEach((listener) => listener(null));
  },
  onIdTokenChanged: (_auth: unknown, listener: (user: User | null) => void) => {
    listeners.add(listener);
    void authMock.authStateReady().then(() => listener(authMock.currentUser));
    return () => listeners.delete(listener);
  },
}));

const firebaseUser = {
  uid: 'firebase-ana',
  email: 'ana@example.com',
  displayName: 'Ana Silva',
  getIdToken: async () => 'id-token-ana',
} as User;
const profile = {
  id: 'internal-ana',
  uuid: firebaseUser.uid,
  username: 'ana',
  name: 'Ana Silva',
  email: firebaseUser.email,
  status: 'ACTIVE',
};

let fetchMock: ReturnType<typeof vi.fn>;

function respond(status: number, body: unknown = {}) {
  return new Response(JSON.stringify(body), { status });
}

function setUser(user: User | null) {
  authMock.currentUser = user;
  listeners.forEach((listener) => listener(user));
}

function renderFlow(path: string = routes.register) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  const view = render(
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>,
  );
  return { router, ...view };
}

function fillNewAccount() {
  for (const [label, value] of [
    ['Nome de usuário', 'ana'],
    ['Nome de exibição', 'Ana Silva'],
    ['E-mail', 'ana@example.com'],
    ['Senha', 'senha123!'],
    ['Confirmação de senha', 'senha123!'],
  ])
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  publishSession('restoring');
  authMock.currentUser = null;
  authMock.authStateReady.mockResolvedValue(undefined);
  for (const method of [createUser, signIn, signInGoogle]) {
    method.mockImplementation(async () => {
      setUser(firebaseUser);
      return { user: firebaseUser };
    });
  }
  signOut.mockImplementation(async () => setUser(null));
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('fluxo integrado de cadastro e sessão', () => {
  it('não redireciona após uma resposta tardia se o usuário já saiu do cadastro', async () => {
    let finish!: (response: Response) => void;
    fetchMock.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    );
    const { router } = renderFlow();
    await screen.findByLabelText('Nome de usuário');
    fillNewAccount();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
    await act(async () => {
      await router.navigate(routes.passwordRecovery);
    });
    await screen.findByRole('heading', {
      name: 'Recuperação de senha indisponível',
    });
    await act(async () => finish(respond(201, profile)));
    expect(router.state.location.pathname).toBe(routes.passwordRecovery);
  });
  it('cadastro direto aguarda o perfil ser salvo e entra em viagens sem passar pelo login', async () => {
    let finish!: (response: Response) => void;
    fetchMock.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    );
    const { router } = renderFlow();
    const visited: string[] = [];
    const unsubscribe = router.subscribe((state) =>
      visited.push(state.location.pathname),
    );
    await screen.findByRole('heading', { name: 'Crie sua conta no TripShare' });
    fillNewAccount();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(router.state.location.pathname).toBe(routes.register);
    expect(screen.getByLabelText('Nome de usuário')).toHaveValue('ana');
    expect(screen.getByLabelText('E-mail')).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Cadastrando...' }),
    ).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledOnce();
    await act(async () => finish(respond(201, profile)));

    expect(
      await screen.findByRole('heading', { name: 'Minhas Viagens' }),
    ).toBeInTheDocument();
    expect(visited).not.toContain(routes.login);
    expect(router.state.historyAction).toBe('REPLACE');
    expect(createUser).toHaveBeenCalledOnce();
    expect(signIn).not.toHaveBeenCalled();
    unsubscribe();
  });

  it.each([routes.login, routes.register])(
    'conta completa abre %s e segue para viagens',
    async (path) => {
      authMock.currentUser = firebaseUser;
      fetchMock.mockResolvedValue(respond(200, profile));
      const { router } = renderFlow(path);
      expect(
        await screen.findByRole('heading', { name: 'Minhas Viagens' }),
      ).toBeInTheDocument();
      expect(router.state.location.pathname).toBe(routes.trips);
      expect(createUser).not.toHaveBeenCalled();
      expect(signIn).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledOnce();
    },
  );

  it('aguarda a sessão restaurada sem apresentar o formulário de uma nova conta', async () => {
    let restore!: () => void;
    authMock.authStateReady.mockReturnValue(
      new Promise<void>((resolve) => {
        restore = resolve;
      }),
    );
    fetchMock.mockResolvedValue(respond(200, profile));
    renderFlow();
    expect(screen.getByRole('status')).toHaveTextContent('Carregando sessão');
    expect(screen.queryByLabelText('E-mail')).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    await act(async () => {
      authMock.currentUser = firebaseUser;
      restore();
    });
    expect(
      await screen.findByRole('heading', { name: 'Minhas Viagens' }),
    ).toBeInTheDocument();
  });

  it.each(['Google', 'senha'])(
    'login por %s sem perfil conclui o cadastro com o mesmo UID',
    async (provider) => {
      fetchMock.mockImplementation(async (url: string) =>
        url.endsWith('/auth/login') ? respond(404) : respond(201, profile),
      );
      const { router } = renderFlow(routes.login);
      await screen.findByRole('heading', { name: 'Entrar na conta' });
      if (provider === 'Google') {
        await userEvent.click(
          screen.getByRole('button', { name: 'Continuar com o Google' }),
        );
      } else {
        fireEvent.change(screen.getByLabelText('E-mail'), {
          target: { value: 'ana@example.com' },
        });
        fireEvent.change(screen.getByLabelText('Senha'), {
          target: { value: 'senha123!' },
        });
        await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
      }
      await screen.findByRole('heading', {
        name: 'Complete seu cadastro no TripShare',
      });
      expect(router.state.location.pathname).toBe(routes.register);
      expect(screen.queryByLabelText('Senha')).not.toBeInTheDocument();
      expect(screen.getByLabelText('E-mail')).toHaveValue('ana@example.com');
      fireEvent.change(screen.getByLabelText('Nome de usuário'), {
        target: { value: 'ana' },
      });
      await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
      await screen.findByRole('heading', { name: 'Minhas Viagens' });
      expect(createUser).not.toHaveBeenCalled();
      const [, options] = fetchMock.mock.calls.find(([url]) =>
        String(url).endsWith('/auth/register'),
      )!;
      expect(JSON.parse(options.body)).toEqual({
        username: 'ana',
        name: 'Ana Silva',
        uuid: firebaseUser.uid,
      });
      expect(options.headers.Authorization).toBe('Bearer id-token-ana');
    },
  );

  it('preserva os dados no conflito de nome e permite corrigir sem redirecionar', async () => {
    fetchMock
      .mockResolvedValueOnce(respond(409))
      .mockResolvedValueOnce(respond(404))
      .mockResolvedValueOnce(respond(201, profile));
    const { router } = renderFlow();
    await screen.findByLabelText('Nome de usuário');
    fillNewAccount();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'nome de usuário já está em uso',
    );
    expect(router.state.location.pathname).toBe(routes.register);
    expect(screen.getByLabelText('E-mail')).toHaveValue('ana@example.com');
    fireEvent.change(screen.getByLabelText('Nome de usuário'), {
      target: { value: 'ana2' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
    await screen.findByRole('heading', { name: 'Minhas Viagens' });
    expect(signIn).not.toHaveBeenCalled();
  });

  it('retoma uma conta Firebase após falha de rede e recarregamento do cadastro', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const firstVisit = renderFlow();
    await screen.findByLabelText('Nome de usuário');
    fillNewAccount();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Falha de conexão',
    );
    firstVisit.unmount();
    firstVisit.router.dispose();
    fetchMock
      .mockResolvedValueOnce(respond(404))
      .mockResolvedValueOnce(respond(404))
      .mockResolvedValueOnce(respond(201, profile));
    renderFlow();
    await screen.findByRole('heading', {
      name: 'Complete seu cadastro no TripShare',
    });
    fireEvent.change(screen.getByLabelText('Nome de usuário'), {
      target: { value: 'ana' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
    await screen.findByRole('heading', { name: 'Minhas Viagens' });
    expect(createUser).toHaveBeenCalledOnce();
    expect(signIn).not.toHaveBeenCalled();
  });

  it.each([403, 503])(
    'falha %s na restauração mostra erro e permite tentar novamente',
    async (status) => {
      authMock.currentUser = firebaseUser;
      fetchMock.mockResolvedValueOnce(respond(status));
      const { router } = renderFlow();
      await screen.findByRole('alert');
      expect(
        screen.queryByLabelText('Nome de usuário'),
      ).not.toBeInTheDocument();
      expect(router.state.location.pathname).toBe(routes.register);
      fetchMock.mockResolvedValueOnce(respond(200, profile));
      await userEvent.click(
        screen.getByRole('button', { name: 'Tentar novamente' }),
      );
      await screen.findByRole('heading', { name: 'Minhas Viagens' });
    },
  );

  it('permite sair da conta incompleta para entrar com outra conta', async () => {
    authMock.currentUser = firebaseUser;
    fetchMock.mockResolvedValueOnce(respond(404));
    const { router } = renderFlow();
    await screen.findByRole('heading', {
      name: 'Complete seu cadastro no TripShare',
    });
    await userEvent.click(
      screen.getByRole('button', { name: 'Usar outra conta' }),
    );
    await screen.findByRole('heading', { name: 'Entrar na conta' });
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(routes.login),
    );
    expect(authMock.currentUser).toBeNull();
    expect(signOut).toHaveBeenCalledOnce();
  });
});
