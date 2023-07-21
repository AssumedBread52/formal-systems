import { AppModule } from '@/app/app.module';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { readFileSync } from 'fs';
import * as request from 'supertest';

describe('Dev-Dependencies', (): void => {
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

  it('tests dependencies response', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/app/dev-dependencies');

    const { devDependencies } = JSON.parse(readFileSync(process.env.npm_package_json!, 'utf-8'));

    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual(devDependencies);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
