import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './commons/styles/global.css';
import { router } from './routes';
import MainProvider from './providers/MainProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MainProvider>
      <RouterProvider router={router} />
    </MainProvider>
  </StrictMode>,
);
