import { SystemEntity } from '@/system/system.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { UserEntity } from '@/user/user.entity';
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent } from 'typeorm';

@EventSubscriber()
export class UserSystemCountSubscriber implements EntitySubscriberInterface<SystemEntity> {
  listenTo(): string | Function {
    return SystemEntity;
  }

  async afterInsert(event: InsertEvent<SystemEntity>): Promise<void> {
    const { connection, entity } = event;

    const { createdByUserId } = entity;

    const userRepository = connection.getMongoRepository(UserEntity);

    const user = await userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    user.systemCount++;

    userRepository.save(user);
  }

  async afterRemove(event: RemoveEvent<SystemEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    const { createdByUserId } = databaseEntity;

    const userRepository = connection.getMongoRepository(UserEntity);

    const user = await userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    user.systemCount--;

    userRepository.save(user);
  }
};
