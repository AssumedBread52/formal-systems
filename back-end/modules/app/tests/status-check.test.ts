import { AppModule } from '@/app/app.module';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

describe('Test the status check', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AppModule
      ]
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
  });

  it('tests the status check', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/app/status');

    expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
    expect(response.body).toEqual({});
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
