import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import migrations from '@/migration/migrations';
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

  beforeEach((): void => {
    afterConnect.mockClear();
    disconnect.mockClear();
    driverConnect.mockClear();
    getOrThrow.mockClear();
    query.mockClear();
    queryRunnerConnect.mockClear();
  });

  // The migration runner boots per test and issues a variable number of queries (one CREATE + one
  // INSERT per pending migration), so the executed-migrations response is steered with a
  // SQL-keyed implementation rather than the usual ordered queue.
  const installQuery = (executedMigrations: Record<string, unknown>[], failOnLoad: boolean = false): void => {
    query.mockImplementation(async (sql: string, _parameters?: unknown[], useStructuredResult?: boolean): Promise<unknown> => {
      if (sql.includes('current_schema')) {
        return [
          {
            current_schema: 'public'
          }
        ];
      }

      if (sql.includes('FROM "migrations"')) {
        if (failOnLoad) {
          throw new Error('Loading executed migrations failed');
        }

        return useStructuredResult ? buildQueryResult(executedMigrations) : executedMigrations;
      }

      if (sql.includes('INSERT INTO "migrations"')) {
        return useStructuredResult ? buildQueryResult([{ id: 1 }]) : [{ id: 1 }];
      }

      return useStructuredResult ? buildQueryResult([]) : [];
    });
  };

  const executedRecords = (): Record<string, unknown>[] => {
    return Object.values(migrations).map((migration): string => migration.name).map((name: string, index: number): Record<string, unknown> => {
      return {
        id: index + 1,
        timestamp: index + 1,
        name
      };
    });
  };

  const statements = (): string[] => {
    return query.mock.calls.map((call): string => call[0]);
  };

  const insertedMigrationNames = (): unknown[] => {
    return query.mock.calls
      .filter((call): boolean => call[0].includes('INSERT INTO "migrations"'))
      .map((call): unknown => call[1]?.[1]);
  };

  describe('when running pending migrations', (): void => {
    it('runs every pending migration inside an advisory lock when none have run', async (): Promise<void> => {
      afterConnect.mockResolvedValueOnce();
      disconnect.mockResolvedValueOnce();
      driverConnect.mockResolvedValue();
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
      installQuery([]);
      queryRunnerConnect.mockResolvedValue(undefined);

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
      expect(query).toHaveBeenCalledTimes(36);
      expect(query.mock.calls.at(0)).toStrictEqual(['SELECT pg_advisory_lock(hashtext($1))', [
        'migration_lock'
      ]]);
      expect(query.mock.calls.at(-1)).toStrictEqual(['SELECT pg_advisory_unlock(hashtext($1))', [
        'migration_lock'
      ]]);
      expect(statements()).toContain('START TRANSACTION');
      expect(statements()).toContain('COMMIT');
      expect(insertedMigrationNames()).toStrictEqual(Object.values(migrations).map((migration): string => migration.name));
      expect(queryRunnerConnect).toHaveBeenCalledTimes(1);
      expect(queryRunnerConnect).toHaveBeenNthCalledWith(1);
    });
  });

  describe('when no migrations are run', (): void => {
    it('runs no migrations when all have already run', async (): Promise<void> => {
      afterConnect.mockResolvedValueOnce();
      disconnect.mockResolvedValueOnce();
      driverConnect.mockResolvedValue();
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
      installQuery(executedRecords());
      queryRunnerConnect.mockResolvedValue(undefined);

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
      expect(query).toHaveBeenCalledTimes(6);
      expect(query.mock.calls.at(0)).toStrictEqual(['SELECT pg_advisory_lock(hashtext($1))', [
        'migration_lock'
      ]]);
      expect(query.mock.calls.at(-1)).toStrictEqual(['SELECT pg_advisory_unlock(hashtext($1))', [
        'migration_lock'
      ]]);
      expect(statements()).not.toContain('START TRANSACTION');
      expect(statements()).not.toContain('COMMIT');
      expect(insertedMigrationNames()).toStrictEqual([]);
      expect(queryRunnerConnect).toHaveBeenCalledTimes(1);
      expect(queryRunnerConnect).toHaveBeenNthCalledWith(1);
    });
  });

  describe('when preparing to run migrations', (): void => {
    it('releases the advisory lock and fails to boot when running the migrations fails', async (): Promise<void> => {
      afterConnect.mockResolvedValueOnce();
      driverConnect.mockResolvedValue();
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
      installQuery([], true);
      queryRunnerConnect.mockResolvedValue(undefined);

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
      expect(query).toHaveBeenCalledTimes(6);
      expect(query.mock.calls.at(0)).toStrictEqual(['SELECT pg_advisory_lock(hashtext($1))', [
        'migration_lock'
      ]]);
      expect(query.mock.calls.at(-1)).toStrictEqual(['SELECT pg_advisory_unlock(hashtext($1))', [
        'migration_lock'
      ]]);
      expect(insertedMigrationNames()).toStrictEqual([]);
      expect(queryRunnerConnect).toHaveBeenCalledTimes(1);
      expect(queryRunnerConnect).toHaveBeenNthCalledWith(1);
    });
  });

  afterAll((): void => {
    jest.restoreAllMocks();
  });
});
