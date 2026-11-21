import { FirebaseError } from 'firebase/app';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  client: { auth: {} as object | null },
}));
vi.mock('firebase/auth', () => ({ sendPasswordResetEmail: mocks.send }));
vi.mock('../../client/firebase', () => mocks.client);
import { requestPasswordReset } from '../passwordRecovery';
beforeEach(() => {
  vi.resetAllMocks();
  mocks.client.auth = {};
});
describe('requestPasswordReset', () => {
  it('envia o endereço normalizado pelo SDK Firebase', async () => {
    await requestPasswordReset(' ana@example.com ');
    expect(mocks.send).toHaveBeenCalledWith(
      mocks.client.auth,
      'ana@example.com',
    );
  });
  it('não distingue e-mail inexistente de sucesso', async () => {
    mocks.send.mockRejectedValue(
      new FirebaseError('auth/user-not-found', 'missing'),
    );
    await expect(
      requestPasswordReset('unknown@example.com'),
    ).resolves.toBeUndefined();
  });
  it.each(['auth/network-request-failed', 'auth/too-many-requests'])(
    'preserva falhas operacionais %s para permitir nova tentativa',
    async (code) => {
      const error = new FirebaseError(code, 'failure');
      mocks.send.mockRejectedValue(error);
      await expect(requestPasswordReset('ana@example.com')).rejects.toBe(error);
    },
  );
  it('não chama o SDK sem configuração Firebase', async () => {
    mocks.client.auth = null;
    await expect(requestPasswordReset('ana@example.com')).rejects.toThrow(
      'configurado',
    );
    expect(mocks.send).not.toHaveBeenCalled();
  });
});
