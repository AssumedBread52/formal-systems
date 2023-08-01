import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export const testMissingToken = async (app: INestApplication, method: 'get' | 'patch' | 'post', path: string): Promise<void> => {
  const response = await request(app.getHttpServer())[method](path);

  expectCorrectResponse(response, HttpStatus.UNAUTHORIZED, {
    message: 'Unauthorized',
    statusCode: HttpStatus.UNAUTHORIZED
  });
};
