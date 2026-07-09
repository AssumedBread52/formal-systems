import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import migrations from '@/migration/migrations';
import { BaseMigration } from '@/migration/migrations/base.migration';
import { Type } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';

describe('Revert migrations', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('when reverting a migration', (): void => {
    it.each(Object.entries(migrations))('reverts the %s migration', async (name: string, MigrationClass: Type<BaseMigration>): Promise<void> => {
      query.mockResolvedValueOnce([]);

      const queryRunner = app.get(DataSource).createQueryRunner();

      const migration = new MigrationClass();

      await migration.down(queryRunner);

      expect(name).toBe(MigrationClass.name);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, migration.DOWN_SCRIPT);
    });
  });

  describe('when reverting a migration fails', (): void => {
    it.each(Object.entries(migrations))('reports failure when reverting the %s migration fails', async (name: string, MigrationClass: Type<BaseMigration>): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const queryRunner = app.get(DataSource).createQueryRunner();

      const migration = new MigrationClass();

      await expect(migration.down(queryRunner)).rejects.toStrictEqual(new Error());

      expect(name).toBe(MigrationClass.name);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, migration.DOWN_SCRIPT);
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();

    jest.restoreAllMocks();
  });
});
