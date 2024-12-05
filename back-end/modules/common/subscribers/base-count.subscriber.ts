import { ClassConstructor } from 'class-transformer';
import { DataSource, EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';

export abstract class BaseCountSubscriber<Entity> implements EntitySubscriberInterface<Entity> {
  constructor(private EntityConstructor: ClassConstructor<Entity>) {
  }

  listenTo(): Function | string {
    return this.EntityConstructor;
  }

  async afterInsert(event: InsertEvent<Entity>): Promise<void> {
    const { connection, entity } = event;

    await this.adjustCount(connection, entity, true);
  }

  async afterRemove(event: RemoveEvent<Entity>): Promise<void> {
    const { connection, databaseEntity } = event;

    await this.adjustCount(connection, databaseEntity, false);
  }

  async afterUpdate(event: UpdateEvent<Entity>): Promise<void> {
    const { connection, databaseEntity, entity } = event;

    if (!(entity instanceof this.EntityConstructor)) {
      return;
    }

    if (!this.shouldAdjust) {
      return;
    }

    if (!this.shouldAdjust(databaseEntity, entity)) {
      return;
    }

    await this.adjustCount(connection, databaseEntity, false);

    await this.adjustCount(connection, entity, true);
  }

  protected abstract adjustCount(connection: DataSource, entity: Entity, increment: boolean): Promise<void>;

  protected abstract shouldAdjust?(oldEntity: Entity, newEntity: Entity): boolean;
};
