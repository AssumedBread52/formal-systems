import { ConfigServiceMock } from '@/app/tests/mocks/config-service.mock';
import { AuthModule } from '@/auth/auth.module';
import { AuthService } from '@/auth/auth.service';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { SymbolModule } from '@/symbol/symbol.module';
import { SystemEntity } from '@/system/system.entity';
import { SystemRepositoryMock } from '@/system/tests/mocks/system-repository.mock';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as cookieParser from 'cookie-parser';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { SymbolRepositoryMock } from './mocks/symbol-repository.mock';

describe('Search Symbols', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AuthModule,
        SymbolModule
      ]
    }).overrideProvider(ConfigService).useClass(ConfigServiceMock).overrideProvider(getRepositoryToken(SymbolEntity)).useClass(SymbolRepositoryMock).overrideProvider(getRepositoryToken(SystemEntity)).useClass(SystemRepositoryMock).overrideProvider(getRepositoryToken(UserEntity)).useClass(UserRepositoryMock).compile();

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
  
    const { _id: userId } = userRepositoryMock.entities[0];
  
    const token = await authService.generateToken(userId);
  
    await request(app.getHttpServer()).post('/system').set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'System'
    });

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    const { _id } = systemRepositoryMock.entities[0];

    await request(app.getHttpServer()).post(`/system/${_id}/symbol`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'Symbol',
      type: SymbolType.Constant,
      content: '\\alpha'
    });
  });

  it('fails with a bad page query parameter', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get(`/system/${new ObjectId()}/symbol`);

    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: 'Validation failed (numeric string is expected)',
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with a bad count query parameter', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get(`/system/${new ObjectId()}/symbol?page=1`);

    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: 'Validation failed (numeric string is expected)',
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('succeeds without a keywords query parameter', async (): Promise<void> => {
    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;

    expect(symbolRepositoryMock.entities.length).toBeGreaterThan(0);

    const { systemId } = symbolRepositoryMock.entities[0];

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/symbol?page=1&count=10`);

    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      total: symbolRepositoryMock.entities.length,
      results: symbolRepositoryMock.entities.map((symbol: SymbolEntity): Object => {
        const { _id, title, description, type, content, axiomaticStatementAppearances, nonAxiomaticStatementAppearances, systemId, createdByUserId } = symbol;

        return {
          id: _id.toString(),
          title,
          description,
          type,
          content,
          axiomaticStatementAppearances,
          nonAxiomaticStatementAppearances,
          systemId: systemId.toString(),
          createdByUserId: createdByUserId.toString()
        };
      })
    });
  });

  it('succeeds with a single keywords query parameter', async (): Promise<void> => {
    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;

    expect(symbolRepositoryMock.entities.length).toBeGreaterThan(0);

    const { systemId } = symbolRepositoryMock.entities[0];

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/symbol?page=1&count=10&keywords=test`);

    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      total: symbolRepositoryMock.entities.length,
      results: symbolRepositoryMock.entities.map((symbol: SymbolEntity): Object => {
        const { _id, title, description, type, content, axiomaticStatementAppearances, nonAxiomaticStatementAppearances, systemId, createdByUserId } = symbol;

        return {
          id: _id.toString(),
          title,
          description,
          type,
          content,
          axiomaticStatementAppearances,
          nonAxiomaticStatementAppearances,
          systemId: systemId.toString(),
          createdByUserId: createdByUserId.toString()
        };
      })
    });
  });

  it('succeeds with multiple keywords query parameter', async (): Promise<void> => {
    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;

    expect(symbolRepositoryMock.entities.length).toBeGreaterThan(0);

    const { systemId } = symbolRepositoryMock.entities[0];

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/symbol?page=1&count=10&keywords=test&keywords=user`);

    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      total: symbolRepositoryMock.entities.length,
      results: symbolRepositoryMock.entities.map((symbol: SymbolEntity): Object => {
        const { _id, title, description, type, content, axiomaticStatementAppearances, nonAxiomaticStatementAppearances, systemId, createdByUserId } = symbol;

        return {
          id: _id.toString(),
          title,
          description,
          type,
          content,
          axiomaticStatementAppearances,
          nonAxiomaticStatementAppearances,
          systemId: systemId.toString(),
          createdByUserId: createdByUserId.toString()
        };
      })
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
