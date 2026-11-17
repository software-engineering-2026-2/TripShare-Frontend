import type { User } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: { currentUser: null as User | null, authStateReady: vi.fn() },
  create: vi.fn(),
  login: vi.fn(),
  google: vi.fn(),
  remove: vi.fn(),
  signOut: vi.fn(),
  persistence: vi.fn(),
  policy: vi.fn(),
  observer: vi.fn(),
}));
vi.mock('../../client/firebase', () => ({ auth: mocks.auth }));
vi.mock('firebase/auth', () => ({
  browserLocalPersistence: 'local',
  setPersistence: mocks.persistence,
  createUserWithEmailAndPassword: mocks.create,
  signInWithEmailAndPassword: mocks.login,
  signInWithPopup: mocks.google,
  GoogleAuthProvider: class {},
  deleteUser: mocks.remove,
  signOut: mocks.signOut,
  validatePassword: mocks.policy,
  onIdTokenChanged: mocks.observer,
}));
let service: typeof import('../flow');
let store: typeof import('../session');
let fetchMock: ReturnType<typeof vi.fn>;
let user: User;
const profileInput = { username: 'ana', name: 'Ana Silva' };
const profile = {
  id: 'internal-id',
  uuid: 'firebase-uid',
  status: 'ACTIVE',
  ...profileInput,
};
const response = (status = 200, body: unknown = profile) =>
  new Response(JSON.stringify(body), { status });
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}
async function register() {
  return service.register('ana@example.com', 'Password123!', profileInput);
}

beforeEach(async () => {
  vi.resetModules();
  vi.resetAllMocks();
  localStorage.clear();
  user = {
    uid: 'firebase-uid',
    email: 'ana@example.com',
    getIdToken: vi.fn().mockResolvedValue('token-1'),
  } as unknown as User;
  mocks.auth.currentUser = null;
  mocks.auth.authStateReady.mockResolvedValue(undefined);
  mocks.policy.mockResolvedValue({ isValid: true });
  for (const method of [mocks.create, mocks.login, mocks.google])
    method.mockImplementation(async () => {
      mocks.auth.currentUser = user;
      return { user };
    });
  mocks.remove.mockImplementation(async () => {
    mocks.auth.currentUser = null;
  });
  mocks.signOut.mockImplementation(async () => {
    mocks.auth.currentUser = null;
  });
  mocks.observer.mockReturnValue(() => {});
  fetchMock = vi.fn().mockImplementation(async () => response());
  vi.stubGlobal('fetch', fetchMock);
  service = await import('../flow');
  store = await import('../session');
});
afterEach(() => vi.unstubAllGlobals());

