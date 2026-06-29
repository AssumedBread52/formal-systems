import { BaseMigration } from './base.migration';

export class AddProofStepReferencesTable0000000000014 extends BaseMigration {
  public readonly UP_SCRIPT = `
    CREATE TABLE proof_step_references (
      system_id                 UUID  NOT NULL,
      proof_id                  UUID  NOT NULL,
      theorem_statement_id      UUID  NOT NULL,
      proof_step_id             UUID  NOT NULL,
      applied_statement_id      UUID  NOT NULL,
      applied_hypothesis_id     UUID  NOT NULL,
      referenced_step_id        UUID  NULL,
      referenced_hypothesis_id  UUID  NULL,

      CONSTRAINT proof_step_references_primary_key                        PRIMARY KEY (proof_step_id, applied_hypothesis_id),
      CONSTRAINT proof_step_references_system_foreign_key                 FOREIGN KEY (system_id) REFERENCES systems(id),
      CONSTRAINT proof_step_references_proof_foreign_key                  FOREIGN KEY (system_id, proof_id, theorem_statement_id) REFERENCES proofs(system_id, id, theorem_statement_id),
      CONSTRAINT proof_step_references_proof_step_foreign_key             FOREIGN KEY (system_id, proof_id, proof_step_id, applied_statement_id) REFERENCES proof_steps(system_id, proof_id, id, applied_statement_id),
      CONSTRAINT proof_step_references_applied_hypothesis_foreign_key     FOREIGN KEY (system_id, applied_statement_id, applied_hypothesis_id) REFERENCES statement_hypotheses(system_id, statement_id, id),
      CONSTRAINT proof_step_references_referenced_step_foreign_key        FOREIGN KEY (system_id, proof_id, referenced_step_id) REFERENCES proof_steps(system_id, proof_id, id),
      CONSTRAINT proof_step_references_referenced_hypothesis_foreign_key  FOREIGN KEY (system_id, theorem_statement_id, referenced_hypothesis_id) REFERENCES statement_hypotheses(system_id, statement_id, id),
      CONSTRAINT proof_step_references_exactly_one_referenced             CHECK((referenced_step_id IS NULL) <> (referenced_hypothesis_id IS NULL))
    );
  `;

  public readonly DOWN_SCRIPT = 'DROP TABLE proof_step_references;';
};
