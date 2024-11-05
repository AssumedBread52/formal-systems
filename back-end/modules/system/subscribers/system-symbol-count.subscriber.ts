import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { SystemEntity } from '@/system/system.entity';
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';

@EventSubscriber()
export class SystemSymbolCountSubscriber implements EntitySubscriberInterface<SymbolEntity> {
  listenTo(): Function | string {
    return SymbolEntity;
  }

  async beforeInsert(event: InsertEvent<SymbolEntity>): Promise<void> {
    const { connection, entity } = event;

    const { type, systemId } = entity;

    const systemRepository = connection.getMongoRepository(SystemEntity);

    const system = await systemRepository.findOneBy({
      _id: systemId
    });

    if (!system) {
      throw new SystemNotFoundException();
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

  async beforeRemove(event: RemoveEvent<SymbolEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    const { type, systemId } = databaseEntity;

    const systemRepository = connection.getMongoRepository(SystemEntity);

    const system = await systemRepository.findOneBy({
      _id: systemId
    });

    if (!system) {
      return;
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

  async beforeUpdate(event: UpdateEvent<SymbolEntity>): Promise<void> {
    const { connection, databaseEntity, entity } = event;

    if (!entity) {
      return;
    }

    const { type, systemId } = databaseEntity;

    if (type === entity.type) {
      return;
    }

    const systemRepository = connection.getMongoRepository(SystemEntity);

    const system = await systemRepository.findOneBy({
      _id: systemId
    });

    if (!system) {
      throw new SystemNotFoundException();
    }

    switch (type) {
      case SymbolType.Constant:
        system.constantSymbolCount--;
        system.variableSymbolCount++;
        break;
      case SymbolType.Variable:
        system.constantSymbolCount++;
        system.variableSymbolCount--;
        break;
    }

    systemRepository.save(system);
  }
};
