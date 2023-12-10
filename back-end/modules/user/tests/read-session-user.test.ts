import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { AuthService } from '@/auth/auth.service';
import { testExpiredToken } from '@/auth/tests/helpers/test-expired-token';
import { testInvalidToken } from '@/auth/tests/helpers/test-invalid-token';
import { testMissingToken } from '@/auth/tests/helpers/test-missing-token';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { UserRepositoryMock } from './mocks/user-repository.mock';

describe('Read Session User', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'get', '/user/session-user');
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'get', '/user/session-user');
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'get', '/user/session-user');
  });

  it('succeeds', async (): Promise<void> => {
    const token = await app.get(AuthService).generateToken(new ObjectId());

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    const testUser = new UserEntity();

    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const { _id, firstName, lastName, email, systemCount, constantSymbolCount, variableSymbolCount } = testUser;

    const response = await request(app.getHttpServer()).get('/user/session-user').set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.OK, {
      id: _id.toString(),
      firstName,
      lastName,
      email,
      systemCount,
      constantSymbolCount,
      variableSymbolCount
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
