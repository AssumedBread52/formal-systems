import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatementDistinctVariablesTable0000000000010 implements MigrationInterface {
  public up(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query(`
      CREATE TABLE statement_distinct_variables (
        system_id             UUID  NOT NULL,
        statement_id          UUID  NOT NULL,
        variable_symbol_1_id  UUID  NOT NULL,
        variable_symbol_2_id  UUID  NOT NULL,

        CONSTRAINT statement_distinct_variables_primary_key                   PRIMARY KEY (statement_id, variable_symbol_1_id, variable_symbol_2_id),
        CONSTRAINT statement_distinct_variables_system_foreign_key            FOREIGN KEY (system_id) REFERENCES systems(id),
        CONSTRAINT statement_distinct_variables_statement_foreign_key         FOREIGN KEY (system_id, statement_id) REFERENCES statements(system_id, id),
        CONSTRAINT statement_distinct_variables_variable_symbol_1_foreign_key FOREIGN KEY (system_id, variable_symbol_1_id) REFERENCES symbols(system_id, id),
        CONSTRAINT statement_distinct_variables_variable_symbol_2_foreign_key FOREIGN KEY (system_id, variable_symbol_2_id) REFERENCES symbols(system_id, id),
        CONSTRAINT statement_distinct_variables_order                         CHECK(variable_symbol_1_id < variable_symbol_2_id)
      );
    `);
  }

  public down(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query('DROP TABLE statement_distinct_variables;');
  }
};
