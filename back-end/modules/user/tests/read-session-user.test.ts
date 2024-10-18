import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { TokenService } from '@/auth/services/token.service';
import { testExpiredToken } from '@/auth/tests/helpers/test-expired-token';
import { testInvalidToken } from '@/auth/tests/helpers/test-invalid-token';
import { testMissingToken } from '@/auth/tests/helpers/test-missing-token';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { UserRepositoryMock } from './mocks/user-repository.mock';

describe('Read Session User', (): void => {
  getOrThrowMock();
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
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = app.get(TokenService).generateToken(user._id);

    const response = await request(app.getHttpServer()).get('/user/session-user').set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.OK, {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      systemCount: user.systemCount,
      constantSymbolCount: user.constantSymbolCount,
      variableSymbolCount: user.variableSymbolCount,
      axiomCount: user.axiomCount,
      theoremCount: user.theoremCount,
      deductionCount: user.deductionCount
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
