import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { SystemEntity } from '@/system/system.entity';
import { NotFoundException } from '@nestjs/common';
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent } from 'typeorm';

@EventSubscriber()
export class SystemSymbolCountSubscriber implements EntitySubscriberInterface<SymbolEntity> {
  listenTo(): string | Function {
    return SymbolEntity;
  }

  async afterInsert(event: InsertEvent<SymbolEntity>): Promise<void> {
    const { connection, entity } = event;

    const { type, systemId } = entity;

    const systemRepository = connection.getMongoRepository(SystemEntity);

    const system = await systemRepository.findOneBy({
      _id: systemId
    });

    if (!system) {
      throw new NotFoundException('System not found.');
    }

    switch (type) {
      case SymbolType.Constant:
        system.constantSymbolCount++;
        break;
      case SymbolType.Variable:
        system.variableSymbolCount++;
        break;
    }

    systemRepository.save(system);
  }

  async afterRemove(event: RemoveEvent<SymbolEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    const { type, systemId } = databaseEntity;

    const systemRepository = connection.getMongoRepository(SystemEntity);

    const system = await systemRepository.findOneBy({
      _id: systemId
    });

    if (!system) {
      throw new NotFoundException('User not found.');
    }

    switch (type) {
      case SymbolType.Constant:
        system.constantSymbolCount--;
        break;
      case SymbolType.Variable:
        system.variableSymbolCount--;
        break;
    }

    systemRepository.save(system);
  }
};
