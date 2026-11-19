import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  deleteUser,
  GoogleAuthProvider,
  onIdTokenChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  validatePassword as validateFirebasePassword,
  type User,
} from 'firebase/auth';
import { auth } from '../client/firebase';
import {
  formatBrazilianPhone,
  validateEmail,
  validateName,
  validatePhone,
  validateUsername,
} from './validation';
import { ApiError } from '../client/http';
import { createProfile, loginProfile } from '../api/auth/services';
import { getAuthSession, publishSession } from './session';
import type { RegisterProfileInput, UserProfile } from '../api/auth/contract';
export class AuthFlowError extends Error {}
type Pending = { uid: string; phase: 'created' | 'uncertain' | 'rollback' };
let generation = 0;
let operation: { id: number; uid?: string } | null = null;
const pendingKey = (uid: string) => `tripshare.registration.${uid}`;
const pendingMemory = new Map<string, Pending>();
function readPending(uid: string): Pending | null {
  try {
    const item = JSON.parse(
      localStorage.getItem(pendingKey(uid)) ?? 'null',
    ) as Pending | null;
    if (
      item?.uid === uid &&
      ['created', 'uncertain', 'rollback'].includes(item.phase)
    )
      return item;
  } catch {
    /* O navegador pode bloquear armazenamento local. */
  }
  return pendingMemory.get(uid) ?? null;
}
function writePending(uid: string, phase: Pending['phase']) {
  const item = { uid, phase };
  pendingMemory.set(uid, item);
  try {
    localStorage.setItem(pendingKey(uid), JSON.stringify(item));
  } catch {
    /* Recuperação nesta página. */
  }
}
function clearPending(uid: string) {
  pendingMemory.delete(uid);
  try {
    localStorage.removeItem(pendingKey(uid));
  } catch {
    /* Armazenamento indisponível. */
  }
}
function requireAuth() {
  if (!auth)
    throw new AuthFlowError('Firebase não está configurado neste ambiente.');
  return auth;
}
function assertCurrent(id: number, user?: User) {
  if (id !== generation || (user && auth?.currentUser?.uid !== user.uid))
    throw new AuthFlowError('A sessão mudou. Entre novamente para continuar.');
}
function errorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 403)
    return 'Seu perfil está suspenso.';
  if (error instanceof AuthFlowError) return error.message;
  return 'Não foi possível confirmar sua conta. Tente novamente.';
}
async function profileFor(user: User) {
  const token = await user.getIdToken();
  const profile = await loginProfile(user.uid, token);
  return { token, profile };
}
function commit(id: number, user: User, token: string, profile: UserProfile) {
  assertCurrent(id, user);
  if (profile.uuid !== user.uid || profile.status !== 'ACTIVE')
    throw new AuthFlowError(
      'O perfil retornado não corresponde a uma conta ativa.',
    );
  clearPending(user.uid);
  publishSession('authenticated', { uid: user.uid, token, profile, user });
  return profile;
}
async function confirmProfile(
  id: number,
  user: User,
): Promise<UserProfile | null> {
  try {
    const { token, profile } = await profileFor(user);
    return commit(id, user, token, profile);
  } catch (error) {
    assertCurrent(id, user);
    if (error instanceof ApiError && error.status === 404) {
      publishSession('pending', { user });
      return null;
    }
    throw error;
  }
}
async function compensate(id: number, user: User) {
  assertCurrent(id, user);
  writePending(user.uid, 'rollback');
  try {
    await deleteUser(user);
  } catch {
    assertCurrent(id, user);
    publishSession('pending', {
      user,
      error: 'Não foi possível desfazer a criação da conta.',
    });
    throw new AuthFlowError(
      'Não foi possível desfazer a criação da conta. Tente novamente para concluir a recuperação.',
    );
  }
  assertCurrent(id);
  clearPending(user.uid);
  publishSession('disconnected');
}
async function runAuth<T>(
  action: (id: number) => Promise<T>,
  restoring = false,
): Promise<T> {
  if (operation) throw new AuthFlowError('Aguarde a operação em andamento.');
  const id = ++generation;
  operation = { id };
  publishSession(restoring ? 'restoring' : 'authenticating', {
    user: getAuthSession().user,
  });
  try {
    const configured = requireAuth();
    await setPersistence(configured, browserLocalPersistence);
    await configured.authStateReady();
    assertCurrent(id);
    return await action(id);
  } catch (error) {
    if (
      id === generation &&
      ['authenticating', 'restoring'].includes(getAuthSession().status)
    )
      publishSession('error', {
        user: auth?.currentUser ?? null,
        error: errorMessage(error),
      });
    throw error;
  } finally {
    if (operation?.id === id) operation = null;
  }
}
export async function login(email: string, password: string) {
  return runAuth(async (id) => {
    const { user } = await signInWithEmailAndPassword(
      requireAuth(),
      email.trim(),
      password,
    );
    assertCurrent(id, user);
    if (operation) operation.uid = user.uid;
    return confirmProfile(id, user);
  });
}
export async function loginWithGoogle() {
  return runAuth(async (id) => {
    const { user } = await signInWithPopup(
      requireAuth(),
      new GoogleAuthProvider(),
    );
    assertCurrent(id, user);
    if (operation) operation.uid = user.uid;
    return confirmProfile(id, user);
  });
}
function validateProfile(profile: RegisterProfileInput) {
  const error =
    validateUsername(profile.username) ??
    validateName(profile.name) ??
    validatePhone(profile.phone ?? '');
  if (error) throw new AuthFlowError(error);
}
async function registerProfile(
  id: number,
  user: User,
  profile: RegisterProfileInput,
  newlyCreated: boolean,
  uncertain = false,
): Promise<UserProfile> {
  assertCurrent(id, user);
  if (operation) operation.uid = user.uid;
  let token: string;
  try {
    token = await user.getIdToken();
  } catch (error) {
    if (newlyCreated && !uncertain) await compensate(id, user);
    throw error;
  }
  assertCurrent(id, user);
  if (newlyCreated) writePending(user.uid, 'uncertain');
  try {
    const phone = profile.phone?.trim();
    const saved = await createProfile(
      {
        ...profile,
        username: profile.username.trim(),
        name: profile.name.trim(),
        uuid: user.uid,
        phone: phone
          ? /^\+[1-9]\d{1,14}$/.test(phone)
            ? phone
            : formatBrazilianPhone(phone)
          : undefined,
      },
      token,
    );
    return commit(id, user, token, saved);
  } catch (error) {
    assertCurrent(id, user);
    let failure = error;
    let rejected =
      error instanceof ApiError && [400, 401, 403].includes(error.status);
    if (error instanceof ApiError && error.status === 409) {
      try {
        const found = await profileFor(user);
        return commit(id, user, found.token, found.profile);
      } catch (lookupError) {
        assertCurrent(id, user);
        rejected =
          lookupError instanceof ApiError && lookupError.status === 404;
        if (!rejected) failure = lookupError;
      }
    }
    // Resposta perdida anterior impede concluir que não houve gravação.
    if (newlyCreated && rejected && !uncertain) await compensate(id, user);
    else publishSession('pending', { user, error: errorMessage(failure) });
    throw failure;
  }
}
export async function register(
  email: string,
  password: string,
  profile: RegisterProfileInput,
) {
  validateProfile(profile);
  const emailError = validateEmail(email);
  if (emailError) throw new AuthFlowError(emailError);
  return runAuth(async (id) => {
    // Recupera apenas uma tentativa própria, sem login implícito no cadastro.
    const current = auth?.currentUser;
    const pending = current && readPending(current.uid);
    if (current && pending) {
      if (current.email?.toLowerCase() !== email.trim().toLowerCase())
        throw new AuthFlowError(
          'Conclua a tentativa pendente ou saia da conta antes de usar outro e-mail.',
        );
      if (pending.phase === 'rollback') {
        await compensate(id, current);
        throw new AuthFlowError(
          'A criação anterior foi desfeita. Envie o cadastro novamente.',
        );
      }
      const existing = await confirmProfile(id, current);
      if (existing) return existing;
      return registerProfile(
        id,
        current,
        profile,
        true,
        pending.phase === 'uncertain',
      );
    }
    const policy = await validateFirebasePassword(requireAuth(), password);
    assertCurrent(id);
    if (!policy.isValid)
      throw new AuthFlowError(
        'A senha não atende à política do Firebase. Revise o tamanho e os caracteres exigidos.',
      );
    const { user } = await createUserWithEmailAndPassword(
      requireAuth(),
      email.trim(),
      password,
    );
    assertCurrent(id, user);
    if (operation) operation.uid = user.uid;
    writePending(user.uid, 'created');
    return registerProfile(id, user, profile, true);
  });
}
export async function completeRegistration(
  uid: string,
  profile: RegisterProfileInput,
) {
  validateProfile(profile);
  return runAuth(async (id) => {
    const user = auth?.currentUser;
    if (!user || user.uid !== uid)
      throw new AuthFlowError('A conta mudou. Entre novamente para continuar.');
    if (operation) operation.uid = user.uid;
    const pending = readPending(uid);
    if (pending?.phase === 'rollback') {
      await compensate(id, user);
      throw new AuthFlowError(
        'A criação anterior foi desfeita. Inicie um novo cadastro.',
      );
    }
    const found = await confirmProfile(id, user);
    if (found) return found;
    return registerProfile(
      id,
      user,
      profile,
      Boolean(pending),
      pending?.phase === 'uncertain',
    );
  });
}
export async function restoreSession() {
  return runAuth(async (id) => {
    const user = auth?.currentUser;
    if (!user) {
      publishSession('disconnected');
      return;
    }
    if (operation) operation.uid = user.uid;
    if (readPending(user.uid)?.phase === 'rollback') {
      await compensate(id, user);
      return;
    }
    await confirmProfile(id, user);
  }, true);
}
export function initializeAuthSession() {
  if (!auth) {
    publishSession('disconnected');
    return () => {};
  }
  let active = true;
  const unsubscribe = onIdTokenChanged(auth, (user) => {
    if (!active) return;
    if (
      operation &&
      (!operation.uid ||
        operation.uid === user?.uid ||
        (!user && readPending(operation.uid)?.phase === 'rollback'))
    )
      return;
    if (!user) {
      ++generation;
      operation = null;
      publishSession('disconnected');
      return;
    }
    const current = getAuthSession();
    if (
      user &&
      current.status === 'authenticated' &&
      current.uid === user.uid
    ) {
      const id = generation;
      void user
        .getIdToken()
        .then((token) => {
          if (
            active &&
            id === generation &&
            auth?.currentUser?.uid === user.uid
          )
            publishSession('authenticated', { ...current, token });
        })
        .catch(() => {
          if (active && id === generation)
            publishSession('error', {
              user,
              error: 'Sua sessão expirou. Entre novamente.',
            });
        });
      return;
    }
    ++generation;
    operation = null;
    publishSession('restoring');
    void restoreSession().catch(() => {});
  });
  return () => {
    active = false;
    unsubscribe();
    ++generation;
    operation = null;
  };
}
export async function getSessionUser() {
  if (!auth) return null;
  await auth.authStateReady();
  return auth.currentUser;
}
export async function getIdToken() {
  const current = getAuthSession();
  const id = generation;
  if (current.status !== 'authenticated' || !current.user)
    throw new AuthFlowError('A sessão ainda não foi confirmada pelo backend.');
  assertCurrent(id, current.user);
  const token = await current.user.getIdToken();
  assertCurrent(id, current.user);
  publishSession('authenticated', { ...current, token });
  return token;
}
export async function getCurrentUserProfile(
  signal?: AbortSignal,
): Promise<UserProfile> {
  const uid = getAuthSession().uid;
  const token = await getIdToken();
  if (!uid || getAuthSession().uid !== uid)
    throw new AuthFlowError('A sessão mudou. Entre novamente para continuar.');
  return loginProfile(uid, token, signal);
}
export async function logout() {
  ++generation;
  operation = null;
  publishSession('disconnected');
  const configured = requireAuth();
  await configured.authStateReady();
  if (configured.currentUser) await signOut(configured);
}
