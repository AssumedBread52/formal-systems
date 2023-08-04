import { SymbolEntity } from '@/symbol/symbol.entity';
import { SystemEntity } from '@/system/system.entity';
import { EntitySubscriberInterface, EventSubscriber, RemoveEvent } from 'typeorm';

@EventSubscriber()
export class CleanUpSystemSymbolsSubscriber implements EntitySubscriberInterface<SystemEntity> {
  listenTo(): string | Function {
    return SystemEntity;
  }

  async afterRemove(event: RemoveEvent<SystemEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    const { _id } = databaseEntity;

    const symbolRepository = connection.getMongoRepository(SymbolEntity);

    const symbols = await symbolRepository.find({
      systemId: _id
    });

    symbolRepository.remove(symbols);
  }
};
