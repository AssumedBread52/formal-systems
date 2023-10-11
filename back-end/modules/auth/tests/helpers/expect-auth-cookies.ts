import { Response } from 'supertest';

export const expectAuthCookies = (response: Response): void => {
  const cookies = response.get('Set-Cookie');

  expect(cookies).toHaveLength(2);
  expect(cookies[0]).toMatch(/^token=.+; Max-Age=1; .+; HttpOnly; Secure$/);
  expect(cookies[1]).toMatch(/^authStatus=true; Max-Age=1; .+; Secure$/);
};
