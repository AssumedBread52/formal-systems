import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import migrations from '@/migration/migrations';
import { BaseMigration } from '@/migration/migrations/base.migration';
import { Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';
import { PostgresQueryRunner } from 'typeorm/driver/postgres/PostgresQueryRunner';

describe('Revert migrations', (): void => {
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

  describe('when migrations succeed', (): void => {
    it.each(Object.entries(migrations))('reverts the %s migration', async (name: string, MigrationClass: Type<BaseMigration>): Promise<void> => {
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
      query.mockResolvedValueOnce(buildQueryResult([
        {
          id: 1,
          timestamp: 1,
          name: 'AddUsersTable0000000000001'
        },
        {
          id: 2,
          timestamp: 2,
          name: 'AddSystemsTable0000000000002'
        },
        {
          id: 3,
          timestamp: 3,
          name: 'AddSymbolType0000000000003'
        },
        {
          id: 4,
          timestamp: 4,
          name: 'AddSymbolsTable0000000000004'
        },
        {
          id: 5,
          timestamp: 5,
          name: 'AddExpressionsTable0000000000005'
        },
        {
          id: 6,
          timestamp: 6,
          name: 'AddExpressionTokensTable0000000000006'
        },
        {
          id: 7,
          timestamp: 7,
          name: 'AddStatementsTable0000000000007'
        },
        {
          id: 8,
          timestamp: 8,
          name: 'AddHypothesisType0000000000008'
        },
        {
          id: 9,
          timestamp: 9,
          name: 'AddStatementHypothesesTable0000000000009'
        },
        {
          id: 10,
          timestamp: 10,
          name: 'AddStatementDistinctVariablePairsTable0000000000010'
        },
        {
          id: 11,
          timestamp: 11,
          name: 'AddProofsTable0000000000011'
        },
        {
          id: 12,
          timestamp: 12,
          name: 'AddProofStepsTable0000000000012'
        },
        {
          id: 13,
          timestamp: 13,
          name: 'AddProofStepSubstitutionsTable0000000000013'
        },
        {
          id: 14,
          timestamp: 14,
          name: 'AddProofStepReferencesTable0000000000014'
        }
      ]));
      query.mockResolvedValueOnce([]);
      query.mockResolvedValueOnce([]);
      queryRunnerConnect.mockResolvedValueOnce(undefined);

      const app = await createTestApp();

      const queryRunner = app.get(DataSource).createQueryRunner();

      const migration = new MigrationClass();

      await migration.down(queryRunner);

      await app.close();

      expect(name).toBe(MigrationClass.name);
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
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT pg_advisory_lock(hashtext($1))', [
        'migration_lock'
      ]);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT * FROM current_schema()');
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT * FROM "information_schema"."tables" WHERE "table_schema" = \'public\' AND "table_name" = \'migrations\'');
      expect(query).toHaveBeenNthCalledWith(4, 'SELECT * FROM "migrations" "migrations" ORDER BY "id" DESC', [], true);
      expect(query).toHaveBeenNthCalledWith(5, 'SELECT pg_advisory_unlock(hashtext($1))', [
        'migration_lock'
      ]);
      expect(query).toHaveBeenNthCalledWith(6, migration.DOWN_SCRIPT);
      expect(queryRunnerConnect).toHaveBeenCalledTimes(1);
      expect(queryRunnerConnect).toHaveBeenNthCalledWith(1);
    });
  });

  describe('when migrations fail', (): void => {
    it.each(Object.entries(migrations))('reports failure when reverting the %s migration fails', async (name: string, MigrationClass: Type<BaseMigration>): Promise<void> => {
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
      query.mockResolvedValueOnce(buildQueryResult([
        {
          id: 1,
          timestamp: 1,
          name: 'AddUsersTable0000000000001'
        },
        {
          id: 2,
          timestamp: 2,
          name: 'AddSystemsTable0000000000002'
        },
        {
          id: 3,
          timestamp: 3,
          name: 'AddSymbolType0000000000003'
        },
        {
          id: 4,
          timestamp: 4,
          name: 'AddSymbolsTable0000000000004'
        },
        {
          id: 5,
          timestamp: 5,
          name: 'AddExpressionsTable0000000000005'
        },
        {
          id: 6,
          timestamp: 6,
          name: 'AddExpressionTokensTable0000000000006'
        },
        {
          id: 7,
          timestamp: 7,
          name: 'AddStatementsTable0000000000007'
        },
        {
          id: 8,
          timestamp: 8,
          name: 'AddHypothesisType0000000000008'
        },
        {
          id: 9,
          timestamp: 9,
          name: 'AddStatementHypothesesTable0000000000009'
        },
        {
          id: 10,
          timestamp: 10,
          name: 'AddStatementDistinctVariablePairsTable0000000000010'
        },
        {
          id: 11,
          timestamp: 11,
          name: 'AddProofsTable0000000000011'
        },
        {
          id: 12,
          timestamp: 12,
          name: 'AddProofStepsTable0000000000012'
        },
        {
          id: 13,
          timestamp: 13,
          name: 'AddProofStepSubstitutionsTable0000000000013'
        },
        {
          id: 14,
          timestamp: 14,
          name: 'AddProofStepReferencesTable0000000000014'
        }
      ]));
      query.mockResolvedValueOnce([]);
      query.mockRejectedValueOnce(new Error());
      queryRunnerConnect.mockResolvedValueOnce(undefined);

      const app = await createTestApp();

      const queryRunner = app.get(DataSource).createQueryRunner();

      const migration = new MigrationClass();

      await expect(migration.down(queryRunner)).rejects.toStrictEqual(new Error());

      await app.close();

      expect(name).toBe(MigrationClass.name);
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
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT pg_advisory_lock(hashtext($1))', [
        'migration_lock'
      ]);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT * FROM current_schema()');
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT * FROM "information_schema"."tables" WHERE "table_schema" = \'public\' AND "table_name" = \'migrations\'');
      expect(query).toHaveBeenNthCalledWith(4, 'SELECT * FROM "migrations" "migrations" ORDER BY "id" DESC', [], true);
      expect(query).toHaveBeenNthCalledWith(5, 'SELECT pg_advisory_unlock(hashtext($1))', [
        'migration_lock'
      ]);
      expect(query).toHaveBeenNthCalledWith(6, migration.DOWN_SCRIPT);
      expect(queryRunnerConnect).toHaveBeenCalledTimes(1);
      expect(queryRunnerConnect).toHaveBeenNthCalledWith(1);
    });
  });

  afterAll((): void => {
    jest.restoreAllMocks();
  });
});
