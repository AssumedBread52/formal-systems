import { AuthService } from '@/auth/auth.service';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

export const testExpiredToken = async (app: INestApplication, method: 'delete' | 'get' | 'patch' | 'post', path: string): Promise<void> => {
  const token = await app.get(AuthService).generateToken(new ObjectId());

  await new Promise((resolve: (value: unknown) => void): void => {
    setTimeout(resolve, 1100);
  });

  const response = await request(app.getHttpServer())[method](path).set('Cookie', [
    `token=${token}`
  ]);

  expectCorrectResponse(response, HttpStatus.UNAUTHORIZED, {
    message: 'Unauthorized',
    statusCode: HttpStatus.UNAUTHORIZED
  });
};
