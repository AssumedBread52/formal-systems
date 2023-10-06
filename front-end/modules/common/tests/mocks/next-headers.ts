import { ReadonlyRequestCookies, RequestCookiesAdapter } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { RequestCookies } from 'next/dist/server/web/spec-extension/cookies';

const mockTokenCookie = jest.fn<string, []>();

jest.mock('next/headers', (): {
  cookies: () => ReadonlyRequestCookies;
} => {
  const requestCookies = new RequestCookies(new Headers({
  }));

  return {
    cookies: (): ReadonlyRequestCookies => {
      requestCookies.set('token', mockTokenCookie());

      return RequestCookiesAdapter.seal(requestCookies);
    }
  };
});

export const mockNextHeaders = (): {
  mockTokenCookie: jest.Mock<string, []>;
} => {
  beforeAll((): void => {
    mockTokenCookie.mockReturnValue('valid-token');
  });

  afterEach((): void => {
    mockTokenCookie.mockClear();
  });

  return {
    mockTokenCookie
  };
};
