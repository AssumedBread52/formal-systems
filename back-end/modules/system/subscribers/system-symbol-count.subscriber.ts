import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { SystemEntity } from '@/system/system.entity';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';

@EventSubscriber()
export class SystemSymbolCountSubscriber implements EntitySubscriberInterface<SymbolEntity> {
  listenTo(): Function | string {
    return SymbolEntity;
  }

  async afterInsert(event: InsertEvent<SymbolEntity>): Promise<void> {
    const { connection, entity } = event;

    await this.adjustSystemSymbolCounts(connection, entity, true);
  }

  async afterRemove(event: RemoveEvent<SymbolEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    await this.adjustSystemSymbolCounts(connection, databaseEntity, false);
  }

  async afterUpdate(event: UpdateEvent<SymbolEntity>): Promise<void> {
    const { connection, databaseEntity, entity } = event;

    if (!entity) {
      return;
    }

    const { type } = databaseEntity;

    if (type === entity.type) {
      return;
    }

    await this.adjustSystemSymbolCounts(connection, databaseEntity, false);
    await this.adjustSystemSymbolCounts(connection, entity as SymbolEntity, true);
  }

  private async adjustSystemSymbolCounts(connection: DataSource, symbol: SymbolEntity, increment: boolean): Promise<void> {
    const { type, systemId } = symbol;

    const systemRepository = connection.getMongoRepository(SystemEntity);

    const system = await systemRepository.findOneBy({
      _id: systemId
    });

    if (!system) {
      throw new SystemNotFoundException();
    }

    switch (type) {
      case SymbolType.Constant:
        if (increment) {
          system.constantSymbolCount++;
        } else {
          system.constantSymbolCount--;
        }
        break;
      case SymbolType.Variable:
        if (increment) {
          system.variableSymbolCount++;
        } else {
          system.variableSymbolCount--;
        }
        break;
    }

    await systemRepository.save(system);
  }
};
