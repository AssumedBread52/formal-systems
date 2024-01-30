// import { StatementEntity } from '@/statement/statement.entity';
// import { StatementRepositoryMock } from './mocks/statement-repository.mock';

import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { AuthService } from '@/auth/auth.service';
import { testExpiredToken } from '@/auth/tests/helpers/test-expired-token';
import { testInvalidToken } from '@/auth/tests/helpers/test-invalid-token';
import { testMissingToken } from '@/auth/tests/helpers/test-missing-token';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { GroupingEntity } from '../grouping.entity';
import { GroupingRepositoryMock } from './mocks/grouping-repository.mock';

describe('Delete Grouping', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'delete', `/system/${new ObjectId()}/grouping/${new ObjectId()}`);
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'delete', `/system/${new ObjectId()}/grouping/${new ObjectId()}`);
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'delete', `/system/${new ObjectId()}/grouping/${new ObjectId()}`);
  });

  it('succeeds if the grouping does not exist', async (): Promise<void> => {
    const groupingId = new ObjectId();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(new UserEntity());

    const token = await app.get(AuthService).generateToken(new ObjectId());

    const response = await request(app.getHttpServer()).delete(`/system/${new ObjectId()}/grouping/${groupingId}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.OK, {
      id: groupingId.toString()
    });
  });

  it('fails if the authenticated user did not create the grouping', async (): Promise<void> => {
    const testGrouping = new GroupingEntity();

    const { _id, systemId } = testGrouping;

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findOneBy.mockReturnValueOnce(testGrouping);
    userRepositoryMock.findOneBy.mockReturnValueOnce(new UserEntity());

    const token = await app.get(AuthService).generateToken(new ObjectId());

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}/grouping/${_id}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.FORBIDDEN, {
      error: 'Forbidden',
      message: 'You cannot delete a grouping unless you created it.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('succeeds (with no subgroupings)', async (): Promise<void> => {
    const testGrouping = new GroupingEntity();
    const testUser = new UserEntity();

    const { _id, systemId, createdByUserId } = testGrouping;

    testUser._id = createdByUserId;

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findBy.mockReturnValueOnce([]);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(testGrouping);
    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(new ObjectId());

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}/grouping/${_id}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.OK, {
      id: _id.toString()
    });
  });

  it('succeeds (with subgroupings)', async (): Promise<void> => {
    const testGrouping = new GroupingEntity();
    const testSubgrouping = new GroupingEntity();
    const testUser = new UserEntity();

    const { _id, systemId, createdByUserId } = testGrouping;

    testSubgrouping.ancestorIds = [_id];
    testSubgrouping.parentId = _id;
    testUser._id = createdByUserId;

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findBy.mockReturnValueOnce([testSubgrouping]);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(testGrouping);
    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(new ObjectId());

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}/grouping/${_id}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.OK, {
      id: _id.toString()
    });
  });

  it('succeeds (with subgrouping and supergrouping)', async (): Promise<void> => {
    const testGrouping = new GroupingEntity();
    const testSubgrouping = new GroupingEntity();
    const testSupergrouping = new GroupingEntity();
    const testUser = new UserEntity();

    const { _id, systemId, createdByUserId } = testGrouping;

    testGrouping.parentId = testSupergrouping._id;
    testGrouping.ancestorIds = [testSupergrouping._id];
    testSubgrouping.parentId = _id;
    testSubgrouping.ancestorIds = [testSupergrouping._id, _id];
    testUser._id = createdByUserId;

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findBy.mockReturnValueOnce([testSubgrouping]);
    groupingRepositoryMock.findOneBy.mockReturnValueOnce(testGrouping);
    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(new ObjectId());

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}/grouping/${_id}`).set('Cookie', [
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
