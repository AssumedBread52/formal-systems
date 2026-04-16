import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProofsTable0000000000011 implements MigrationInterface {
  public up(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query(`
      CREATE TABLE proofs (
        id                    UUID          NOT NULL  DEFAULT gen_random_uuid(),
        system_id             UUID          NOT NULL,
        theorem_statement_id  UUID          NOT NULL,
        name                  VARCHAR(200)  NOT NULL,
        description           VARCHAR(5000) NOT NULL,

        CONSTRAINT proofs_primary_key                     PRIMARY KEY (id),
        CONSTRAINT proofs_system_foreign_key              FOREIGN KEY (system_id) REFERENCES systems(id),
        CONSTRAINT proofs_theorem_statements_foreign_key  FOREIGN KEY (system_id, theorem_statement_id) REFERENCES statements(system_id, id),
        CONSTRAINT proofs_name_nonempty                   CHECK(LENGTH(name) > 0),
        CONSTRAINT proofs_description_nonempty            CHECK(LENGTH(description) > 0),
        CONSTRAINT proofs_theorem_statement_name_unique   UNIQUE(theorem_statement_id, name),
        CONSTRAINT proofs_id_system_unique                UNIQUE(system_id, id)
      );
    `);
  }

  public down(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query('DROP TABLE proofs;');
  }
};
