import { BaseMigration } from './base.migration';

export class AddProofStepSubstitutionsTable0000000000013 extends BaseMigration {
  public readonly UP_SCRIPT = `
    CREATE TABLE proof_step_substitutions (
      system_id                       UUID  NOT NULL,
      proof_step_id                   UUID  NOT NULL,
      substituend_variable_symbol_id  UUID  NOT NULL,
      substituent_expression_id       UUID  NOT NULL,

      CONSTRAINT proof_step_substitutions_primary_key                             PRIMARY KEY (proof_step_id, substituend_variable_symbol_id),
      CONSTRAINT proof_step_substitutions_system_foreign_key                      FOREIGN KEY (system_id) REFERENCES systems(id),
      CONSTRAINT proof_step_substitutions_proof_step_foreign_key                  FOREIGN KEY (system_id, proof_step_id) REFERENCES proof_steps(system_id, id),
      CONSTRAINT proof_step_substitutions_substituend_variable_symbol_foreign_key FOREIGN KEY (system_id, substituend_variable_symbol_id) REFERENCES symbols(system_id, id),
      CONSTRAINT proof_step_substitutions_substituent_expression_foreign_key      FOREIGN KEY (system_id, substituent_expression_id) REFERENCES expressions(system_id, id)
    );
  `;

  public readonly DOWN_SCRIPT = 'DROP TABLE proof_step_substitutions;';
};
