import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export const testMissingToken = async (app: INestApplication, method: 'get' | 'delete' | 'patch' | 'post', path: string): Promise<void> => {
  const response = await request(app.getHttpServer())[method](path);

  expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
  expect(response.body).toEqual({
    message: 'Unauthorized',
    statusCode: HttpStatus.UNAUTHORIZED
  });
};
