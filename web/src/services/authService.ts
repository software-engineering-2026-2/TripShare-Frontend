import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';

import { auth } from '../lib/firebase';
import { ApiError, request } from './api';

export interface RegisterProfileInput {
  username: string;
  name: string;
  phone?: string;
  bio?: string;
  hometown?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  hometown: string | null;
  role: string;
  status: string;
  createdAt: string;
}

function getConfiguredAuth() {
  if (!auth) {
    throw new Error('Firebase não está configurado.');
  }

  return auth;
}

export async function login(email: string, password: string) {
  const firebaseAuth = getConfiguredAuth();
  const credential = await signInWithEmailAndPassword(
    firebaseAuth,
    email,
    password,
  );

  return credential.user;
}

async function createFirebaseUserOrRecover(
  email: string,
  password: string,
): Promise<User> {
  const firebaseAuth = getConfiguredAuth();
  try {
    const credential = await createUserWithEmailAndPassword(
      firebaseAuth,
      email,
      password,
    );

    return credential.user;
  } catch (error) {
    const isEmailInUse =
      error instanceof FirebaseError && error.code === 'auth/email-already-in-use';

    if (!isEmailInUse) {
      throw error;
    }

    // A conta Firebase pode existir sem perfil no backend (tentativa
    // anterior falhou após criar a conta). Recupera a sessão existente
    // para concluir apenas o cadastro do perfil.
    const credential = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password,
    );

    return credential.user;
  }
}

export async function register(
  email: string,
  password: string,
  profile: RegisterProfileInput,
): Promise<UserProfile> {
  const user = await createFirebaseUserOrRecover(email, password);
  const token = await user.getIdToken();

  try {
    return await request<UserProfile>('/auth/register', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profile),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      // Token rejeitado pelo backend: encerra a sessão local criada
      // nesta tentativa para não deixar estado inconsistente.
      if (auth) {
        await signOut(auth);
      }
    }

    throw error;
  }
}

export async function getIdToken() {
  const user = getConfiguredAuth().currentUser;

  if (!user) {
    throw new Error('Usuário não autenticado.');
  }

  return user.getIdToken();
}

export async function getCurrentUserProfile() {
  const token = await getIdToken();

  return request('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function logout() {
  const firebaseAuth = auth;
  if (!firebaseAuth) {
    return;
  }

  const user = firebaseAuth.currentUser;

  if (!user) {
    return;
  }

  try {
    const token = await user.getIdToken();

    await request<void>('/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } finally {
    await signOut(firebaseAuth);
  }
}