import { ConfigServiceMock } from '@/app/tests/mocks/config-service.mock';
import { AuthModule } from '@/auth/auth.module';
import { generateToken } from '@/auth/tests/helpers/generate-token';
import { testWithExpiredToken } from '@/auth/tests/helpers/test-with-expired-token';
import { testWithInvalidToken } from '@/auth/tests/helpers/test-with-invalid-token';
import { testWithMissingToken } from '@/auth/tests/helpers/test-with-missing-token';
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

describe('Delete System', (): void => {
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

    await request(app.getHttpServer()).post('/auth/sign-up').send({
      firstName: 'Test1',
      lastName: 'User1',
      email: 'test1@test.com',
      password: '123456'
    });
    await request(app.getHttpServer()).post('/auth/sign-up').send({
      firstName: 'Test2',
      lastName: 'User2',
      email: 'test2@test.com',
      password: '123456'
    });

    const token = await generateToken(app);

    await request(app.getHttpServer()).post('/system').set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.'
    });
  });

  it('fails without a token', async (): Promise<void> => {
    await testWithMissingToken(app, 'delete', `/system/${new ObjectId()}`);
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testWithInvalidToken(app, 'delete', `/system/${new ObjectId()}`);
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testWithExpiredToken(app, 'delete', `/system/${new ObjectId()}`);
  });

  it('succeeds if the system does not exist', async (): Promise<void> => {
    const token = await generateToken(app);

    const systemId = new ObjectId();

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}`).set('Cookie', [
      `token=${token}`
    ]);

    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      id: systemId.toString()
    });
  });

  it('fails if the system createdByUserId does not match the user ID in the token', async (): Promise<void> => {
    const token = await generateToken(app, 1);

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    expect(systemRepositoryMock.systems.length).toBeGreaterThan(0);

    const { _id } = systemRepositoryMock.systems[0];

    const response = await request(app.getHttpServer()).delete(`/system/${_id}`).set('Cookie', [
      `token=${token}`
    ]);

    expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    expect(response.body).toEqual({
      error: 'Forbidden',
      message: 'You cannot delete entities unless you created them.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('succeeds if the system createdByUserId matches the user ID in the token', async (): Promise<void> => {
    const token = await generateToken(app);

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    expect(systemRepositoryMock.systems.length).toBeGreaterThan(0);

    const { _id } = systemRepositoryMock.systems[0];

    const response = await request(app.getHttpServer()).delete(`/system/${_id}`).set('Cookie', [
      `token=${token}`
    ]);

    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      id: _id.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});