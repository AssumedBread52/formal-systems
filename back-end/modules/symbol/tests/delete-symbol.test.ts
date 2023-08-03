import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { AuthService } from '@/auth/auth.service';
import { testExpiredToken } from '@/auth/tests/helpers/test-expired-token';
import { testInvalidToken } from '@/auth/tests/helpers/test-invalid-token';
import { testMissingToken } from '@/auth/tests/helpers/test-missing-token';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { SymbolRepositoryMock } from './mocks/symbol-repository.mock';

describe('Delete Symbol', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'delete', `/system/${new ObjectId()}/symbol/${new ObjectId()}`);
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'delete', `/system/${new ObjectId()}/symbol/${new ObjectId()}`);
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'delete', `/system/${new ObjectId()}/symbol/${new ObjectId()}`);
  });

  it('succeeds if the symbol does not exist', async (): Promise<void> => {
    const symbolId = new ObjectId();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(new UserEntity());

    const token = await app.get(AuthService).generateToken(new ObjectId());

    const response = await request(app.getHttpServer()).delete(`/system/${new ObjectId()}/symbol/${symbolId}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.OK, {
      id: symbolId.toString()
    });
  });

  it('fails if the authenticated user did not create the symbol', async (): Promise<void> => {
    const testSymbol = new SymbolEntity();

    const { _id, systemId } = testSymbol;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(testSymbol);
    userRepositoryMock.findOneBy.mockReturnValueOnce(new UserEntity());

    const token = await app.get(AuthService).generateToken(new ObjectId());

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}/symbol/${_id}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.FORBIDDEN, {
      error: 'Forbidden',
      message: 'You cannot delete a symbol unless you created it.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('succeeds if the authenticated user created the symbol', async (): Promise<void> => {
    const testSymbol = new SymbolEntity();
    const testUser = new UserEntity();

    const { _id, systemId, createdByUserId } = testSymbol;

    testUser._id = createdByUserId;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(testSymbol);
    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(createdByUserId);

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}/symbol/${_id}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.OK, {
      id: _id.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
