import { postRefreshToken } from '@/auth/tests/mocks/post-refresh-token';
import { postSignIn } from '@/auth/tests/mocks/post-sign-in';
import { postSignOut } from '@/auth/tests/mocks/post-sign-out';
import { postSignUp } from '@/auth/tests/mocks/post-sign-up';
import { fetchSessionUser } from '@/user/tests/mocks/fetch-session-user';
import { patchSessionUser } from '@/user/tests/mocks/patch-session-user';
import { setupServer } from 'msw/node';

export const mockServer = (): void => {
  const handlers = [
    fetchSessionUser,
    patchSessionUser,
    postRefreshToken,
    postSignIn,
    postSignOut,
    postSignUp
  ];

  const server = setupServer(...handlers);

  beforeAll((): void => {
    server.listen({
      onUnhandledRequest: 'warn'
    });
  });

  afterAll((): void => {
    server.close();
  });
};
