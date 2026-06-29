import { BaseMigration } from './base.migration';

export class AddHypothesisType0000000000008 extends BaseMigration {
  public readonly UP_SCRIPT = `
    CREATE TYPE hypothesis_type AS ENUM ('type', 'logic');
  `;

  public readonly DOWN_SCRIPT = 'DROP TYPE hypothesis_type;';
};
