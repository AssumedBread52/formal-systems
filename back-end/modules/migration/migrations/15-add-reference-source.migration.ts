import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReferenceSource0000000000015 implements MigrationInterface {
  public up(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query(`
      CREATE TYPE reference_source AS ENUM ('step', 'type', 'logic');
    `);
  }

  public down(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query('DROP TYPE reference_source;');
  }
};
