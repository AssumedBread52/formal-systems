import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { AuthService } from '@/auth/auth.service';
import { testExpiredToken } from '@/auth/tests/helpers/test-expired-token';
import { testInvalidToken } from '@/auth/tests/helpers/test-invalid-token';
import { testMissingToken } from '@/auth/tests/helpers/test-missing-token';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { GroupingEntity } from '@/grouping/grouping.entity';
import { SystemEntity } from '@/system/system.entity';
import { SystemRepositoryMock } from '@/system/tests/mocks/system-repository.mock';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { GroupingRepositoryMock } from './mocks/grouping-repository.mock';

describe('Create Grouping', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'post', `/system/${new ObjectId()}/grouping`);
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'post', `/system/${new ObjectId()}/grouping`);
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'post', `/system/${new ObjectId()}/grouping`);
  });

  it('fails with an invalid payload', async (): Promise<void> => {
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).post(`/system/${new ObjectId()}/grouping`).set('Cookie', [
      `token=${token}`
    ]).send({
      parentId: ''
    });

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: [
        'title should not be empty',
        'description should not be empty',
        'parentId must be a mongodb id'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails if the system does not exist', async (): Promise<void> => {
    const user = new UserEntity();

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    systemRepositoryMock.findOneBy.mockReturnValueOnce(null);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).post(`/system/${new ObjectId()}/grouping`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.'
    });

    expectCorrectResponse(response, HttpStatus.NOT_FOUND, {
      error: 'Not Found',
      message: 'Groupings cannot be added to formal systems that do not exist.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('fails if the user did not create the system', async (): Promise<void> => {
    const system = new SystemEntity();
    const user = new UserEntity();

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    systemRepositoryMock.findOneBy.mockReturnValueOnce(system);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).post(`/system/${system._id}/grouping`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.'
    });

    expectCorrectResponse(response, HttpStatus.FORBIDDEN, {
      error: 'Forbidden',
      message: 'Groupings cannot be added to formal systems unless you created them.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('fails if the title is not unqiue', async (): Promise<void> => {
    const grouping = new GroupingEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    grouping.createdByUserId = user._id;
    grouping.systemId = system._id;
    system.createdByUserId = user._id;

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findOneBy.mockReturnValueOnce(grouping);
    systemRepositoryMock.findOneBy.mockReturnValueOnce(system);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).post(`/system/${system._id}/grouping`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.'
    });

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Groupings within a formal system must have unique titles.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('succeeds (with no parent ID)', async (): Promise<void> => {
    const system = new SystemEntity();
    const user = new UserEntity();

    system.createdByUserId = user._id;

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findOneBy.mockReturnValueOnce(null);
    systemRepositoryMock.findOneBy.mockReturnValueOnce(system);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).post(`/system/${system._id}/grouping`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.'
    });

    expectCorrectResponse(response, HttpStatus.CREATED, {});
  });

  it('fails with a missing parent', async (): Promise<void> => {
    const testUser = new UserEntity();
    const testSystem = new SystemEntity();

    const { _id, createdByUserId } = testSystem;

    testUser._id = createdByUserId;

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);
    systemRepositoryMock.findOneBy.mockReturnValueOnce(testSystem);

    const token = await app.get(AuthService).generateToken(createdByUserId);

    const response = await request(app.getHttpServer()).post(`/system/${_id}/grouping`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      parentId: new ObjectId()
    });

    expectCorrectResponse(response, HttpStatus.NOT_FOUND, {
      error: 'Not Found',
      message: 'Parent not found within the formal system.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('succeeds', async (): Promise<void> => {
    const testUser = new UserEntity();
    const testSystem = new SystemEntity();

    const { _id, createdByUserId } = testSystem;

    testUser._id = createdByUserId;

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);
    systemRepositoryMock.findOneBy.mockReturnValueOnce(testSystem);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(null);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(new GroupingEntity());

    const token = await app.get(AuthService).generateToken(createdByUserId);

    const response = await request(app.getHttpServer()).post(`/system/${_id}/grouping`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      parentId: new ObjectId()
    });

    expectCorrectResponse(response, HttpStatus.CREATED, {});
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
