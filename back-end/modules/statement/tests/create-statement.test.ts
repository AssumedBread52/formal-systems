import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { AuthService } from '@/auth/auth.service';
import { testExpiredToken } from '@/auth/tests/helpers/test-expired-token';
import { testInvalidToken } from '@/auth/tests/helpers/test-invalid-token';
import { testMissingToken } from '@/auth/tests/helpers/test-missing-token';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { SymbolRepositoryMock } from '@/symbol/tests/mocks/symbol-repository.mock';
import { SystemEntity } from '@/system/system.entity';
import { SystemRepositoryMock } from '@/system/tests/mocks/system-repository.mock';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Create Statement', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'post', `/system/${new ObjectId()}/statement`);
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'post', `/system/${new ObjectId()}/statement`);
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'post', `/system/${new ObjectId()}/statement`);
  });

  it('succeeds', async (): Promise<void> => {
    const testSymbol = new SymbolEntity();
    const testSymbol2 = new SymbolEntity();
    const testSymbol3 = new SymbolEntity();
    const testSystem = new SystemEntity();
    const testUser = new UserEntity();

    testSymbol.createdByUserId = testUser._id;
    testSymbol.systemId = testSymbol._id;
    testSymbol2.type = SymbolType.Variable;
    testSymbol2.createdByUserId = testUser._id;
    testSymbol2.systemId = testSymbol._id;
    testSymbol3.type = SymbolType.Variable;
    testSymbol3.createdByUserId = testUser._id;
    testSymbol3.systemId = testSymbol._id;
    testSystem.createdByUserId = testUser._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.find.mockReturnValueOnce([testSymbol, testSymbol2, testSymbol3]);
    systemRepositoryMock.findOneBy.mockReturnValueOnce(testSystem);
    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(testUser._id);

    const response = await request(app.getHttpServer()).post(`/system/${testSystem._id}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [[testSymbol2._id, testSymbol3._id]],
      variableTypeHypotheses: [[testSymbol._id, testSymbol2._id]],
      logicalHypotheses: [[testSymbol._id]],
      assertion: [
        testSymbol._id,
        testSymbol._id
      ]
    });

    expect(response.body).toEqual({});
    expectCorrectResponse(response, HttpStatus.CREATED, {});
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
