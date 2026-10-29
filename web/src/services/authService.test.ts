import { FirebaseError } from 'firebase/app';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from './api';

const { authMock, createUserMock, signInMock, signOutMock } = vi.hoisted(() => ({
  authMock: { currentUser: null },
  createUserMock: vi.fn(),
  signInMock: vi.fn(),
  signOutMock: vi.fn(),
}));

vi.mock('../lib/firebase', () => ({
  auth: authMock,
}));

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: createUserMock,
  signInWithEmailAndPassword: signInMock,
  signOut: signOutMock,
}));

import { logout, register } from './authService';

const profile = {
  username: 'joaosilva',
  name: 'João Silva',
};

const backendUser = {
  id: 'b3f1c0de-4a2e-4c1b-9d57-0e8f6a1c2d34',
  username: 'joaosilva',
  name: 'João Silva',
  email: 'joao@email.com',
  phone: null,
  bio: null,
  hometown: null,
  role: 'USER',
  status: 'ACTIVE',
  createdAt: '2026-10-21T14:30:00Z',
};

function createFirebaseUser() {
  return {
    getIdToken: vi.fn().mockResolvedValue('firebase-id-token'),
  };
}

function setCurrentUser(user: unknown) {
  Object.assign(authMock, { currentUser: user });
}

function mockFetchResponse(
  fetchMock: ReturnType<typeof vi.fn>,
  response: { ok: boolean; status: number; json?: unknown },
) {
  fetchMock.mockResolvedValue({
    ok: response.ok,
    status: response.status,
    json: vi.fn().mockResolvedValue(response.json ?? null),
  });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

describe('register', () => {
  it('cria a conta no Firebase e envia o token e o body para /auth/register', async () => {
    const firebaseUser = createFirebaseUser();
    createUserMock.mockResolvedValue({ user: firebaseUser });
    mockFetchResponse(fetchMock, { ok: true, status: 201, json: backendUser });

    const result = await register('joao@email.com', 'senha123!', profile);

    expect(createUserMock).toHaveBeenCalledWith(
      authMock,
      'joao@email.com',
      'senha123!',
    );
    expect(firebaseUser.getIdToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/register'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer firebase-id-token',
        }),
        body: JSON.stringify(profile),
      }),
    );
    expect(result).toEqual(backendUser);
  });

  it('envia apenas os campos de perfil informados, sem email ou senha no body', async () => {
    const firebaseUser = createFirebaseUser();
    createUserMock.mockResolvedValue({ user: firebaseUser });
    mockFetchResponse(fetchMock, { ok: true, status: 201, json: backendUser });

    await register('joao@email.com', 'senha123!', {
      username: 'joaosilva',
      name: 'João Silva',
      phone: '+5583999999999',
      bio: 'Mochileiro',
      hometown: 'Campina Grande, PB',
    });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(options.body));

    expect(body).toEqual({
      username: 'joaosilva',
      name: 'João Silva',
      phone: '+5583999999999',
      bio: 'Mochileiro',
      hometown: 'Campina Grande, PB',
    });
    expect(body).not.toHaveProperty('email');
    expect(body).not.toHaveProperty('password');
    expect(body).not.toHaveProperty('id');
    expect(body).not.toHaveProperty('role');
    expect(body).not.toHaveProperty('status');
  });

  it('recupera a conta Firebase existente quando o e-mail já foi criado', async () => {
    const firebaseUser = createFirebaseUser();
    createUserMock.mockRejectedValue(
      new FirebaseError('auth/email-already-in-use', 'email in use'),
    );
    signInMock.mockResolvedValue({ user: firebaseUser });
    mockFetchResponse(fetchMock, { ok: true, status: 201, json: backendUser });

    const result = await register('joao@email.com', 'senha123!', profile);

    expect(signInMock).toHaveBeenCalledWith(
      authMock,
      'joao@email.com',
      'senha123!',
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/register'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer firebase-id-token',
        }),
      }),
    );
    expect(result).toEqual(backendUser);
  });

  it('propaga erro de credenciais quando a recuperação de conta falha', async () => {
    createUserMock.mockRejectedValue(
      new FirebaseError('auth/email-already-in-use', 'email in use'),
    );
    signInMock.mockRejectedValue(
      new FirebaseError('auth/invalid-credential', 'invalid'),
    );

    await expect(
      register('joao@email.com', 'senha123!', profile),
    ).rejects.toMatchObject({ code: 'auth/invalid-credential' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('encerra a sessão Firebase quando o backend responde 401', async () => {
    const firebaseUser = createFirebaseUser();
    createUserMock.mockResolvedValue({ user: firebaseUser });
    mockFetchResponse(fetchMock, {
      ok: false,
      status: 401,
      json: { message: 'unauthorized' },
    });

    const error = await register('joao@email.com', 'senha123!', profile).catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 401 });
    expect(signOutMock).toHaveBeenCalledWith(authMock);
  });

  it('propaga 409 sem encerrar a sessão', async () => {
    const firebaseUser = createFirebaseUser();
    createUserMock.mockResolvedValue({ user: firebaseUser });
    mockFetchResponse(fetchMock, {
      ok: false,
      status: 409,
      json: { message: 'conflict' },
    });

    const error = await register('joao@email.com', 'senha123!', profile).catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 409 });
    expect(signOutMock).not.toHaveBeenCalled();
  });

  it('permite repetir o cadastro do perfil após falha de rede pós-criação da conta', async () => {
    const firebaseUser = createFirebaseUser();
    createUserMock.mockResolvedValue({ user: firebaseUser });
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(
      register('joao@email.com', 'senha123!', profile),
    ).rejects.toBeInstanceOf(TypeError);

    createUserMock.mockRejectedValue(
      new FirebaseError('auth/email-already-in-use', 'email in use'),
    );
    signInMock.mockResolvedValue({ user: firebaseUser });
    mockFetchResponse(fetchMock, { ok: true, status: 201, json: backendUser });

    const result = await register('joao@email.com', 'senha123!', profile);

    expect(signInMock).toHaveBeenCalledWith(
      authMock,
      'joao@email.com',
      'senha123!',
    );
    expect(result).toEqual(backendUser);
  });
});

describe('logout', () => {
  beforeEach(() => {
    setCurrentUser(null);
  });

  it('envia o token para /auth/logout e encerra a sessão Firebase', async () => {
    const firebaseUser = createFirebaseUser();
    setCurrentUser(firebaseUser);
    mockFetchResponse(fetchMock, { ok: true, status: 204 });

    await logout();

    expect(firebaseUser.getIdToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/logout'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer firebase-id-token',
        }),
      }),
    );
    expect(signOutMock).toHaveBeenCalledWith(authMock);
  });

  it('encerra a sessão Firebase quando o backend responde 401', async () => {
    setCurrentUser(createFirebaseUser());
    mockFetchResponse(fetchMock, {
      ok: false,
      status: 401,
      json: { message: 'unauthorized' },
    });

    await expect(logout()).rejects.toThrow();
    expect(signOutMock).toHaveBeenCalledWith(authMock);
  });

  it('encerra a sessão Firebase quando não consegue obter o token', async () => {
    setCurrentUser({
      getIdToken: vi.fn().mockRejectedValue(new Error('token expirado')),
    });

    await expect(logout()).rejects.toThrow('token expirado');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(signOutMock).toHaveBeenCalledWith(authMock);
  });

  it('não chama o backend quando não há usuário autenticado', async () => {
    await logout();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(signOutMock).not.toHaveBeenCalled();
  });
});
