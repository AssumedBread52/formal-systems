import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import migrations from '@/migration/migrations';
import { BaseMigration } from '@/migration/migrations/base.migration';
import { Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';
import { PostgresQueryRunner } from 'typeorm/driver/postgres/PostgresQueryRunner';

describe('Run Migrations', (): void => {
  const afterConnect = jest.spyOn(PostgresDriver.prototype, 'afterConnect');
  const disconnect = jest.spyOn(PostgresDriver.prototype, 'disconnect');
  const driverConnect = jest.spyOn(PostgresDriver.prototype, 'connect');
  const getOrThrow = jest.spyOn(ConfigService.prototype, 'getOrThrow');
  const query = jest.spyOn(PostgresQueryRunner.prototype, 'query');
  const queryRunnerConnect = jest.spyOn(PostgresQueryRunner.prototype, 'connect');
  const migrationEntries = Object.entries(migrations);

  beforeEach((): void => {
    afterConnect.mockClear();
    disconnect.mockClear();
    driverConnect.mockClear();
    getOrThrow.mockClear();
    query.mockClear();
    queryRunnerConnect.mockClear();
  });

  describe('when running pending migrations', (): void => {
    it('creates the migrations table and runs all pending migrations', async (): Promise<void> => {
      afterConnect.mockResolvedValueOnce();
      disconnect.mockResolvedValueOnce();
      driverConnect.mockResolvedValueOnce();
      getOrThrow.mockReturnValueOnce('test secret');
      getOrThrow.mockReturnValueOnce('5');
      getOrThrow.mockReturnValueOnce('postgres');
      getOrThrow.mockReturnValueOnce('database_scheme');
      getOrThrow.mockReturnValueOnce('database_username');
      getOrThrow.mockReturnValueOnce('database_password');
      getOrThrow.mockReturnValueOnce('database_host');
      getOrThrow.mockReturnValueOnce(5432);
      getOrThrow.mockReturnValueOnce('database_name');
      getOrThrow.mockReturnValueOnce('test secret');
      query.mockResolvedValueOnce([]);
      query.mockResolvedValueOnce([
        {
          current_schema: 'public'
        }
      ]);
      query.mockResolvedValueOnce([]);
      query.mockResolvedValueOnce([]);
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce([]);
      migrationEntries.forEach((): void => {
        query.mockResolvedValueOnce([]);
        query.mockResolvedValueOnce(buildQueryResult([]));
      });
      query.mockResolvedValueOnce([]);
      query.mockResolvedValueOnce([]);
      queryRunnerConnect.mockResolvedValueOnce(undefined);

      const app = await createTestApp();

      await app.close();

      expect(afterConnect).toHaveBeenCalledTimes(1);
      expect(afterConnect).toHaveBeenNthCalledWith(1);
      expect(disconnect).toHaveBeenCalledTimes(1);
      expect(disconnect).toHaveBeenNthCalledWith(1);
      expect(driverConnect).toHaveBeenCalledTimes(1);
      expect(driverConnect).toHaveBeenNthCalledWith(1);
      expect(getOrThrow).toHaveBeenCalledTimes(10);
      expect(getOrThrow).toHaveBeenNthCalledWith(1, 'JSON_WEB_TOKEN_SECRET');
      expect(getOrThrow).toHaveBeenNthCalledWith(2, 'JSON_WEB_TOKEN_EXPIRES_IN');
      expect(getOrThrow).toHaveBeenNthCalledWith(3, 'DATABASE_TYPE');
      expect(getOrThrow).toHaveBeenNthCalledWith(4, 'DATABASE_SCHEME');
      expect(getOrThrow).toHaveBeenNthCalledWith(5, 'DATABASE_USERNAME');
      expect(getOrThrow).toHaveBeenNthCalledWith(6, 'DATABASE_PASSWORD');
      expect(getOrThrow).toHaveBeenNthCalledWith(7, 'DATABASE_HOST');
      expect(getOrThrow).toHaveBeenNthCalledWith(8, 'DATABASE_PORT');
      expect(getOrThrow).toHaveBeenNthCalledWith(9, 'DATABASE_NAME');
      expect(getOrThrow).toHaveBeenNthCalledWith(10, 'JSON_WEB_TOKEN_SECRET');
      expect(query).toHaveBeenCalledTimes(8 + (migrationEntries.length * 2));
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT pg_advisory_lock(hashtext($1))', [
        'migration_lock'
      ]);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT * FROM current_schema()');
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT * FROM "information_schema"."tables" WHERE "table_schema" = \'public\' AND "table_name" = \'migrations\'');
      expect(query).toHaveBeenNthCalledWith(4, 'CREATE TABLE "migrations" ("id" SERIAL NOT NULL, "timestamp" bigint NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY ("id"))', undefined);
      expect(query).toHaveBeenNthCalledWith(5, 'SELECT * FROM "migrations" "migrations" ORDER BY "id" DESC', [], true);
      expect(query).toHaveBeenNthCalledWith(6, 'START TRANSACTION');
      migrationEntries.forEach((migrationEntry: [string, Type<BaseMigration>], index: number): void => {
        const [migrationName, MigrationClass] = migrationEntry;

        const migration = new MigrationClass();

        expect(query).toHaveBeenNthCalledWith(7 + (index * 2), migration.UP_SCRIPT);
        expect(query).toHaveBeenNthCalledWith(8 + (index * 2), 'INSERT INTO "migrations"("timestamp", "name") VALUES ($1, $2)', [
          index + 1,
          migrationName
        ], true);
      });
      expect(query).toHaveBeenNthCalledWith(7 + (migrationEntries.length * 2), 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(8 + (migrationEntries.length * 2), 'SELECT pg_advisory_unlock(hashtext($1))', [
        'migration_lock'
      ]);
      expect(queryRunnerConnect).toHaveBeenCalledTimes(1);
      expect(queryRunnerConnect).toHaveBeenNthCalledWith(1);
    });
  });

  describe('when no migrations are run', (): void => {
    it('does nothing when every migration has already been applied', async (): Promise<void> => {
      afterConnect.mockResolvedValueOnce();
      disconnect.mockResolvedValueOnce();
      driverConnect.mockResolvedValueOnce();
      getOrThrow.mockReturnValueOnce('test secret');
      getOrThrow.mockReturnValueOnce('5');
      getOrThrow.mockReturnValueOnce('postgres');
      getOrThrow.mockReturnValueOnce('database_scheme');
      getOrThrow.mockReturnValueOnce('database_username');
      getOrThrow.mockReturnValueOnce('database_password');
      getOrThrow.mockReturnValueOnce('database_host');
      getOrThrow.mockReturnValueOnce(5432);
      getOrThrow.mockReturnValueOnce('database_name');
      getOrThrow.mockReturnValueOnce('test secret');
      query.mockResolvedValueOnce([]);
      query.mockResolvedValueOnce([
        {
          current_schema: 'public'
        }
      ]);
      query.mockResolvedValueOnce([
        {
          table_catalog: 'postgres',
          table_schema: 'public',
          table_name: 'migrations',
          table_type: 'BASE TABLE',
          self_referencing_column_name: '',
          reference_generation: '',
          user_defined_type_catalog: '',
          user_defined_type_schema: '',
          user_defined_type_name: '',
          is_insertable_into: 'YES',
          is_typed: 'NO',
          commit_action: ''
        }
      ]);
      query.mockResolvedValueOnce(buildQueryResult(migrationEntries.map((migrationEntry: [string, Type<BaseMigration>], index: number): Record<string, unknown> => {
        const [migrationName] = migrationEntry;

        return {
          id: index + 1,
          timestamp: index + 1,
          name: migrationName
        };
      })));
      query.mockResolvedValueOnce([]);
      queryRunnerConnect.mockResolvedValueOnce(undefined);

      const app = await createTestApp();

      await app.close();

      expect(afterConnect).toHaveBeenCalledTimes(1);
      expect(afterConnect).toHaveBeenNthCalledWith(1);
      expect(disconnect).toHaveBeenCalledTimes(1);
      expect(disconnect).toHaveBeenNthCalledWith(1);
      expect(driverConnect).toHaveBeenCalledTimes(1);
      expect(driverConnect).toHaveBeenNthCalledWith(1);
      expect(getOrThrow).toHaveBeenCalledTimes(10);
      expect(getOrThrow).toHaveBeenNthCalledWith(1, 'JSON_WEB_TOKEN_SECRET');
      expect(getOrThrow).toHaveBeenNthCalledWith(2, 'JSON_WEB_TOKEN_EXPIRES_IN');
      expect(getOrThrow).toHaveBeenNthCalledWith(3, 'DATABASE_TYPE');
      expect(getOrThrow).toHaveBeenNthCalledWith(4, 'DATABASE_SCHEME');
      expect(getOrThrow).toHaveBeenNthCalledWith(5, 'DATABASE_USERNAME');
      expect(getOrThrow).toHaveBeenNthCalledWith(6, 'DATABASE_PASSWORD');
      expect(getOrThrow).toHaveBeenNthCalledWith(7, 'DATABASE_HOST');
      expect(getOrThrow).toHaveBeenNthCalledWith(8, 'DATABASE_PORT');
      expect(getOrThrow).toHaveBeenNthCalledWith(9, 'DATABASE_NAME');
      expect(getOrThrow).toHaveBeenNthCalledWith(10, 'JSON_WEB_TOKEN_SECRET');
      expect(query).toHaveBeenCalledTimes(5);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT pg_advisory_lock(hashtext($1))', [
        'migration_lock'
      ]);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT * FROM current_schema()');
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT * FROM "information_schema"."tables" WHERE "table_schema" = \'public\' AND "table_name" = \'migrations\'');
      expect(query).toHaveBeenNthCalledWith(4, 'SELECT * FROM "migrations" "migrations" ORDER BY "id" DESC', [], true);
      expect(query).toHaveBeenNthCalledWith(5, 'SELECT pg_advisory_unlock(hashtext($1))', [
        'migration_lock'
      ]);
      expect(queryRunnerConnect).toHaveBeenCalledTimes(1);
      expect(queryRunnerConnect).toHaveBeenNthCalledWith(1);
    });
  });

  describe('when preparing to run migrations', (): void => {
    it('reports failure when checking for the migrations table fails', async (): Promise<void> => {
      afterConnect.mockResolvedValueOnce();
      driverConnect.mockResolvedValueOnce();
      getOrThrow.mockReturnValueOnce('test secret');
      getOrThrow.mockReturnValueOnce('5');
      getOrThrow.mockReturnValueOnce('postgres');
      getOrThrow.mockReturnValueOnce('database_scheme');
      getOrThrow.mockReturnValueOnce('database_username');
      getOrThrow.mockReturnValueOnce('database_password');
      getOrThrow.mockReturnValueOnce('database_host');
      getOrThrow.mockReturnValueOnce(5432);
      getOrThrow.mockReturnValueOnce('database_name');
      getOrThrow.mockReturnValueOnce('test secret');
      query.mockResolvedValueOnce([]);
      query.mockResolvedValueOnce([
        {
          current_schema: 'public'
        }
      ]);
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce([]);
      queryRunnerConnect.mockResolvedValueOnce(undefined);

      await expect(createTestApp()).rejects.toThrow('Running migrations failed');

      expect(afterConnect).toHaveBeenCalledTimes(1);
      expect(afterConnect).toHaveBeenNthCalledWith(1);
      expect(disconnect).toHaveBeenCalledTimes(0);
      expect(driverConnect).toHaveBeenCalledTimes(1);
      expect(driverConnect).toHaveBeenNthCalledWith(1);
      expect(getOrThrow).toHaveBeenCalledTimes(10);
      expect(getOrThrow).toHaveBeenNthCalledWith(1, 'JSON_WEB_TOKEN_SECRET');
      expect(getOrThrow).toHaveBeenNthCalledWith(2, 'JSON_WEB_TOKEN_EXPIRES_IN');
      expect(getOrThrow).toHaveBeenNthCalledWith(3, 'DATABASE_TYPE');
      expect(getOrThrow).toHaveBeenNthCalledWith(4, 'DATABASE_SCHEME');
      expect(getOrThrow).toHaveBeenNthCalledWith(5, 'DATABASE_USERNAME');
      expect(getOrThrow).toHaveBeenNthCalledWith(6, 'DATABASE_PASSWORD');
      expect(getOrThrow).toHaveBeenNthCalledWith(7, 'DATABASE_HOST');
      expect(getOrThrow).toHaveBeenNthCalledWith(8, 'DATABASE_PORT');
      expect(getOrThrow).toHaveBeenNthCalledWith(9, 'DATABASE_NAME');
      expect(getOrThrow).toHaveBeenNthCalledWith(10, 'JSON_WEB_TOKEN_SECRET');
      expect(query).toHaveBeenCalledTimes(4);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT pg_advisory_lock(hashtext($1))', [
        'migration_lock'
      ]);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT * FROM current_schema()');
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT * FROM "information_schema"."tables" WHERE "table_schema" = \'public\' AND "table_name" = \'migrations\'');
      expect(query).toHaveBeenNthCalledWith(4, 'SELECT pg_advisory_unlock(hashtext($1))', [
        'migration_lock'
      ]);
      expect(queryRunnerConnect).toHaveBeenCalledTimes(1);
      expect(queryRunnerConnect).toHaveBeenNthCalledWith(1);
    });
  });

  afterAll((): void => {
    jest.restoreAllMocks();
  });
});
