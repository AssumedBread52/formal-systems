import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { AuthService } from '@/auth/auth.service';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { expectAuthCookies } from './helpers/expect-auth-cookies';
import { testExpiredToken } from './helpers/test-expired-token';
import { testInvalidToken } from './helpers/test-invalid-token';
import { testMissingToken } from './helpers/test-missing-token';

describe('Refresh Token', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'post', '/auth/refresh-token');
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'post', '/auth/refresh-token');
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'post', '/auth/refresh-token');
  });

  it('succeeds', async (): Promise<void> => {
    const testUser = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(testUser._id);

    const response = await request(app.getHttpServer()).post('/auth/refresh-token').set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.NO_CONTENT, {});
    expectAuthCookies(response);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
