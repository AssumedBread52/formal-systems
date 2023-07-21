import { AuthService } from '@/auth/auth.service';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

export const testWithInvalidToken = async (app: INestApplication, url: string): Promise<void> => {
  const authService = app.get(AuthService);

  const token = await authService.generateToken(new ObjectId());

  const response = await request(app.getHttpServer()).post(url).set('Cookie', [
    `token=${token}`
  ]);

  expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
  expect(response.body).toEqual({
    error: 'Unauthorized',
    message: 'Invalid token.',
    statusCode: HttpStatus.UNAUTHORIZED
  });
};
