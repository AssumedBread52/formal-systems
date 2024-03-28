import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { AuthService } from '@/auth/auth.service';
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
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'delete', `/system/${new ObjectId()}`);
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'delete', `/system/${new ObjectId()}`);
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'delete', `/system/${new ObjectId()}`);
  });

  it('succeeds if the system does not exist', async (): Promise<void> => {
    const testSystemId = new ObjectId();
    const testUser = new UserEntity();

    const token = await app.get(AuthService).generateToken(testUser._id);

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    systemRepositoryMock.findOneBy.mockReturnValueOnce(null);
    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const response = await request(app.getHttpServer()).delete(`/system/${testSystemId}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.OK, {
      id: testSystemId.toString()
    });
  });

  it('fails if the system is not created by the user attempting to delete it', async (): Promise<void> => {
    const testSystem = new SystemEntity();
    const testUser = new UserEntity();

    const token = await app.get(AuthService).generateToken(testUser._id);

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    systemRepositoryMock.findOneBy.mockReturnValueOnce(testSystem);
    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const response = await request(app.getHttpServer()).delete(`/system/${testSystem._id}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.FORBIDDEN, {
      error: 'Forbidden',
      message: 'You cannot delete a system unless you created it.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('succeeds', async (): Promise<void> => {
    const testSystem = new SystemEntity();
    const testUser = new UserEntity();

    testSystem.createdByUserId = testUser._id;

    const token = await app.get(AuthService).generateToken(testUser._id);

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    systemRepositoryMock.findOneBy.mockReturnValueOnce(testSystem);
    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const response = await request(app.getHttpServer()).delete(`/system/${testSystem._id}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.OK, {
      id: testSystem._id.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
