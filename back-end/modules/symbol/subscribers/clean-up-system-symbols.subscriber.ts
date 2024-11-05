import { SymbolEntity } from '@/symbol/symbol.entity';
import { SystemEntity } from '@/system/system.entity';
import { EntitySubscriberInterface, EventSubscriber, RemoveEvent } from 'typeorm';

@EventSubscriber()
export class CleanUpSystemSymbolsSubscriber implements EntitySubscriberInterface<SystemEntity> {
  listenTo(): Function | string {
    return SystemEntity;
  }

  async beforeRemove(event: RemoveEvent<SystemEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    const { _id } = databaseEntity;

    const symbolRepository = connection.getMongoRepository(SymbolEntity);

    const symbols = await symbolRepository.find({
      systemId: _id
    });

    symbolRepository.remove(symbols);
  }
};
