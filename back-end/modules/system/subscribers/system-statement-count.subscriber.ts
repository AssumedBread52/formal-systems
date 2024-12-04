import { StatementEntity } from '@/statement/statement.entity';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { SystemEntity } from '@/system/system.entity';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';

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

  async afterUpdate(event: UpdateEvent<StatementEntity>): Promise<void> {
    const { connection, databaseEntity, entity } = event;

    if (!entity) {
      return;
    }

    await this.adjustSystemStatementCounts(connection, databaseEntity, false);
    await this.adjustSystemStatementCounts(connection, entity as StatementEntity, true);
  }

  private async adjustSystemStatementCounts(connection: DataSource, statement: StatementEntity, increment: boolean): Promise<void> {
    const { logicalHypotheses, proofCount, createdByUserId } = statement;

    const systemRepository = connection.getMongoRepository(SystemEntity);

    const system = await systemRepository.findOneBy({
      _id: createdByUserId
    });

    if (!system) {
      throw new SystemNotFoundException();
    }

    if (0 === proofCount) {
      if (increment) {
        system.axiomCount++;
      } else {
        system.axiomCount--;
      }
    } else if (0 === logicalHypotheses.length) {
      if (increment) {
        system.theoremCount++;
      } else {
        system.theoremCount--;
      }
    } else {
      if (increment) {
        system.deductionCount++;
      } else {
        system.deductionCount--;
      }
    }

    await systemRepository.save(system);
  }
};
