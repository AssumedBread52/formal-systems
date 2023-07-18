import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('Test the status', (): void => {
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

  it('', (): void => {
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
