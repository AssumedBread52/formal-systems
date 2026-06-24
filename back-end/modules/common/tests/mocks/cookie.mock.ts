import { Response, response } from 'express';

export const cookieMock = (): jest.SpyInstance<Response<any, Record<string, any>>, [name: string, val: any], any> => {
  const cookie = jest.spyOn(response, 'cookie');

  beforeEach((): void => {
    cookie.mockClear();
  });

  return cookie;
};
