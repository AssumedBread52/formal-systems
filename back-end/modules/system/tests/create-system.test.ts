import { ConfigServiceMock } from '@/app/tests/mocks/config-service.mock';
import { AuthModule } from '@/auth/auth.module';
import { generateToken } from '@/auth/tests/helpers/generate-token';
import { testWithExpiredToken } from '@/auth/tests/helpers/test-with-expired-token';
import { testWithInvalidToken } from '@/auth/tests/helpers/test-with-invalid-token';
import { SystemEntity } from '@/system/system.entity';
import { SystemModule } from '@/system/system.module';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { SystemRepositoryMock } from './mocks/system-repository.mock';

describe('Create System', (): void => {
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
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: '123456'
    });
  });

  it('fails without a token', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).post('/system');
  
    expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body).toEqual({
      message: 'Unauthorized',
      statusCode: HttpStatus.UNAUTHORIZED
    });
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testWithInvalidToken(app, 'post', '/system');
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testWithExpiredToken(app, 'post', '/system');
  });

  it('fails with an invalid payload', async (): Promise<void> => {
    const token = await generateToken(app);

    const response = await request(app.getHttpServer()).post('/system').set('Cookie', [
      `token=${token}`
    ]);

    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: [
        'title should not be empty',
        'description should not be empty'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('succeeds if the title is unique for this user', async (): Promise<void> => {
    const token = await generateToken(app);

    const response = await request(app.getHttpServer()).post('/system').set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'System'
    });

    expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
    expect(response.body).toEqual({});
  });

  it('fails if the title is not unique for this user', async (): Promise<void> => {
    const newSystemPayload = {
      title: 'Test',
      description: 'This is a test.'
    };

    const token = await generateToken(app);

    const response = await request(app.getHttpServer()).post('/system').set('Cookie', [
      `token=${token}`
    ]).send(newSystemPayload);

    expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
    expect(response.body).toEqual({});

    const collision = await request(app.getHttpServer()).post('/system').set('Cookie', [
      `token=${token}`
    ]).send(newSystemPayload);

    expect(collision.statusCode).toBe(HttpStatus.CONFLICT);
    expect(collision.body).toEqual({
      error: 'Conflict',
      message: 'Systems created by the same user must have a unique title.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  afterEach((): void => {
    const systemRepository = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    systemRepository.systems = [];
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
