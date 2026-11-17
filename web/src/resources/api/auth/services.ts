import { request } from '../../client/http';
import { apiRoutes } from '../paths';
import type { RegisterProfileInput, UserProfile } from './contract';

function authSignal(signal?: AbortSignal) {
  const timeout = AbortSignal.timeout(15_000);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

export function loginProfile(
  uuid: string,
  token: string,
  signal?: AbortSignal,
) {
  return request<UserProfile>(apiRoutes.auth.login, {
    method: 'POST',
    token,
    body: { uuid },
    signal: authSignal(signal),
  });
}

export function createProfile(
  body: RegisterProfileInput & { uuid: string },
  token: string,
) {
  return request<UserProfile>(apiRoutes.auth.register, {
    method: 'POST',
    token,
    body,
    signal: authSignal(),
  });
}
