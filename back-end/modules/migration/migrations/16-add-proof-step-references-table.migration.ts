import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProofStepReferencesTable0000000000016 implements MigrationInterface {
  public up(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query(`
      CREATE TABLE proof_step_references (
        system_id           UUID              NOT NULL,
        proof_id            UUID              NOT NULL,
        step_position       INTEGER           NOT NULL,
        hypothesis_type     hypothesis_type   NOT NULL,
        hypothesis_position INTEGER           NOT NULL,
        reference_source    reference_source  NOT NULL,
        referenced_position INTEGER           NOT NULL,

        CONSTRAINT proof_step_references_primary_key                      PRIMARY KEY (proof_id, step_position, hypothesis_type, hypothesis_position),
        CONSTRAINT proof_step_references_system_foreign_key               FOREIGN KEY (system_id) REFERENCES systems(id),
        CONSTRAINT proof_step_references_proof_foreign_key                FOREIGN KEY (system_id, proof_id) REFERENCES proofs(system_id, id),
        CONSTRAINT proof_step_references_proof_step_foreign_key           FOREIGN KEY (system_id, proof_id, step_position) REFERENCES proof_steps(system_id, proof_id, position),
        CONSTRAINT proof_step_references_hypothesis_position_nonnegative  CHECK(hypothesis_position >= 0),
        CONSTRAINT proof_step_references_referenced_position_nonnegative  CHECK(referenced_position >= 0),
        CONSTRAINT proof_step_references_step_order_check                 CHECK(reference_source <> 'step' or referenced_position < step_position)
      );
    `);
  }

  public down(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query('DROP TABLE proof_step_references;');
  }
};
