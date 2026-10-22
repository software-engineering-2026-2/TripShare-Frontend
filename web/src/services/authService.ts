import {
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import { auth } from '../lib/firebase';
import { request } from './api';

export async function login(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );

  return credential.user;
}

export async function getIdToken() {
  const user = auth.currentUser;

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
  const user = auth.currentUser;

  if (!user) {
    return;
  }

  const token = await user.getIdToken();

  try {
    await request<void>('/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } finally {
    await signOut(auth);
  }
}