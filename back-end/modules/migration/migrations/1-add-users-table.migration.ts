import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsersTable0000000000001 implements MigrationInterface {
  public up(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query(`
      CREATE TABLE users (
        id            UUID          NOT NULL  DEFAULT gen_random_uuid(),
        handle        VARCHAR(50)   NOT NULL,
        email         VARCHAR(254)  NOT NULL,
        password_hash CHAR(60)      NOT NULL,

        CONSTRAINT users_primary_key            PRIMARY KEY (id),
        CONSTRAINT users_handle_nonempty        CHECK(LENGTH(BTRIM(handle)) > 0),
        CONSTRAINT users_handle_no_outer_spaces CHECK(handle = BTRIM(handle)),
        CONSTRAINT users_email_nonempty         CHECK(LENGTH(BTRIM(email)) > 0),
        CONSTRAINT users_email_no_outer_spaces  CHECK(email = BTRIM(email)),
        CONSTRAINT users_password_hash_nonempty CHECK(LENGTH(BTRIM(password_hash)) > 0),
        CONSTRAINT users_handle_unique          UNIQUE(handle),
        CONSTRAINT users_email_unique           UNIQUE(email)
      );
    `);
  }

  public down(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query('DROP TABLE users;');
  }
};
