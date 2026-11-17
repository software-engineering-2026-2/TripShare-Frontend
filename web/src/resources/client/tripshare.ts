import { getIdToken } from '../auth/flow';
import { request, type RequestOptions } from './http';

export async function requestAuthenticated<T>(
  path: string,
  options: Omit<RequestOptions, 'token'>,
): Promise<T> {
  options.signal?.throwIfAborted();
  return request<T>(path, { ...options, token: await getIdToken() });
}
