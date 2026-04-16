import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHypothesisType0000000000014 implements MigrationInterface {
  public up(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query(`
      CREATE TYPE hypothesis_type AS ENUM ('type', 'logic');
    `);
  }

  public down(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query('DROP TYPE hypothesis_type;');
  }
};
