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

    this.adjustSymbolCounts(connection, entity);
  }

  async afterRemove(event: RemoveEvent<SymbolEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    this.adjustSymbolCounts(connection, databaseEntity);
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

    this.adjustSymbolCounts(connection, databaseEntity);
  }

  private async adjustSymbolCounts(connection: DataSource, symbol: SymbolEntity): Promise<void> {
    const { systemId } = symbol;

    const symbolRepository = connection.getMongoRepository(SymbolEntity);
    const systemRepository = connection.getMongoRepository(SystemEntity);

    const system = await systemRepository.findOneBy({
      _id: systemId
    });

    if (!system) {
      throw new SystemNotFoundException();
    }

    system.constantSymbolCount = await symbolRepository.count({
      type: SymbolType.Constant,
      systemId
    });
    system.variableSymbolCount = await symbolRepository.count({
      type: SymbolType.Variable,
      systemId
    });

    systemRepository.save(system);
  }
};
