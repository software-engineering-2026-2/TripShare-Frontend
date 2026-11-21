import { FirebaseError } from 'firebase/app';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../client/firebase';

export async function requestPasswordReset(email: string): Promise<void> {
  if (!auth) throw new Error('Firebase não está configurado neste ambiente.');
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    // Não revelar se o endereço possui uma conta no Firebase.
    if (error instanceof FirebaseError && error.code === 'auth/user-not-found')
      return;
    throw error;
  }
}
