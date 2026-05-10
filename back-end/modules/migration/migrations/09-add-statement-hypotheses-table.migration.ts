import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatementHypothesesTable0000000000009 implements MigrationInterface {
  public up(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query(`
      CREATE TABLE statement_hypotheses (
        id            UUID            NOT NULL DEFAULT gen_random_uuid(),
        system_id     UUID            NOT NULL,
        statement_id  UUID            NOT NULL,
        expression_id UUID            NOT NULL,
        type          hypothesis_type NOT NULL,

        CONSTRAINT statement_hypotheses_primary_key                       PRIMARY KEY (id),
        CONSTRAINT statement_hypotheses_system_foreign_key                FOREIGN KEY (system_id) REFERENCES systems(id),
        CONSTRAINT statement_hypotheses_statement_foreign_key             FOREIGN KEY (system_id, statement_id) REFERENCES statements(system_id, id),
        CONSTRAINT statement_hypotheses_expression_foreign_key            FOREIGN KEY (system_id, expression_id) REFERENCES expressions(system_id, id),
        CONSTRAINT statement_hypotheses_system_id_id_unique               UNIQUE(system_id, id),
        CONSTRAINT statement_hypotheses_system_id_statement_id_id_unique  UNIQUE(system_id, statement_id, id),
        CONSTRAINT statement_hypotheses_statement_id_expression_id_unique UNIQUE(statement_id, expression_id)
      );
    `);
  }

  public down(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query('DROP TABLE statement_hypotheses;');
  }
};
