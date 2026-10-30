import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getIdToken, type UserProfile } from './authService';
import { getPublicProfile, updateMyProfile } from './usersService';

vi.mock('./authService', () => ({
  getIdToken: vi.fn(),
}));

const getIdTokenMock = vi.mocked(getIdToken);

function mockFetchResponse(response: {
  ok: boolean;
  status: number;
  json?: unknown;
}) {
  fetchMock.mockResolvedValue({
    ok: response.ok,
    status: response.status,
    json: vi.fn().mockResolvedValue(response.json ?? null),
  });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

describe('getPublicProfile', () => {
  it('busca o perfil pelo UUID interno com o token Firebase no header', async () => {
    const profile = {
      username: 'viajante',
      name: 'Nome do usuário',
      bio: 'Gosto de viajar',
      hometown: 'Campina Grande',
    };
    getIdTokenMock.mockResolvedValue('firebase-id-token');
    mockFetchResponse({ ok: true, status: 200, json: profile });

    const result = await getPublicProfile(
      'b3f1c0de-4a2e-4c1b-9d57-0e8f6a1c2d34',
    );

    expect(getIdTokenMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/users/b3f1c0de-4a2e-4c1b-9d57-0e8f6a1c2d34'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer firebase-id-token',
        }),
      }),
    );
    expect(result).toEqual(profile);
  });

  it('codifica o id ao montar a URL', async () => {
    getIdTokenMock.mockResolvedValue('token');
    mockFetchResponse({ ok: true, status: 200, json: {} });

    await getPublicProfile('a/b');

    expect(fetchMock.mock.calls[0][0]).toContain('/users/a%2Fb');
  });

  it('propaga o status 404 como ApiError', async () => {
    getIdTokenMock.mockResolvedValue('token');
    mockFetchResponse({ ok: false, status: 404 });

    await expect(getPublicProfile('id')).rejects.toMatchObject({ status: 404 });
  });
});

describe('updateMyProfile', () => {
  const updatedProfile: UserProfile = {
    id: 'b3f1c0de-4a2e-4c1b-9d57-0e8f6a1c2d34',
    username: 'viajante',
    name: 'Nome atualizado',
    email: 'viajante@email.com',
    phone: '+5583999999999',
    bio: 'Gosto de viajar',
    hometown: 'Campina Grande',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2026-10-21T14:30:00Z',
  };

  it('envia PATCH /users/me com o token Firebase e somente os campos alterados', async () => {
    getIdTokenMock.mockResolvedValue('firebase-id-token');
    mockFetchResponse({ ok: true, status: 200, json: updatedProfile });

    const result = await updateMyProfile({
      name: 'Nome atualizado',
      bio: 'Gosto de viajar',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/users/me'),
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({
          Authorization: 'Bearer firebase-id-token',
        }),
        body: JSON.stringify({
          name: 'Nome atualizado',
          bio: 'Gosto de viajar',
        }),
      }),
    );
    expect(result).toEqual(updatedProfile);
  });

  it('não envia email, uuid, role, status nem identificadores internos', async () => {
    getIdTokenMock.mockResolvedValue('token');
    mockFetchResponse({ ok: true, status: 200, json: updatedProfile });

    await updateMyProfile({ hometown: 'Campina Grande' });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(options.body));

    expect(body).toEqual({ hometown: 'Campina Grande' });
    expect(body).not.toHaveProperty('email');
    expect(body).not.toHaveProperty('id');
    expect(body).not.toHaveProperty('uuid');
    expect(body).not.toHaveProperty('role');
    expect(body).not.toHaveProperty('status');
  });

  it('propaga o 400 do backend', async () => {
    getIdTokenMock.mockResolvedValue('token');
    mockFetchResponse({ ok: false, status: 400, json: { message: 'invalid' } });

    await expect(updateMyProfile({ name: '' })).rejects.toMatchObject({
      status: 400,
    });
  });
});
