import { BaseMigration } from './base.migration';

export class AddExpressionsTable0000000000005 extends BaseMigration {
  public readonly UP_SCRIPT = `
    CREATE TABLE expressions (
      id        UUID    NOT NULL  DEFAULT gen_random_uuid(),
      system_id UUID    NOT NULL,
      canonical UUID[]  NOT NULL,

      CONSTRAINT expressions_primary_key                PRIMARY KEY (id),
      CONSTRAINT expressions_system_foreign_key         FOREIGN KEY (system_id) REFERENCES systems(id),
      CONSTRAINT expressions_system_id_id_unique        UNIQUE(system_id, id),
      CONSTRAINT expressions_system_id_canonical_unique UNIQUE(system_id, canonical)
    );
  `;

  public readonly DOWN_SCRIPT = 'DROP TABLE expressions;';
};
