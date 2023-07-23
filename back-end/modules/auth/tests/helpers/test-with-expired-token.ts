import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { generateToken } from './generate-token';

export const testWithExpiredToken = async (app: INestApplication, method: 'delete' | 'get' | 'patch' | 'post', url: string): Promise<void> => {
  const token = await generateToken(app);

  await new Promise((resolve: (value: unknown) => void): NodeJS.Timeout => {
    return setTimeout(resolve, 2000);
  });

  const response = await request(app.getHttpServer())[method](url).set('Cookie', [
    `token=${token}`
  ]);

  expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
  expect(response.body).toEqual({
    message: 'Unauthorized',
    statusCode: HttpStatus.UNAUTHORIZED
  });
};
