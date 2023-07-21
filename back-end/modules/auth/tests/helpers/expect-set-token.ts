import { Response } from 'supertest';

export const expectSetToken = (response: Response): void => {
  const cookies = response.get('Set-Cookie');

  expect(cookies).toHaveLength(2);
  expect(cookies[0]).toMatch(/^token=.+; Max-Age=60; .+; HttpOnly; Secure$/);
  expect(cookies[1]).toMatch(/^authStatus=true; Max-Age=60; .+; Secure$/);
};
