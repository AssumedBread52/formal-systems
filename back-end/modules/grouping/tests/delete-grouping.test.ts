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
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).delete(`/system/${new ObjectId()}/grouping/${groupingId}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.OK, {
      id: groupingId.toString()
    });
  });

  it('fails if the user did not create the grouping', async (): Promise<void> => {
    const grouping = new GroupingEntity();
    const user = new UserEntity();

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findOneBy.mockReturnValueOnce(grouping);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).delete(`/system/${grouping.systemId}/grouping/${grouping._id}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.FORBIDDEN, {
      error: 'Forbidden',
      message: 'You cannot delete a grouping unless you created it.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('succeeds with no subgroupings', async (): Promise<void> => {
    const grouping = new GroupingEntity();
    const user = new UserEntity();

    grouping.createdByUserId = user._id;

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findOneBy.mockReturnValueOnce(grouping);
    groupingRepositoryMock.findBy.mockReturnValueOnce([]);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).delete(`/system/${grouping.systemId}/grouping/${grouping._id}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.OK, {
      id: grouping._id.toString()
    });
  });

  it('succeeds with subgrouping', async (): Promise<void> => {
    const grouping = new GroupingEntity();
    const subgrouping = new GroupingEntity();
    const user = new UserEntity();

    grouping.createdByUserId = user._id;
    subgrouping.parentId = grouping._id;
    subgrouping.ancestorIds = [grouping._id];
    subgrouping.systemId = grouping.systemId;
    subgrouping.createdByUserId = user._id;

    const groupingRepositoryMock = app.get(getRepositoryToken(GroupingEntity)) as GroupingRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    groupingRepositoryMock.findOneBy.mockReturnValueOnce(grouping);
    groupingRepositoryMock.findBy.mockReturnValueOnce([subgrouping]);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).delete(`/system/${grouping.systemId}/grouping/${grouping._id}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.OK, {
      id: grouping._id.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
