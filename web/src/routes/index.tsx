import { createBrowserRouter } from 'react-router-dom';
import { authRoutes } from './auth';
import { mainRoutes } from './main';
import { privateRoutes } from './private';

export const appRoutes = [...authRoutes, ...privateRoutes, ...mainRoutes];
export const router = createBrowserRouter(appRoutes);
