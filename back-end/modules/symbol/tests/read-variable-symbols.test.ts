import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { AuthService } from '@/auth/auth.service';
import { testExpiredToken } from '@/auth/tests/helpers/test-expired-token';
import { testInvalidToken } from '@/auth/tests/helpers/test-invalid-token';
import { testMissingToken } from '@/auth/tests/helpers/test-missing-token';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { SymbolRepositoryMock } from './mocks/symbol-repository.mock';

describe('Read Variable Symbols', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'get', '/system/1/symbol/variable');
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'get', '/system/1/symbol/variable');
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'get', '/system/1/symbol/variable');
  });

  it('fails with an invalid system ID', async (): Promise<void> => {
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).get('/system/1/symbol/variable').set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'Invalid Mongodb ID structure.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('succeeds', async (): Promise<void> => {
    const symbol = new SymbolEntity();
    const user = new UserEntity();

    symbol.type = SymbolType.Variable;
    symbol.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.find.mockReturnValueOnce([symbol]);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).get(`/system/${symbol.systemId}/symbol/variable`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.OK, [
      {
        id: symbol._id.toString(),
        title: symbol.title,
        description: symbol.description,
        type: symbol.type,
        content: symbol.content,
        axiomAppearances: symbol.axiomAppearances,
        theoremAppearances: symbol.theoremAppearances,
        deductionAppearances: symbol.deductionAppearances,
        systemId: symbol.systemId.toString(),
        createdByUserId: symbol.createdByUserId.toString()
      }
    ]);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
