import { BaseMigration } from './base.migration';

export class AddUsersTable0000000000001 extends BaseMigration {
  public readonly UP_SCRIPT = `
    CREATE TABLE users (
      id            UUID          NOT NULL  DEFAULT gen_random_uuid(),
      handle        VARCHAR(50)   NOT NULL,
      email         VARCHAR(254)  NOT NULL,
      password_hash CHAR(60)      NOT NULL,

      CONSTRAINT users_primary_key      PRIMARY KEY (id),
      CONSTRAINT users_handle_nonempty  CHECK(LENGTH(handle) > 0),
      CONSTRAINT users_email_nonempty   CHECK(LENGTH(email) > 0),
      CONSTRAINT users_handle_unique    UNIQUE(handle),
      CONSTRAINT users_email_unique     UNIQUE(email)
    );
  `;

  public readonly DOWN_SCRIPT = 'DROP TABLE users;';
};
