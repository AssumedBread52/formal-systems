import { BaseMigration } from './base.migration';

export class AddSymbolType0000000000003 extends BaseMigration {
  public readonly UP_SCRIPT = `
    CREATE TYPE symbol_type AS ENUM ('constant', 'variable');
  `;

  public readonly DOWN_SCRIPT = 'DROP TYPE symbol_type;';
};
