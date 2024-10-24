import { TokenService } from '@/auth/services/token.service';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

export const testInvalidToken = async (app: INestApplication, method: 'delete' | 'get' | 'patch' | 'post', path: string): Promise<void> => {
  const token = await app.get(TokenService).generateToken(new ObjectId());

  const response = await request(app.getHttpServer())[method](path).set('Cookie', [
    `token=${token}`
  ]);

  expectCorrectResponse(response, HttpStatus.UNAUTHORIZED, {
    error: 'Unauthorized',
    message: 'Invalid token.',
    statusCode: HttpStatus.UNAUTHORIZED
  });
};
