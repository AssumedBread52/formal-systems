import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class RunnerService implements OnApplicationBootstrap {
  private static readonly ENGAGE_LOCK = 'SELECT pg_advisory_lock(hashtext($1))';
  private static readonly RELEASE_LOCK = 'SELECT pg_advisory_unlock(hashtext($1))';
  private static readonly LOCK_KEY = 'migration_lock';

  public constructor(@InjectDataSource() private readonly dataSource: DataSource) {
  }

  public async onApplicationBootstrap(): Promise<void> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();

      await queryRunner.connect();

      try {
        await queryRunner.query(RunnerService.ENGAGE_LOCK, [
          RunnerService.LOCK_KEY
        ]);

        try {
          await this.dataSource.runMigrations();
        } catch (error: unknown) {
          throw error;
        } finally {
          await queryRunner.query(RunnerService.RELEASE_LOCK, [
            RunnerService.LOCK_KEY
          ]);
        }
      } catch (error: unknown) {
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error: unknown) {
      throw new Error('Running migrations failed', {
        cause: error
      });
    }
  }
};
