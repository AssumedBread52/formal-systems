import { SymbolEntity } from '@/symbol/symbol.entity';
import { SystemEntity } from '@/system/system.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntitySubscriberInterface, EventSubscriber, MongoRepository, RemoveEvent } from 'typeorm';

@EventSubscriber()
export class CleanUpSubscriber implements EntitySubscriberInterface<SystemEntity> {
  constructor(dataSource: DataSource, @InjectRepository(SymbolEntity) private symbolRepository: MongoRepository<SymbolEntity>) {
    dataSource.subscribers.push(this);
  }

  listenTo(): string | Function {
    return SystemEntity;
  }

  async afterRemove(event: RemoveEvent<SystemEntity>): Promise<void> {
    const { databaseEntity } = event;

    const { _id } = databaseEntity;

    const symbols = await this.symbolRepository.findBy({
      systemId: _id
    });

    this.symbolRepository.remove(symbols);
  }
};
