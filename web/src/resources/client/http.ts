import { API_URL } from '../../commons/config/api';

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(`Erro ${status} ao chamar a API`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export function getApiMessage(error: unknown): string | undefined {
  if (
    !(error instanceof ApiError) ||
    !error.body ||
    typeof error.body !== 'object'
  ) {
    return undefined;
  }

  const { message } = error.body as { message?: unknown };
  return typeof message === 'string' ? message : undefined;
}

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  token: string;
  query?: Record<string, string | number | boolean>;
  body?: object;
  signal?: AbortSignal;
}

export class ApiTransportError extends Error {
  readonly kind: 'network' | 'timeout' | 'response';

  constructor(kind: ApiTransportError['kind'], cause: unknown) {
    super(
      {
        network: 'Falha de conexão. Verifique sua internet e tente novamente.',
        timeout: 'A requisição demorou demais. Tente novamente.',
        response: 'O servidor enviou uma resposta inválida.',
      }[kind],
      { cause },
    );
    this.name = 'ApiTransportError';
    this.kind = kind;
  }
}

function hasErrorName(error: unknown, name: string) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === name
  );
}

function transportError(error: unknown, signal?: AbortSignal) {
  if (signal?.aborted) {
    const reason = signal.reason;
    if (hasErrorName(reason, 'TimeoutError'))
      return new ApiTransportError('timeout', reason);
    return reason ?? error;
  }
  if (hasErrorName(error, 'AbortError')) return error;
  return new ApiTransportError(
    hasErrorName(error, 'TimeoutError') ? 'timeout' : 'network',
    error,
  );
}

export async function request<T>(
  path: string,
  { method, token, query, body, signal }: RequestOptions,
): Promise<T> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    search.set(key, String(value));
  }

  if (signal?.aborted) throw transportError(signal.reason, signal);
  let response: Response;
  try {
    response = await fetch(
      `${API_URL}${path}${search.size ? `?${search}` : ''}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal,
      },
    );
  } catch (error) {
    throw transportError(error, signal);
  }

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch (error) {
      if (signal?.aborted) throw transportError(error, signal);
      errorBody = null;
    }
    throw new ApiError(response.status, errorBody);
  }

  if (response.status === 204) return undefined as T;

  try {
    return (await response.json()) as T;
  } catch (error) {
    if (signal?.aborted) throw transportError(error, signal);
    throw new ApiTransportError('response', error);
  }
}

export interface ApiPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
