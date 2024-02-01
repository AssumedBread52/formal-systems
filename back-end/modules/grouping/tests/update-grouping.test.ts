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
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

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

  it('fails when attempting to update a grouping that does not exist', async (): Promise<void> => {
    const user = new UserEntity();

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findOneBy.mockReturnValueOnce(null);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}/grouping/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.'
    });

    expectCorrectResponse(response, HttpStatus.NOT_FOUND, {
      error: 'Not Found',
      message: 'Grouping not found.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('fails when attempting to update a grouping the user did not create', async (): Promise<void> => {
    const grouping = new GroupingEntity();
    const user = new UserEntity();

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findOneBy.mockReturnValueOnce(grouping);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${grouping.systemId}/grouping/${grouping._id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.'
    });

    expectCorrectResponse(response, HttpStatus.FORBIDDEN, {
      error: 'Forbidden',
      message: 'You cannot update a grouping unless you created it.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('fails when new title conflicts with an existing title', async (): Promise<void> => {
    const conflictGrouping = new GroupingEntity();
    const grouping = new GroupingEntity();
    const user = new UserEntity();

    conflictGrouping.title = 'Test';
    conflictGrouping.createdByUserId = user._id;
    grouping.systemId = conflictGrouping.systemId;
    grouping.createdByUserId = user._id;

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findOneBy.mockReturnValueOnce(grouping);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(conflictGrouping);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${grouping.systemId}/grouping/${grouping._id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.'
    });

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Groupings within a formal system must have unique titles.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('succeeds without a parent ID change', async (): Promise<void> => {
    const grouping = new GroupingEntity();
    const user = new UserEntity();

    grouping.createdByUserId = user._id;

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findOneBy.mockReturnValueOnce(grouping);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(null);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${grouping.systemId}/grouping/${grouping._id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.'
    });

    expectCorrectResponse(response, HttpStatus.OK, {
      id: grouping._id.toString()
    });
  });

  it('fails with a missing parent', async (): Promise<void> => {
    const grouping = new GroupingEntity();
    const user = new UserEntity();

    grouping.createdByUserId = user._id;

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findOneBy.mockReturnValueOnce(grouping);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(null);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(null);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${grouping.systemId}/grouping/${grouping._id}`).set('Cookie', [
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

  it('fails if new parent is a subgrouping of current grouping', async (): Promise<void> => {
    const grouping = new GroupingEntity();
    const subGrouping = new GroupingEntity();
    const user = new UserEntity();

    grouping.createdByUserId = user._id;
    subGrouping.parentId = grouping._id;
    subGrouping.ancestorIds = [grouping._id];
    subGrouping.systemId = grouping.systemId;
    subGrouping.createdByUserId = user._id;

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findOneBy.mockReturnValueOnce(grouping);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(null);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(subGrouping);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${grouping.systemId}/grouping/${grouping._id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.',
      newParentId: subGrouping._id
    });

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Groupings cannot be their own descendants.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('succeeds when going from root grouping to subgrouping', async (): Promise<void> => {
    const newParentGrouping = new GroupingEntity();
    const grouping = new GroupingEntity();
    const subGrouping = new GroupingEntity();
    const user = new UserEntity();

    newParentGrouping.createdByUserId = user._id;
    grouping.systemId = newParentGrouping.systemId;
    grouping.createdByUserId = user._id;
    subGrouping.parentId = grouping._id;
    subGrouping.ancestorIds = [grouping._id];
    subGrouping.systemId = grouping.systemId;
    subGrouping.createdByUserId = user._id;

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findBy.mockReturnValueOnce([subGrouping]);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(grouping);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(null);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(newParentGrouping);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${grouping.systemId}/grouping/${grouping._id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.',
      newParentId: newParentGrouping._id
    });

    expectCorrectResponse(response, HttpStatus.OK, {
      id: grouping._id.toString()
    });
  });

  it('succeeds when going from subgrouping to root grouping', async (): Promise<void> => {
    const parentGrouping = new GroupingEntity();
    const grouping = new GroupingEntity();
    const subGrouping = new GroupingEntity();
    const user = new UserEntity();

    parentGrouping.createdByUserId = user._id;
    grouping.parentId = parentGrouping._id;
    grouping.ancestorIds = [parentGrouping._id];
    grouping.systemId = parentGrouping.systemId;
    grouping.createdByUserId = user._id;
    subGrouping.parentId = grouping._id;
    subGrouping.ancestorIds = [parentGrouping._id, grouping._id];
    subGrouping.systemId = grouping.systemId;
    subGrouping.createdByUserId = user._id;

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findBy.mockReturnValueOnce([subGrouping]);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(grouping);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(null);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${grouping.systemId}/grouping/${grouping._id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.'
    });

    expectCorrectResponse(response, HttpStatus.OK, {
      id: grouping._id.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
