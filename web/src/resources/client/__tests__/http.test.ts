import { afterEach, expect, it, vi } from 'vitest';
import { request } from '../http';

afterEach(() => vi.unstubAllGlobals());

it('reutiliza a origem, serializa query e envia o Bearer mesmo sem corpo', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal('fetch', fetchMock);
  await expect(
    request('/trips/one', {
      method: 'DELETE',
      token: 'test-token',
      query: { confirm: true },
    }),
  ).resolves.toBeUndefined();
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringMatching(/\/trips\/one\?confirm=true$/),
    expect.objectContaining({
      method: 'DELETE',
      headers: { Authorization: 'Bearer test-token' },
    }),
  );
});

it('mantém status e corpo fornecidos pelo backend', async () => {
  const body = { message: 'Period conflict', conflicts: [{ dayNumber: 3 }] };
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(body), { status: 409 })),
  );
  await expect(
    request('/trips/one', {
      method: 'PATCH',
      token: 'test-token',
      body: { durationDays: 2 },
    }),
  ).rejects.toMatchObject({ status: 409, body });
});

it('preserva cancelamento e distingue timeout, rede e resposta inválida', async () => {
  const controller = new AbortController();
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  const options = { method: 'GET', token: 'test-token' } as const;

  controller.abort();
  await expect(
    request('/test', { ...options, signal: controller.signal }),
  ).rejects.toBe(controller.signal.reason);
  expect(fetchMock).not.toHaveBeenCalled();

  fetchMock.mockRejectedValueOnce(
    new DOMException('timed out', 'TimeoutError'),
  );
  await expect(request('/test', options)).rejects.toMatchObject({
    kind: 'timeout',
  });
  fetchMock.mockRejectedValueOnce(new TypeError('offline'));
  await expect(request('/test', options)).rejects.toMatchObject({
    kind: 'network',
  });
  fetchMock.mockResolvedValueOnce(new Response('invalid JSON'));
  await expect(request('/test', options)).rejects.toMatchObject({
    kind: 'response',
  });
});
