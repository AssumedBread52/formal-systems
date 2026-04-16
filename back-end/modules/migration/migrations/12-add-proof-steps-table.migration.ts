import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProofStepsTable0000000000012 implements MigrationInterface {
  public up(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query(`
      CREATE TABLE proof_steps (
        system_id             UUID    NOT NULL,
        proof_id              UUID    NOT NULL,
        applied_statement_id  UUID    NOT NULL,
        derived_expression_id UUID    NOT NULL,
        position              INTEGER NOT NULL,

        CONSTRAINT proof_steps_primary_key                    PRIMARY KEY (proof_id, position),
        CONSTRAINT proof_steps_system_foreign_key             FOREIGN KEY (system_id) REFERENCES systems(id),
        CONSTRAINT proof_steps_proof_foreign_key              FOREIGN KEY (system_id, proof_id) REFERENCES proofs(system_id, id),
        CONSTRAINT proof_steps_applied_statement_foreign_key  FOREIGN KEY (system_id, applied_statement_id) REFERENCES statements(system_id, id),
        CONSTRAINT proof_steps_derived_expression_foreign_key FOREIGN KEY (system_id, derived_expression_id) REFERENCES expressions(system_id, id),
        CONSTRAINT proof_steps_position_nonnegative           CHECK(position >= 0),
        CONSTRAINT proof_steps_system_proof_position_unique   UNIQUE(system_id, proof_id, position)
      );
    `);
  }

  public down(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query('DROP TABLE proof_steps;');
  }
};
