import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export const testWithMissingToken = async (app: INestApplication, method: 'delete' | 'get' | 'patch' | 'post', url: string): Promise<void> => {
  const response = await request(app.getHttpServer())[method](url);

  expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
  expect(response.body).toEqual({
    message: 'Unauthorized',
    statusCode: HttpStatus.UNAUTHORIZED
  });
};
