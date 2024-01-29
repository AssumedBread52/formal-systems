import { StatementEntity } from '@/statement/statement.entity';
import { SystemEntity } from '@/system/system.entity';
import { NotFoundException } from '@nestjs/common';
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent } from 'typeorm';

@EventSubscriber()
export class SystemStatementCountSubscriber implements EntitySubscriberInterface<StatementEntity> {
  listenTo(): string | Function {
    return StatementEntity;
  }

  async afterInsert(event: InsertEvent<StatementEntity>): Promise<void> {
    const { connection, entity } = event;

    const { systemId } = entity;

    const systemRepository = connection.getMongoRepository(SystemEntity);

    const system = await systemRepository.findOneBy({
      _id: systemId
    });

    if (!system) {
      throw new NotFoundException('Formal system not found.');
    }

    system.axiomCount++;

    systemRepository.save(system);
  }

  async afterRemove(event: RemoveEvent<StatementEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    const { systemId } = databaseEntity;

    const systemRepository = connection.getMongoRepository(SystemEntity);

    const system = await systemRepository.findOneBy({
      _id: systemId
    });

    if (!system) {
      throw new NotFoundException('Formal system not found.');
    }

    system.axiomCount--;

    systemRepository.save(system);
  }
};
