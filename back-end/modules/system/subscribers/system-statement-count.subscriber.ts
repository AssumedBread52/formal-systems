import { StatementEntity } from '@/statement/statement.entity';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { SystemEntity } from '@/system/system.entity';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent } from 'typeorm';

@EventSubscriber()
export class SystemStatementCountSubscriber implements EntitySubscriberInterface<StatementEntity> {
  listenTo(): Function | string {
    return StatementEntity;
  }

  async afterInsert(event: InsertEvent<StatementEntity>): Promise<void> {
    const { connection, entity } = event;

    await this.adjustSystemStatementCounts(connection, entity, true);
  }

  async afterRemove(event: RemoveEvent<StatementEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    await this.adjustSystemStatementCounts(connection, databaseEntity, false);
  }

  private async adjustSystemStatementCounts(connection: DataSource, statement: StatementEntity, increment: boolean): Promise<void> {
    const { createdByUserId } = statement;

    const systemRepository = connection.getMongoRepository(SystemEntity);

    const system = await systemRepository.findOneBy({
      _id: createdByUserId
    });

    if (!system) {
      throw new SystemNotFoundException();
    }

    if (increment) {
      system.axiomCount++;
    } else {
      system.axiomCount--;
    }

    await systemRepository.save(system);
  }
};
