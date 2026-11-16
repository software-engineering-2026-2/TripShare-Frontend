import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  authMock,
  createUserMock,
  googleProviderMock,
  signInMock,
  signInWithPopupMock,
  signOutMock,
} = vi.hoisted(() => ({
  authMock: { currentUser: null },
  createUserMock: vi.fn(),
  googleProviderMock: class GoogleAuthProviderMock {},
  signInMock: vi.fn(),
  signInWithPopupMock: vi.fn(),
  signOutMock: vi.fn(),
}));

vi.mock('../lib/firebase', () => ({
  auth: authMock,
}));

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: googleProviderMock,
  createUserWithEmailAndPassword: createUserMock,
  signInWithEmailAndPassword: signInMock,
  signInWithPopup: signInWithPopupMock,
  signOut: signOutMock,
}));

import { loginWithGoogle, logout } from './authService';

function createFirebaseUser() {
  return {
    getIdToken: vi.fn().mockResolvedValue('firebase-id-token'),
  };
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

function setCurrentUser(user: unknown) {
  Object.assign(authMock, { currentUser: user });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
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

describe('loginWithGoogle', () => {
  it('autentica usando o provedor Google e retorna o usuário', async () => {
    const user = { uid: 'google-user' };
    signInWithPopupMock.mockResolvedValue({ user });

    await expect(loginWithGoogle()).resolves.toBe(user);

    expect(signInWithPopupMock).toHaveBeenCalledWith(
      authMock,
      expect.any(googleProviderMock),
    );
  });
});
