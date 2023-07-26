import { ConfigServiceMock } from '@/app/tests/mocks/config-service.mock';
import { AuthModule } from '@/auth/auth.module';
import { AuthService } from '@/auth/auth.service';
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

describe('Search', (): void => {
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

    const authService = app.get(AuthService);

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    const { _id } = userRepositoryMock.entities[0];

    const token = await authService.generateToken(_id);

    await request(app.getHttpServer()).post('/system').set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test1',
      description: 'System'
    });

    await request(app.getHttpServer()).post('/system').set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test2',
      description: 'System'
    });
  });

  it('fails with a bad page query parameter', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/system');

    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: 'Validation failed (numeric string is expected)',
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with a bad count query parameter', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/system?page=1');

    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: 'Validation failed (numeric string is expected)',
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('succeeds without a keywords query parameter', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/system?page=1&count=10');

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      total: systemRepositoryMock.entities.length,
      results: systemRepositoryMock.entities.map((system: SystemEntity): Object => {
        const { _id, title, description, constantSymbolCount, variableSymbolCount, createdByUserId } = system;
        return {
          id: _id.toString(),
          title,
          description,
          constantSymbolCount,
          variableSymbolCount,
          createdByUserId: createdByUserId.toString()
        };
      })
    });
  });

  it('succeeds with a single keywords query parameter', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/system?page=1&count=10&keywords=test');

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      total: systemRepositoryMock.entities.length,
      results: systemRepositoryMock.entities.map((system: SystemEntity): Object => {
        const { _id, title, description, constantSymbolCount, variableSymbolCount, createdByUserId } = system;
        return {
          id: _id.toString(),
          title,
          description,
          constantSymbolCount,
          variableSymbolCount,
          createdByUserId: createdByUserId.toString()
        };
      })
    });
  });

  it('succeeds with a multiple keywords query parameter', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/system?page=1&count=10&keywords=test&keywords=user');

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      total: systemRepositoryMock.entities.length,
      results: systemRepositoryMock.entities.map((system: SystemEntity): Object => {
        const { _id, title, description, constantSymbolCount, variableSymbolCount, createdByUserId } = system;
        return {
          id: _id.toString(),
          title,
          description,
          constantSymbolCount,
          variableSymbolCount,
          createdByUserId: createdByUserId.toString()
        };
      })
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