it('valida os campos e a política de senha antes de criar qualquer conta', async () => {
  await expect(
    service.register('invalid', 'x', profileInput),
  ).rejects.toThrow();
  expect(mocks.create).not.toHaveBeenCalled();
  mocks.policy.mockResolvedValue({ isValid: false });
  await expect(register()).rejects.toThrow('política');
  expect(mocks.create).not.toHaveBeenCalled();
  expect(fetchMock).not.toHaveBeenCalled();
});
it('não chama o backend quando o Firebase rejeita e-mail já existente nem faz login implícito', async () => {
  mocks.create.mockRejectedValue(
    new FirebaseError('auth/email-already-in-use', 'exists'),
  );
  await expect(register()).rejects.toMatchObject({
    code: 'auth/email-already-in-use',
  });
  expect(mocks.login).not.toHaveBeenCalled();
  expect(fetchMock).not.toHaveBeenCalled();
  expect(mocks.remove).not.toHaveBeenCalled();
});
it('cadastro confirma as duas etapas, normaliza telefone e publica UID, token e perfil', async () => {
  await service.register('ana@example.com', 'Password123!', {
    ...profileInput,
    phone: '(83) 99999-9999',
  });
  expect(mocks.persistence).toHaveBeenCalledWith(mocks.auth, 'local');
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/auth/register'),
    expect.objectContaining({
      method: 'POST',
      headers: {
        Authorization: 'Bearer token-1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...profileInput,
        phone: '+5583999999999',
        uuid: user.uid,
      }),
    }),
  );
  expect(store.getAuthSession()).toMatchObject({
    status: 'authenticated',
    uid: user.uid,
    token: 'token-1',
    profile,
  });
  expect(localStorage.length).toBe(0);
});
it.each([400, 401, 403])(
  'compensa rejeição %s excluindo apenas a conta recém-criada',
  async (status) => {
    fetchMock.mockResolvedValue(response(status));
    await expect(register()).rejects.toMatchObject({ status });
    expect(mocks.remove).toHaveBeenCalledWith(user);
    expect(store.getAuthSession().status).toBe('disconnected');
    expect(localStorage.length).toBe(0);
  },
);
it('409 seguido de 404 desfaz a conta; 409 com perfil confirmado conclui o cadastro', async () => {
  fetchMock
    .mockResolvedValueOnce(response(409))
    .mockResolvedValueOnce(response(404));
  await expect(register()).rejects.toMatchObject({ status: 409 });
  expect(mocks.remove).toHaveBeenCalledOnce();
  fetchMock
    .mockResolvedValueOnce(response(409))
    .mockResolvedValueOnce(response());
  await expect(register()).resolves.toEqual(profile);
  expect(mocks.remove).toHaveBeenCalledOnce();
});
it.each([400, 401, 403, 409])(
  'jamais exclui conta preexistente após rejeição %s',
  async (status) => {
    mocks.auth.currentUser = user;
    fetchMock
      .mockResolvedValueOnce(response(404))
      .mockResolvedValueOnce(response(status))
      .mockResolvedValueOnce(response(404));
    await expect(
      service.completeRegistration(user.uid, profileInput),
    ).rejects.toMatchObject({ status });
    expect(mocks.remove).not.toHaveBeenCalled();
    expect(store.getAuthSession().status).toBe('pending');
  },
);
it('falha na compensação persiste apenas UID e etapa, bloqueia acesso e permite recuperação', async () => {
  fetchMock.mockResolvedValue(response(400));
  mocks.remove.mockRejectedValueOnce(new Error('offline'));
  await expect(register()).rejects.toThrow('desfazer');
  expect(
    JSON.parse(localStorage.getItem('tripshare.registration.firebase-uid')!),
  ).toEqual({ uid: user.uid, phase: 'rollback' });
  await expect(service.getIdToken()).rejects.toThrow();
  await service.restoreSession();
  expect(mocks.remove).toHaveBeenCalledTimes(2);
  expect(localStorage.length).toBe(0);
});
it.each([500, 503, 'network'])(
  'mantém resultado incerto em %s e não exclui após 404 e rejeição posterior',
  async (failure) => {
    if (failure === 'network')
      fetchMock.mockRejectedValueOnce(new TypeError('offline'));
    else fetchMock.mockResolvedValueOnce(response(Number(failure)));
    await expect(register()).rejects.toBeDefined();
    expect(store.getAuthSession().status).toBe('pending');
    fetchMock
      .mockResolvedValueOnce(response(404))
      .mockResolvedValueOnce(response(400));
    await expect(register()).rejects.toMatchObject({ status: 400 });
    expect(mocks.remove).not.toHaveBeenCalled();
    expect(mocks.create).toHaveBeenCalledOnce();
    await expect(service.getIdToken()).rejects.toThrow();
  },
);
it('resposta perdida é recuperada pela consulta ao perfil, sem reenviar cadastro', async () => {
  fetchMock.mockRejectedValueOnce(new TypeError('offline'));
  await expect(register()).rejects.toThrow();
  await expect(register()).resolves.toEqual(profile);
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(mocks.create).toHaveBeenCalledOnce();
});
it('login consulta o backend e só então permite requisições privadas', async () => {
  const pending = deferred<Response>();
  fetchMock.mockReturnValueOnce(pending.promise);
  const login = service.login('ana@example.com', 'Password123!');
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
  expect(store.getAuthSession().status).toBe('authenticating');
  await expect(service.getIdToken()).rejects.toThrow();
  pending.resolve(response());
  await login;
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/auth/login'),
    expect.objectContaining({ body: JSON.stringify({ uuid: user.uid }) }),
  );
  await expect(service.getIdToken()).resolves.toBe('token-1');
});
it.each([403, 503])(
  'login rejeitado pelo backend %s nunca publica credenciais privadas',
  async (status) => {
    fetchMock.mockResolvedValue(response(status));
    await expect(
      service.login('ana@example.com', 'Password123!'),
    ).rejects.toMatchObject({ status });
    expect(store.getAuthSession()).toMatchObject({
      status: 'error',
      uid: null,
      token: null,
    });
  },
);
it('404 no login indica perfil pendente e Google segue a mesma confirmação', async () => {
  fetchMock.mockResolvedValueOnce(response(404));
  await expect(service.loginWithGoogle()).resolves.toBeNull();
  expect(store.getAuthSession().status).toBe('pending');
  expect(mocks.create).not.toHaveBeenCalled();
});
it('logout durante a consulta invalida a resposta atrasada', async () => {
  const pending = deferred<Response>();
  fetchMock.mockReturnValueOnce(pending.promise);
  const login = service.login('ana@example.com', 'Password123!');
  const rejected = expect(login).rejects.toThrow('sessão mudou');
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
  await service.logout();
  pending.resolve(response());
  await rejected;
  expect(store.getAuthSession().status).toBe('disconnected');
});
it('bloqueia duas operações simultâneas', async () => {
  const pending = deferred<Response>();
  fetchMock.mockReturnValueOnce(pending.promise);
  const first = register();
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
  await expect(register()).rejects.toThrow('Aguarde');
  pending.resolve(response());
  await first;
  expect(mocks.create).toHaveBeenCalledOnce();
});
it('restaura a conta persistida verificando o backend antes de liberar a sessão', async () => {
  mocks.auth.currentUser = user;
  await service.restoreSession();
  expect(mocks.login).not.toHaveBeenCalled();
  expect(store.getAuthSession().status).toBe('authenticated');
});
it('renova o token sem repetir login nem perder o perfil', async () => {
  await service.login('ana@example.com', 'Password123!');
  const unsubscribe = service.initializeAuthSession();
  vi.mocked(user.getIdToken).mockResolvedValue('token-2');
  mocks.observer.mock.calls[0][1](user);
  await vi.waitFor(() => expect(store.getAuthSession().token).toBe('token-2'));
  expect(fetchMock).toHaveBeenCalledOnce();
  unsubscribe();
});
it('troca de conta invalida o perfil e token anteriores imediatamente', async () => {
  await service.login('ana@example.com', 'Password123!');
  const unsubscribe = service.initializeAuthSession();
  const other = { ...user, uid: 'other-uid' } as User;
  mocks.auth.currentUser = other;
  fetchMock.mockResolvedValue(response(404));
  mocks.observer.mock.calls[0][1](other);
  expect(store.getAuthSession().token).toBeNull();
  await vi.waitFor(() => expect(store.getAuthSession().status).toBe('pending'));
  unsubscribe();
});

