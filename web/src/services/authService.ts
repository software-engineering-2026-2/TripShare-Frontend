import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import { auth } from '../lib/firebase';
import { request } from './api';

function requireAuth() {
  if (!auth) {
    throw new Error('Firebase não está configurado neste ambiente.');
  }

  return auth;
}

export async function login(email: string, password: string) {
  const configuredAuth = requireAuth();
  const credential = await signInWithEmailAndPassword(
    configuredAuth,
    email,
    password,
  );

  return credential.user;
}

export async function loginWithGoogle() {
  const configuredAuth = requireAuth();
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(configuredAuth, provider);

  return credential.user;
}

export async function getIdToken() {
  const user = requireAuth().currentUser;

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
  const configuredAuth = requireAuth();
  const user = configuredAuth.currentUser;

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
    await signOut(configuredAuth);
  }
}