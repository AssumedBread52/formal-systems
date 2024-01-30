// import { StatementRepositoryMock } from './mocks/statement-repository.mock';

import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { AuthService } from '@/auth/auth.service';
import { testExpiredToken } from '@/auth/tests/helpers/test-expired-token';
import { testInvalidToken } from '@/auth/tests/helpers/test-invalid-token';
import { testMissingToken } from '@/auth/tests/helpers/test-missing-token';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { GroupingEntity } from '@/grouping/grouping.entity';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { GroupingRepositoryMock } from './mocks/grouping-repository.mock';

describe('Update Grouping', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'patch', `/system/${new ObjectId()}/grouping/${new ObjectId()}`);
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'patch', `/system/${new ObjectId()}/grouping/${new ObjectId()}`);
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'patch', `/system/${new ObjectId()}/grouping/${new ObjectId()}`);
  });

  it('fails with an invalid payload', async (): Promise<void> => {
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(new UserEntity());

    const token = await app.get(AuthService).generateToken(new ObjectId());

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}/grouping/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newParentId: ''
    });

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: [
        'newTitle should not be empty',
        'newDescription should not be empty',
        'newParentId must be a mongodb id'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails when updating a grouping that does not exist', async (): Promise<void> => {
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(new UserEntity());

    const token = await app.get(AuthService).generateToken(new ObjectId());

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}/grouping/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.',
      newParentId: new ObjectId()
    });

    expectCorrectResponse(response, HttpStatus.NOT_FOUND, {
      error: 'Not Found',
      message: 'Grouping not found.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('fails when updating a grouping the user did not create', async (): Promise<void> => {
    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findOneBy.mockReturnValueOnce(new GroupingEntity());
    userRepositoryMock.findOneBy.mockReturnValueOnce(new UserEntity());

    const token = await app.get(AuthService).generateToken(new ObjectId());

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}/grouping/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.',
      newParentId: new ObjectId()
    });

    expectCorrectResponse(response, HttpStatus.FORBIDDEN, {
      error: 'Forbidden',
      message: 'You cannot update a grouping unless you created it.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('fails when a title change conflicts', async (): Promise<void> => {
    const testGrouping = new GroupingEntity();
    const testUser = new UserEntity();

    const { _id, systemId, createdByUserId } = testGrouping;

    testUser._id = createdByUserId;

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findOneBy.mockReturnValueOnce(testGrouping);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(new GroupingEntity());
    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(createdByUserId);

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/grouping/${_id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.',
      newParentId: new ObjectId()
    });

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Groupings under the same parent must have unique titles.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('fails when a parent change conflicts', async (): Promise<void> => {
    const testGrouping = new GroupingEntity();
    const testUser = new UserEntity();

    const { _id, systemId, createdByUserId } = testGrouping;

    testGrouping.title = 'Test';
    testUser._id = createdByUserId;

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findOneBy.mockReturnValueOnce(testGrouping);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(new GroupingEntity());
    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(createdByUserId);

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/grouping/${_id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.',
      newParentId: new ObjectId()
    });

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Groupings under the same parent must have unique titles.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('fails when new parent does not exist', async (): Promise<void> => {
    const testGrouping = new GroupingEntity();
    const testUser = new UserEntity();

    const { _id, systemId, createdByUserId } = testGrouping;

    testUser._id = createdByUserId;

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findOneBy.mockReturnValueOnce(testGrouping);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(null);
    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(createdByUserId);

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/grouping/${_id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.',
      newParentId: new ObjectId()
    });

    expectCorrectResponse(response, HttpStatus.NOT_FOUND, {
      error: 'Not Found',
      message: 'New parent not found within the formal system.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('fails when changing parent to itself', async (): Promise<void> => {
    const parentGrouping = new GroupingEntity();
    const testGrouping = new GroupingEntity();
    const testUser = new UserEntity();

    const { _id, systemId, createdByUserId } = testGrouping;

    parentGrouping.ancestorIds = [_id];
    testUser._id = createdByUserId;

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findOneBy.mockReturnValueOnce(testGrouping);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(null);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(parentGrouping);
    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(createdByUserId);

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/grouping/${_id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.',
      newParentId: new ObjectId()
    });

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Groupings cannot be included in their own groupings or subgroupings.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('succeeds', async (): Promise<void> => {
    const testGrouping = new GroupingEntity();
    const testUser = new UserEntity();

    const { _id, systemId, createdByUserId } = testGrouping;

    testUser._id = createdByUserId;

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findOneBy.mockReturnValueOnce(testGrouping);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(null);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(new GroupingEntity());
    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(createdByUserId);

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/grouping/${_id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.',
      newParentId: new ObjectId()
    });

    expectCorrectResponse(response, HttpStatus.OK, {
      id: _id.toString()
    });
  });

  it('succeeds (without a new parent ID)', async (): Promise<void> => {
    const testGrouping = new GroupingEntity();
    const testUser = new UserEntity();

    const { _id, systemId, createdByUserId } = testGrouping;

    testUser._id = createdByUserId;

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findOneBy.mockReturnValueOnce(testGrouping);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(null);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(new GroupingEntity());
    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(createdByUserId);

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/grouping/${_id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.'
    });

    expectCorrectResponse(response, HttpStatus.OK, {
      id: _id.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
