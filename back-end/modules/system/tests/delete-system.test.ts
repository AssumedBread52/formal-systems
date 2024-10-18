import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { TokenService } from '@/auth/services/token.service';
import { testExpiredToken } from '@/auth/tests/helpers/test-expired-token';
import { testInvalidToken } from '@/auth/tests/helpers/test-invalid-token';
import { testMissingToken } from '@/auth/tests/helpers/test-missing-token';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { SystemEntity } from '@/system/system.entity';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { SystemRepositoryMock } from './mocks/system-repository.mock';

describe('Delete System', (): void => {
  getOrThrowMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'delete', '/system/1');
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'delete', '/system/1');
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'delete', '/system/1');
  });

  it('fails with an invalid system id', async (): Promise<void> => {
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = app.get(TokenService).generateToken(user._id);

    const response = await request(app.getHttpServer()).delete('/system/1').set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'Invalid Mongodb ID structure.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('succeeds if the system does not exist', async (): Promise<void> => {
    const systemId = new ObjectId();

    const user = new UserEntity();

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    systemRepositoryMock.findOneBy.mockReturnValueOnce(null);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = app.get(TokenService).generateToken(user._id);

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.OK, {
      id: systemId.toString()
    });
  });

  it('fails if the system was not created by the user attempting to delete it', async (): Promise<void> => {
    const system = new SystemEntity();
    const user = new UserEntity();

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    systemRepositoryMock.findOneBy.mockReturnValueOnce(system);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = app.get(TokenService).generateToken(user._id);

    const response = await request(app.getHttpServer()).delete(`/system/${system._id}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.FORBIDDEN, {
      error: 'Forbidden',
      message: 'Write actions require user ownership.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('succeeds', async (): Promise<void> => {
    const system = new SystemEntity();
    const user = new UserEntity();

    system.createdByUserId = user._id;

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    systemRepositoryMock.findOneBy.mockReturnValueOnce(system);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = app.get(TokenService).generateToken(user._id);

    const response = await request(app.getHttpServer()).delete(`/system/${system._id}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.OK, {
      id: system._id.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
