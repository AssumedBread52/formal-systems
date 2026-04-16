import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatementLogicalHypothesesTable0000000000009 implements MigrationInterface {
  public up(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query(`
      CREATE TABLE statement_logical_hypotheses (
        system_id             UUID    NOT NULL,
        statement_id          UUID    NOT NULL,
        logical_expression_id UUID    NOT NULL,
        position              INTEGER NOT NULL,

        CONSTRAINT statement_logical_hypotheses_primary_key                         PRIMARY KEY (statement_id, position),
        CONSTRAINT statement_logical_hypotheses_system_foreign_key                  FOREIGN KEY (system_id) REFERENCES systems(id),
        CONSTRAINT statement_logical_hypotheses_statement_foreign_key               FOREIGN KEY (system_id, statement_id) REFERENCES statements(system_id, id),
        CONSTRAINT statement_logical_hypotheses_logical_expression_foreign_key      FOREIGN KEY (system_id, logical_expression_id) REFERENCES expressions(system_id, id),
        CONSTRAINT statement_logical_hypotheses_position_nonnegative                CHECK(position >= 0),
        CONSTRAINT statement_logical_hypotheses_statement_logical_expression_unique UNIQUE(statement_id, logical_expression_id)
      );
    `);
  }

  public down(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query('DROP TABLE statement_logical_hypotheses;');
  }
};