it('falha ao obter o token após criar a conta é compensada sem chamar o backend', async () => {
  vi.mocked(user.getIdToken).mockRejectedValueOnce(
    new Error('token unavailable'),
  );
  await expect(register()).rejects.toThrow('token unavailable');
  expect(mocks.remove).toHaveBeenCalledWith(user);
  expect(fetchMock).not.toHaveBeenCalled();
});
it('não confirma perfil de outro UID, mesmo com resposta 200', async () => {
  fetchMock.mockResolvedValue(response(200, { ...profile, uuid: 'other' }));
  await expect(
    service.login('ana@example.com', 'Password123!'),
  ).rejects.toThrow('perfil retornado');
  expect(store.getAuthSession().token).toBeNull();
});
it('aborto por timeout mantém cadastro pendente sem excluir identidade', async () => {
  fetchMock.mockRejectedValueOnce(new DOMException('timeout', 'TimeoutError'));
  await expect(register()).rejects.toMatchObject({ kind: 'timeout' });
  expect(store.getAuthSession().status).toBe('pending');
  expect(mocks.remove).not.toHaveBeenCalled();
});
it('restaura tentativa incerta após recarregar sem presumir rollback em um 404', async () => {
  mocks.auth.currentUser = user;
  localStorage.setItem(
    'tripshare.registration.firebase-uid',
    JSON.stringify({ uid: user.uid, phase: 'uncertain' }),
  );
  fetchMock.mockResolvedValue(response(404));
  await service.restoreSession();
  expect(store.getAuthSession()).toMatchObject({
    status: 'pending',
    uid: null,
    token: null,
  });
  expect(mocks.remove).not.toHaveBeenCalled();
});
