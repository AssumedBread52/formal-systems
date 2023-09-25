import { fetchSessionUser } from '@/user/tests/mocks/fetch-session-user';
import { setupServer } from 'msw/node';

export const mockServer = (): void => {
  const handlers = [
    fetchSessionUser
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
