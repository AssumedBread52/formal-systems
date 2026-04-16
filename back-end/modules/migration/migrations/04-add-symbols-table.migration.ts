import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSymbolsTable0000000000004 implements MigrationInterface {
  public up(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query(`
      CREATE TABLE symbols (
        id          UUID          NOT NULL  DEFAULT gen_random_uuid(),
        system_id   UUID          NOT NULL,
        name        VARCHAR(200)  NOT NULL,
        description VARCHAR(5000) NOT NULL,
        type        symbol_type   NOT NULL,
        content     VARCHAR(250)  NOT NULL,

        CONSTRAINT symbols_primary_key          PRIMARY KEY (id),
        CONSTRAINT symbols_system_foreign_key   FOREIGN KEY (system_id) REFERENCES systems(id),
        CONSTRAINT symbols_name_nonempty        CHECK(LENGTH(name) > 0),
        CONSTRAINT symbols_description_nonempty CHECK(LENGTH(description) > 0),
        CONSTRAINT symbols_content_nonempty     CHECK(LENGTH(content) > 0),
        CONSTRAINT symbols_system_name_unique   UNIQUE(system_id, name),
        CONSTRAINT symbols_id_system_unique     UNIQUE(system_id, id)
      );
    `);
  }

  public down(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query('DROP TABLE symbols;');
  }
};
