const API_URL = import.meta.env.VITE_API_URL;

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

export async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let body: unknown;

    try {
      body = await response.json();
    } catch {
      body = null;
    }

    throw new ApiError(response.status, body);
  }

  if(response.status === 204){
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
