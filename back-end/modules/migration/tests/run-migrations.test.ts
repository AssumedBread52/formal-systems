import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import migrations from '@/migration/migrations';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource, MigrationInterface } from 'typeorm';
import { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';
import { PostgresQueryRunner } from 'typeorm/driver/postgres/PostgresQueryRunner';

const ENGAGE_LOCK = 'SELECT pg_advisory_lock(hashtext($1))';
const RELEASE_LOCK = 'SELECT pg_advisory_unlock(hashtext($1))';
const MIGRATION_NAMES = Object.values(migrations).map((migration): string => migration.name);

describe('Run Migrations', (): void => {
  const config: Record<string, unknown> = {
    JSON_WEB_TOKEN_SECRET: 'test secret',
    JSON_WEB_TOKEN_EXPIRES_IN: '5',
    DATABASE_TYPE: 'postgres',
    DATABASE_SCHEME: 'database_scheme',
    DATABASE_USERNAME: 'database_username',
    DATABASE_PASSWORD: 'database_password',
    DATABASE_HOST: 'database_host',
    DATABASE_PORT: 5432,
    DATABASE_NAME: 'database_name'
  };

  const afterConnect = jest.spyOn(PostgresDriver.prototype, 'afterConnect');
  const disconnect = jest.spyOn(PostgresDriver.prototype, 'disconnect');
  const driverConnect = jest.spyOn(PostgresDriver.prototype, 'connect');
  const getOrThrow = jest.spyOn(ConfigService.prototype, 'getOrThrow');
  const query = jest.spyOn(PostgresQueryRunner.prototype, 'query');
  const queryRunnerConnect = jest.spyOn(PostgresQueryRunner.prototype, 'connect');
  let app: NestExpressApplication | undefined;

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
    return MIGRATION_NAMES.map((name: string, index: number): Record<string, unknown> => {
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

  beforeAll((): void => {
    getOrThrow.mockImplementation((key: never): unknown => config[key]);
    afterConnect.mockResolvedValue();
    disconnect.mockResolvedValue();
    driverConnect.mockResolvedValue();
    queryRunnerConnect.mockResolvedValue(undefined);
  });

  beforeEach((): void => {
    query.mockClear();
  });

  it('runs every pending migration inside an advisory lock when none have run', async (): Promise<void> => {
    installQuery([]);

    app = await createTestApp();

    await app.close();

    expect(query.mock.calls.at(0)).toStrictEqual([ENGAGE_LOCK, ['migration_lock']]);
    expect(query.mock.calls.at(-1)).toStrictEqual([RELEASE_LOCK, ['migration_lock']]);
    expect(statements()).toContain('START TRANSACTION');
    expect(statements()).toContain('COMMIT');
    expect(insertedMigrationNames()).toStrictEqual(MIGRATION_NAMES);
  });

  it('runs no migrations when all have already run', async (): Promise<void> => {
    installQuery(executedRecords());

    app = await createTestApp();

    await app.close();

    expect(query.mock.calls.at(0)).toStrictEqual([ENGAGE_LOCK, ['migration_lock']]);
    expect(query.mock.calls.at(-1)).toStrictEqual([RELEASE_LOCK, ['migration_lock']]);
    expect(statements()).not.toContain('START TRANSACTION');
    expect(statements()).not.toContain('COMMIT');
    expect(insertedMigrationNames()).toStrictEqual([]);
  });

  it('releases the advisory lock and fails to boot when running the migrations fails', async (): Promise<void> => {
    installQuery([], true);

    await expect(createTestApp()).rejects.toThrow('Running migrations failed');

    expect(query.mock.calls.at(0)).toStrictEqual([ENGAGE_LOCK, ['migration_lock']]);
    expect(query.mock.calls.at(-1)).toStrictEqual([RELEASE_LOCK, ['migration_lock']]);
    expect(insertedMigrationNames()).toStrictEqual([]);
  });

  describe('reverting the migrations', (): void => {
    const migrationEntries: ReadonlyArray<[string, new () => MigrationInterface]> = Object.entries(migrations);

    it.each(migrationEntries)('drops the schema changes made by %s', async (_name: string, MigrationClass: new () => MigrationInterface): Promise<void> => {
      installQuery(executedRecords());

      app = await createTestApp();

      const queryRunner = app.get(DataSource).createQueryRunner();

      query.mockClear();

      await new MigrationClass().down(queryRunner);

      await app.close();

      expect(query).toHaveBeenCalledTimes(1);
      expect(query.mock.calls[0]?.[0]).toMatch(/^DROP /);
    });
  });

  afterAll((): void => {
    jest.restoreAllMocks();
  });
});
