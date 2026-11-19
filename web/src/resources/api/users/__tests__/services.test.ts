import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getIdToken } from '../../../auth/flow';
import { getUserById, updateCurrentUser } from '../services';

vi.mock('../../../auth/flow', () => ({
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

// Formatos do README do back-end.
const publicProfile = {
  username: 'ana',
  name: 'Ana Souza',
  bio: null,
  hometown: null,
};

const user = {
  id: 'user-1',
  authId: 'auth-1',
  uuid: 'firebase-uid',
  username: 'ana',
  name: 'Ana Souza',
  email: 'ana@example.com',
  phone: null,
  bio: null,
  hometown: null,
  role: 'USER',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  vi.restoreAllMocks();
  getIdTokenMock.mockResolvedValue('token');
});

describe('userService', () => {
  it('busca o perfil público pelo id enviando o token', async () => {
    mockResponse({ ok: true, status: 200, json: publicProfile });

    await expect(getUserById('user/1')).resolves.toEqual(publicProfile);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/user%2F1'),
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer token' },
      }),
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
