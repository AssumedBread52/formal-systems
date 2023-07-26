import { AuthService } from '@/auth/auth.service';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

export const testExpiredToken = async (app: INestApplication, method: 'get' | 'delete' | 'patch' | 'post', path: string): Promise<void> => {
  const authService = app.get(AuthService);

  const token = await authService.generateToken(new ObjectId());

  await new Promise((resolve: (value: unknown) => void): NodeJS.Timeout => {
    return setTimeout(resolve, 1000);
  });

  const response = await request(app.getHttpServer())[method](path).set('Cookie', [
    `token=${token}`
  ]);

  expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
  expect(response.body).toEqual({
    message: 'Unauthorized',
    statusCode: HttpStatus.UNAUTHORIZED
  });
};
