import { BaseMigration } from './base.migration';

export class AddSystemsTable0000000000002 extends BaseMigration {
  public readonly UP_SCRIPT = `
    CREATE TABLE systems (
      id            UUID          NOT NULL  DEFAULT gen_random_uuid(),
      owner_user_id UUID          NOT NULL,
      name          VARCHAR(200)  NOT NULL,
      description   VARCHAR(5000) NOT NULL,

      CONSTRAINT systems_primary_key                PRIMARY KEY (id),
      CONSTRAINT systems_owner_foreign_key          FOREIGN KEY (owner_user_id) REFERENCES users(id),
      CONSTRAINT systems_name_nonempty              CHECK(LENGTH(name) > 0),
      CONSTRAINT systems_description_nonempty       CHECK(LENGTH(description) > 0),
      CONSTRAINT systems_owner_user_id_name_unique  UNIQUE(owner_user_id, name)
    );
  `;

  public readonly DOWN_SCRIPT = 'DROP TABLE systems;';
};
