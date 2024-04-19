import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { testExpiredToken } from '@/auth/tests/helpers/test-expired-token';
import { testInvalidToken } from '@/auth/tests/helpers/test-invalid-token';
import { testMissingToken } from '@/auth/tests/helpers/test-missing-token';
import { INestApplication } from '@nestjs/common';

describe('Update Statement', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'patch', '/system/1/statement/1');
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'patch', '/system/1/statement/1');
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'patch', '/system/1/statement/1');
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
