import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export const testWithMissingToken = async (app: INestApplication, url: string): Promise<void> => {
  const response = await request(app.getHttpServer()).post(url);

  expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
  expect(response.body).toEqual({
    message: 'Unauthorized',
    statusCode: HttpStatus.UNAUTHORIZED
  });
};
