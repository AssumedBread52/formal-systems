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

    this.adjustStatementCounts(connection, entity);
  }

  async afterRemove(event: RemoveEvent<StatementEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    this.adjustStatementCounts(connection, databaseEntity);
  }

  private async adjustStatementCounts(connection: DataSource, statement: StatementEntity): Promise<void> {
    const { systemId } = statement;

    const statementRepository = connection.getMongoRepository(StatementEntity);
    const systemRepository = connection.getMongoRepository(SystemEntity);

    const system = await systemRepository.findOneBy({
      _id: systemId
    });

    if (!system) {
      throw new SystemNotFoundException();
    }

    system.axiomCount = await statementRepository.count({
      systemId
    });

    systemRepository.save(system);
  }
};
