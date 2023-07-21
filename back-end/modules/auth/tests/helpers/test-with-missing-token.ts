import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { expectBadAuthPayloadResponse } from './expect-bad-auth-payload-response';

export const testWithMissingToken = async (app: INestApplication, method: 'get' | 'patch' | 'post', url: string): Promise<void> => {
  const response = await request(app.getHttpServer())[method](url);

  expectBadAuthPayloadResponse(response);
};
