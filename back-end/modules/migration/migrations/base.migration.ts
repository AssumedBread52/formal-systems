import { MigrationInterface, QueryRunner } from 'typeorm';

export abstract class BaseMigration implements MigrationInterface {
  public abstract readonly UP_SCRIPT: string;
  public abstract readonly DOWN_SCRIPT: string;

  public up(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query(this.UP_SCRIPT);
  }

  public down(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query(this.DOWN_SCRIPT);
  }
};
