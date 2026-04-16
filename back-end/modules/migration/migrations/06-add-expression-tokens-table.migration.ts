import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExpressionTokensTable0000000000006 implements MigrationInterface {
  public up(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query(`
      CREATE TABLE expression_tokens (
        system_id     UUID    NOT NULL,
        symbol_id     UUID    NOT NULL,
        expression_id UUID    NOT NULL,
        position      INTEGER NOT NULL,

        CONSTRAINT expression_tokens_primary_key            PRIMARY KEY (expression_id, position),
        CONSTRAINT expression_tokens_system_foreign_key     FOREIGN KEY (system_id) REFERENCES systems(id),
        CONSTRAINT expression_tokens_symbol_foreign_key     FOREIGN KEY (system_id, symbol_id) REFERENCES symbols(system_id, id),
        CONSTRAINT expression_tokens_expression_foreign_key FOREIGN KEY (system_id, expression_id) REFERENCES expressions(system_id, id),
        CONSTRAINT expression_tokens_position_nonnegative   CHECK(position >= 0)
      );
    `);
  }

  public down(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query('DROP TABLE expression_tokens;');
  }
};
