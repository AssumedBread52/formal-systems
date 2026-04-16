import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProofStepSubstitutionsTable0000000000013 implements MigrationInterface {
  public up(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query(`
      CREATE TABLE proof_step_substitutions (
        system_id                       UUID  NOT NULL,
        proof_id                        UUID  NOT NULL,
        step_position                   INTEGER NOT NULL,
        substituend_variable_symbol_id  UUID  NOT NULL,
        substituent_expression_id       UUID  NOT NULL,

        CONSTRAINT proof_step_substitutions_primary_key                             PRIMARY KEY (proof_id, step_position, substituend_variable_symbol_id),
        CONSTRAINT proof_step_substitutions_system_foreign_key                      FOREIGN KEY (system_id) REFERENCES systems(id),
        CONSTRAINT proof_step_substitutions_proof_foreign_key                       FOREIGN KEY (system_id, proof_id) REFERENCES proofs(system_id, id),
        CONSTRAINT proof_step_substitutions_proof_step_foreign_key                  FOREIGN KEY (system_id, proof_id, step_position) REFERENCES proof_steps(system_id, proof_id, position),
        CONSTRAINT proof_step_substitutions_substituend_variable_symbol_foreign_key FOREIGN KEY (system_id, substituend_variable_symbol_id) REFERENCES symbols(system_id, id),
        CONSTRAINT proof_step_substitutions_substituent_expression_foreign_key      FOREIGN KEY (system_id, substituent_expression_id) REFERENCES expressions(system_id, id)
      );
    `);
  }

  public down(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query('DROP TABLE proof_step_substitutions;');
  }
};
