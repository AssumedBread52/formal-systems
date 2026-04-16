import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatementsTable0000000000007 implements MigrationInterface {
  public up(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query(`
      CREATE TABLE statements (
        id                      UUID          NOT NULL  DEFAULT gen_random_uuid(),
        system_id               UUID          NOT NULL,
        assertion_expression_id UUID          NOT NULL,
        name                    VARCHAR(200)  NOT NULL,
        description             VARCHAR(5000) NOT NULL,

        CONSTRAINT statements_primary_key                       PRIMARY KEY (id),
        CONSTRAINT statements_system_foreign_key                FOREIGN KEY (system_id) REFERENCES systems(id),
        CONSTRAINT statements_assertion_expression_foreign_key  FOREIGN KEY (system_id, assertion_expression_id) REFERENCES expressions(system_id, id),
        CONSTRAINT statements_name_nonempty                     CHECK(LENGTH(name) > 0),
        CONSTRAINT statements_description_nonempty              CHECK(LENGTH(description) > 0),
        CONSTRAINT statements_system_name_unique                UNIQUE(system_id, name),
        CONSTRAINT statements_id_system_unique                  UNIQUE(system_id, id)
      );
    `);
  }

  public down(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query('DROP TABLE statements;');
  }
};
