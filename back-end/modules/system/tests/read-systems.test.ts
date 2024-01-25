import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { SystemEntity } from '@/system/system.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { SystemRepositoryMock } from './mocks/system-repository.mock';

describe('Read Systems', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails with a bad page query parameter', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/system');

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: 'Validation failed (numeric string is expected)',
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with a bad count query parameter', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/system?page=1');

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: 'Validation failed (numeric string is expected)',
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('succeeds without a keywords query parameter', async (): Promise<void> => {
    const testSystem = new SystemEntity();

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    systemRepositoryMock.findAndCount.mockReturnValueOnce([[testSystem], 1]);

    const { _id, title, description, constantSymbolCount, variableSymbolCount, axiomCount, theoremCount, deductionCount, createdByUserId } = testSystem;

    const response = await request(app.getHttpServer()).get('/system?page=1&count=10');

    expectCorrectResponse(response, HttpStatus.OK, {
      results: [
        {
          id: _id.toString(),
          title,
          description,
          constantSymbolCount,
          variableSymbolCount,
          axiomCount,
          theoremCount,
          deductionCount,
          createdByUserId: createdByUserId.toString()
        }
      ],
      total: 1
    });
  });

  it('succeeds with a single keywords query parameter', async (): Promise<void> => {
    const testSystem = new SystemEntity();

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    systemRepositoryMock.findAndCount.mockReturnValueOnce([[testSystem], 1]);

    const { _id, title, description, constantSymbolCount, variableSymbolCount, axiomCount, theoremCount, deductionCount, createdByUserId } = testSystem;

    const response = await request(app.getHttpServer()).get('/system?page=1&count=10&keywords=test');

    expectCorrectResponse(response, HttpStatus.OK, {
      results: [
        {
          id: _id.toString(),
          title,
          description,
          constantSymbolCount,
          variableSymbolCount,
          axiomCount,
          theoremCount,
          deductionCount,
          createdByUserId: createdByUserId.toString()
        }
      ],
      total: 1
    });
  });

  it('succeeds with multiple keywords query parameter', async (): Promise<void> => {
    const testSystem = new SystemEntity();

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    systemRepositoryMock.findAndCount.mockReturnValueOnce([[testSystem], 1]);

    const { _id, title, description, constantSymbolCount, variableSymbolCount, axiomCount, theoremCount, deductionCount, createdByUserId } = testSystem;

    const response = await request(app.getHttpServer()).get('/system?page=1&count=10&keywords=test&keywords=user');

    expectCorrectResponse(response, HttpStatus.OK, {
      results: [
        {
          id: _id.toString(),
          title,
          description,
          constantSymbolCount,
          variableSymbolCount,
          axiomCount,
          theoremCount,
          deductionCount,
          createdByUserId: createdByUserId.toString()
        }
      ],
      total: 1
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
