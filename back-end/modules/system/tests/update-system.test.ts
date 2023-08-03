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

describe('Update System', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'patch', `/system/${new ObjectId()}`);
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'patch', `/system/${new ObjectId()}`);
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'patch', `/system/${new ObjectId()}`);
  });

  it('fails with an invalid payload', async (): Promise<void> => {
    const token = await app.get(AuthService).generateToken(new ObjectId());

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(new UserEntity());

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: [
        'newTitle should not be empty',
        'newDescription should not be empty'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid system ID', async (): Promise<void> => {
    const token = await app.get(AuthService).generateToken(new ObjectId());

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(new UserEntity());

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Title',
      newDescription: 'New Description'
    });

    expectCorrectResponse(response, HttpStatus.NOT_FOUND, {
      error: 'Not Found',
      message: 'System not found.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('fails when updating a system the user did not create', async (): Promise<void> => {
    const testUser = new UserEntity();

    const token = await app.get(AuthService).generateToken(testUser._id);

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const testSystem = new SystemEntity();

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    systemRepositoryMock.findOneBy.mockReturnValueOnce(testSystem);

    const response = await request(app.getHttpServer()).patch(`/system/${testSystem._id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Title',
      newDescription: 'New Description'
    });

    expectCorrectResponse(response, HttpStatus.FORBIDDEN, {
      error: 'Forbidden',
      message: 'You cannot update a system unless you created it.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('fails if title is already in use', async (): Promise<void> => {
    const token = await app.get(AuthService).generateToken(new ObjectId());

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    const testUser = new UserEntity();

    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const testSystem = new SystemEntity();

    testSystem.createdByUserId = testUser._id;

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    systemRepositoryMock.findOneBy.mockReturnValueOnce(testSystem);
    systemRepositoryMock.findOneBy.mockReturnValueOnce(new SystemEntity());

    const response = await request(app.getHttpServer()).patch(`/system/${testSystem._id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Title',
      newDescription: 'New Description'
    });

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Systems created by the same user must have a unique title.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('succeeds with a valid token, valid payload, and unique title', async (): Promise<void> => {
    const token = await app.get(AuthService).generateToken(new ObjectId());

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    const testUser = new UserEntity();

    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const testSystem = new SystemEntity();

    testSystem.createdByUserId = testUser._id;

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    systemRepositoryMock.findOneBy.mockReturnValueOnce(testSystem);

    const response = await request(app.getHttpServer()).patch(`/system/${testSystem._id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Title',
      newDescription: 'New Description'
    });

    expectCorrectResponse(response, HttpStatus.OK, {
      id: testSystem._id.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
