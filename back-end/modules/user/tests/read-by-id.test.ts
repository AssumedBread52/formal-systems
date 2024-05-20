import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { UserRepositoryMock } from './mocks/user-repository.mock';

describe('Read User by ID', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails with an invalid route parameter', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/user/1');

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'Invalid Mongodb ID structure.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if user is not found', async (): Promise<void> => {
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(null);

    const response = await request(app.getHttpServer()).get(`/user/${new ObjectId()}`);

    expectCorrectResponse(response, HttpStatus.NOT_FOUND, {
      error: 'Not Found',
      message: 'User not found.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('succeeds', async (): Promise<void> => {
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const response = await request(app.getHttpServer()).get(`/user/${user._id}`);

    expectCorrectResponse(response, HttpStatus.OK, {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      systemCount: user.systemCount,
      constantSymbolCount: user.constantSymbolCount,
      variableSymbolCount: user.variableSymbolCount,
      axiomCount: user.axiomCount,
      theoremCount: user.theoremCount,
      deductionCount: user.deductionCount
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
