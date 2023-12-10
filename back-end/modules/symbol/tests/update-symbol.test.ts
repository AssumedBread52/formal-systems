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
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { SymbolRepositoryMock } from './mocks/symbol-repository.mock';

describe('Update Symbol', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'patch', `/system/${new ObjectId()}/symbol/${new ObjectId()}`);
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'patch', `/system/${new ObjectId()}/symbol/${new ObjectId()}`);
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'patch', `/system/${new ObjectId()}/symbol/${new ObjectId()}`);
  });

  it('fails with an invalid payload', async (): Promise<void> => {
    const token = await app.get(AuthService).generateToken(new ObjectId());

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(new UserEntity());

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}/symbol/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: [
        'newTitle should not be empty',
        'newDescription should not be empty',
        'newContent should not be empty'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid symbol ID', async (): Promise<void> => {
    const token = await app.get(AuthService).generateToken(new ObjectId());

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(new UserEntity());

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}/symbol/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.',
      newType: SymbolType.Constant,
      newContent: '\\alpha'
    });

    expectCorrectResponse(response, HttpStatus.NOT_FOUND, {
      error: 'Not Found',
      message: 'Symbol not found.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('fails when updating a symbol the user did not create', async (): Promise<void> => {
    const testSymbol = new SymbolEntity();

    const { _id, systemId, createdByUserId } = testSymbol;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(testSymbol);
    userRepositoryMock.findOneBy.mockReturnValueOnce(new UserEntity());

    const token = await app.get(AuthService).generateToken(createdByUserId);

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/symbol/${_id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.',
      newType: SymbolType.Constant,
      newContent: '\\beta'
    });

    expectCorrectResponse(response, HttpStatus.FORBIDDEN, {
      error: 'Forbidden',
      message: 'You cannot update a symbol unless you created it.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('fails if content already exists in the formal system', async (): Promise<void> => {
    const testSymbol = new SymbolEntity();
    const testUser = new UserEntity();

    const { _id, systemId, createdByUserId } = testSymbol;

    testUser._id = createdByUserId;

    const token = await app.get(AuthService).generateToken(createdByUserId);

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(testSymbol);
    symbolRepositoryMock.findOneBy.mockReturnValueOnce(new SymbolEntity());
    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/symbol/${_id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.',
      newType: SymbolType.Constant,
      newContent: '\\beta'
    });

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Symbols within a formal system must have unique content.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('fails if attempting to change the symbol type and the symbol is already in use (axiomatic)', async (): Promise<void> => {
    const testSymbol = new SymbolEntity();
    const testUser = new UserEntity();

    const { _id, systemId, createdByUserId } = testSymbol;

    testUser._id = createdByUserId;

    const token = await app.get(AuthService).generateToken(createdByUserId);

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    testSymbol.axiomaticStatementAppearances = 1;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(testSymbol);
    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/symbol/${_id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.',
      newType: SymbolType.Variable,
      newContent: '\\beta'
    });

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Symbols in use cannot change their symbol type.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('fails if attempting to change the symbol type and the symbol is already in use (non-axiomatic)', async (): Promise<void> => {
    const testSymbol = new SymbolEntity();
    const testUser = new UserEntity();

    const { _id, systemId, createdByUserId } = testSymbol;

    testUser._id = createdByUserId;

    const token = await app.get(AuthService).generateToken(createdByUserId);

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    testSymbol.nonAxiomaticStatementAppearances = 1;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(testSymbol);
    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/symbol/${_id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.',
      newType: SymbolType.Variable,
      newContent: '\\beta'
    });

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Symbols in use cannot change their symbol type.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('succeeds', async (): Promise<void> => {
    const testSymbol = new SymbolEntity();
    const testUser = new UserEntity();

    const { _id, systemId, createdByUserId } = testSymbol;

    testUser._id = createdByUserId;

    const token = await app.get(AuthService).generateToken(createdByUserId);

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(testSymbol);
    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/symbol/${_id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.',
      newType: SymbolType.Constant,
      newContent: '\\beta'
    });

    expectCorrectResponse(response, HttpStatus.OK, {
      id: _id.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
