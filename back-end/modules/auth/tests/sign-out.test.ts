import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { AuthService } from '@/auth/auth.service';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { testExpiredToken } from './helpers/test-expired-token';
import { testInvalidToken } from './helpers/test-invalid-token';
import { testMissingToken } from './helpers/test-missing-token';

describe('Sign Out', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'post', '/auth/sign-out');
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'post', '/auth/sign-out');
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'post', '/auth/sign-out');
  });

  it('succeeds', async (): Promise<void> => {
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).post('/auth/sign-out').set('Cookie', [
      `token=${token}`
    ]);

    const cookies = response.get('Set-Cookie');

    expectCorrectResponse(response, HttpStatus.NO_CONTENT, {});
    expect(cookies).toHaveLength(2);
    if (cookies) {
      expect(cookies[0]).toBe('token=; Path=\/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
      expect(cookies[1]).toBe('authStatus=; Path=\/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    }
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
