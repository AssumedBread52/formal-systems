import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExpressionsTable0000000000005 implements MigrationInterface {
  public up(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query(`
      CREATE TABLE expressions (
        id        UUID    NOT NULL  DEFAULT gen_random_uuid(),
        system_id UUID    NOT NULL,
        canonical UUID[]  NOT NULL,

        CONSTRAINT expressions_primary_key              PRIMARY KEY (id),
        CONSTRAINT expressions_system_foreign_key       FOREIGN KEY (system_id) REFERENCES systems(id),
        CONSTRAINT expressions_id_system_unique         UNIQUE(system_id, id),
        CONSTRAINT expressions_system_canonical_unique  UNIQUE(system_id, canonical)
      );
    `);
  }

  public down(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query('DROP TABLE expressions;');
  }
};
