import { CookieOptions, Response, response } from 'express';

export const clearCookieMock = (): jest.SpyInstance<Response<any, Record<string, any>>, [name: string, options?: CookieOptions | undefined], any> => {
  const clearCookie = jest.spyOn(response, 'clearCookie');

  beforeEach((): void => {
    clearCookie.mockClear();
  });

  return clearCookie;
};
