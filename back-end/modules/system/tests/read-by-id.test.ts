import { ConfigServiceMock } from '@/app/tests/mocks/config-service.mock';
import { AuthModule } from '@/auth/auth.module';
import { SystemEntity } from '@/system/system.entity';
import { SystemModule } from '@/system/system.module';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as cookieParser from 'cookie-parser';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { SystemRepositoryMock } from './mocks/system-repository.mock';
import { AuthService } from '@/auth/auth.service';

describe('Read by ID', (): void => {
  const signUpPayload = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@test.com',
    password: '123456'
  };
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AuthModule,
        SystemModule
      ]
    }).overrideProvider(ConfigService).useClass(ConfigServiceMock).overrideProvider(getRepositoryToken(SystemEntity)).useClass(SystemRepositoryMock).overrideProvider(getRepositoryToken(UserEntity)).useClass(UserRepositoryMock).compile();

    app = moduleRef.createNestApplication();

    app.use(cookieParser());

    await app.init();

    await request(app.getHttpServer()).post('/auth/sign-up').send(signUpPayload);

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    const token = await app.get(AuthService).generateToken(userRepositoryMock.users[0]._id);

    await request(app.getHttpServer()).post('/system').set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'System'
    });
  });

  it('fails with an invalid ID', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get(`/system/${new ObjectId()}`);

    expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(response.body).toEqual({
      error: 'Not Found',
      message: 'System not found.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('succeeds with valid token', async (): Promise<void> => {
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    expect(systemRepositoryMock.systems.length).toBeGreaterThan(0);

    const { _id } = systemRepositoryMock.systems[0];

    const response = await request(app.getHttpServer()).get(`/system/${_id}`);

    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      id: systemRepositoryMock.systems[0]._id.toString(),
      title: systemRepositoryMock.systems[0].title,
      description: systemRepositoryMock.systems[0].description,
      constantSymbolCount: systemRepositoryMock.systems[0].constantSymbolCount,
      variableSymbolCount: systemRepositoryMock.systems[0].variableSymbolCount,
      createdByUserId: systemRepositoryMock.systems[0].createdByUserId.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});