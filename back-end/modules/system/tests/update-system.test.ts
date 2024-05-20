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
    await testMissingToken(app, 'patch', '/system/1');
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'patch', '/system/1');
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'patch', '/system/1');
  });

  it('fails with an invalid route parameter', async (): Promise<void> => {
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch('/system/1').set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'Invalid Mongodb ID structure.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails with an invalid payload', async (): Promise<void> => {
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

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

  it('fails if the system is not found', async (): Promise<void> => {
    const user = new UserEntity();

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    systemRepositoryMock.findOneBy.mockReturnValueOnce(null);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Title',
      newDescription: 'This is a new test.'
    });

    expectCorrectResponse(response, HttpStatus.NOT_FOUND, {
      error: 'Not Found',
      message: 'System not found.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('fails if the system was not created by the user', async (): Promise<void> => {
    const system = new SystemEntity();
    const user = new UserEntity();

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    systemRepositoryMock.findOneBy.mockReturnValueOnce(system);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${system._id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Title',
      newDescription: 'This is a new test.'
    });

    expectCorrectResponse(response, HttpStatus.FORBIDDEN, {
      error: 'Forbidden',
      message: 'Write actions require user ownership.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('fails if the title is already in use', async (): Promise<void> => {
    const newTitle = 'New Title';

    const conflictSystem = new SystemEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    conflictSystem.title = newTitle;
    conflictSystem.createdByUserId = user._id;
    system.createdByUserId = user._id;

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    systemRepositoryMock.findOneBy.mockReturnValueOnce(system);
    systemRepositoryMock.findOneBy.mockReturnValueOnce(conflictSystem);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${system._id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription: 'This is a new test.'
    });

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Systems created by the same user must have a unique title.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('succeeds', async (): Promise<void> => {
    const system = new SystemEntity();
    const user = new UserEntity();

    system.createdByUserId = user._id;

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    systemRepositoryMock.findOneBy.mockReturnValueOnce(system);
    systemRepositoryMock.findOneBy.mockReturnValueOnce(null);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${system._id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Title',
      newDescription: 'This is a new test.'
    });

    expectCorrectResponse(response, HttpStatus.OK, {
      id: system._id.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
