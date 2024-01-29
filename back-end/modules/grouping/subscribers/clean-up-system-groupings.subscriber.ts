import { GroupingEntity } from '@/grouping/grouping.entity';
import { SystemEntity } from '@/system/system.entity';
import { EntitySubscriberInterface, EventSubscriber, RemoveEvent } from 'typeorm';

@EventSubscriber()
export class CleanUpSystemGroupingsSubscriber implements EntitySubscriberInterface<SystemEntity> {
  listenTo(): string | Function {
    return SystemEntity;
  }

  async afterRemove(event: RemoveEvent<SystemEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    const { _id } = databaseEntity;

    const groupingRepository = connection.getMongoRepository(GroupingEntity);

    const groupings = await groupingRepository.find({
      systemId: _id
    });

    groupingRepository.remove(groupings);
  }
};
