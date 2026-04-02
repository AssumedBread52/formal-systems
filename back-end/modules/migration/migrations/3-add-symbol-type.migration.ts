import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSymbolType0000000000003 implements MigrationInterface {
  public up(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query(`
      CREATE TYPE symbol_type as enum ('constant', 'variable');
    `);
  }

  public down(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query('DROP TYPE symbol_type;');
  }
};
