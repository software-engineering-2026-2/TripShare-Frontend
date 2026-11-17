import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import SessionProvider from './SessionProvider';

export default function MainProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster position="top-right" />
    </SessionProvider>
  );
}
