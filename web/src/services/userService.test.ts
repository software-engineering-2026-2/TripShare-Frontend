import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getIdToken } from './authService';
import { getUserById, updateCurrentUser } from './userService';

vi.mock('./authService', () => ({
  getIdToken: vi.fn(),
}));

const getIdTokenMock = vi.mocked(getIdToken);

function mockResponse(response: {
  ok: boolean;
  status: number;
  json?: unknown;
}) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: response.ok,
      status: response.status,
      json: vi.fn().mockResolvedValue(response.json ?? null),
    }),
  );
}

const user = {
  id: 'user-1',
  username: 'ana',
  name: 'Ana Souza',
  email: 'ana@example.com',
  phone: null,
  bio: null,
  hometown: null,
  role: 'USER',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  vi.restoreAllMocks();
  getIdTokenMock.mockResolvedValue('token');
});

describe('userService', () => {
  it('busca um usuário pelo id', async () => {
    mockResponse({ ok: true, status: 200, json: user });

    await expect(getUserById('user/1')).resolves.toEqual(user);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/user%2F1'),
      expect.objectContaining({ headers: { 'Content-Type': 'application/json' } }),
    );
  });

  it('atualiza o usuário autenticado via PATCH', async () => {
    mockResponse({ ok: true, status: 200, json: user });

    await updateCurrentUser({ name: 'Ana Atualizada' });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/me'),
      expect.objectContaining({
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token',
        },
        body: JSON.stringify({ name: 'Ana Atualizada' }),
      }),
    );
  });
});
