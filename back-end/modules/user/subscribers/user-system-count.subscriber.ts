import { SystemEntity } from '@/system/system.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { UserEntity } from '@/user/user.entity';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent } from 'typeorm';

@EventSubscriber()
export class UserSystemCountSubscriber implements EntitySubscriberInterface<SystemEntity> {
  listenTo(): Function | string {
    return SystemEntity;
  }

  async afterInsert(event: InsertEvent<SystemEntity>): Promise<void> {
    const { connection, entity } = event;

    await this.adjustUserSystemCount(connection, entity, true);
  }

  async afterRemove(event: RemoveEvent<SystemEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    await this.adjustUserSystemCount(connection, databaseEntity, false);
  }

  private async adjustUserSystemCount(connection: DataSource, system: SystemEntity, increment: boolean): Promise<void> {
    const { createdByUserId } = system;

    const userRepository = connection.getMongoRepository(UserEntity);

    const user = await userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    if (increment) {
      user.systemCount++;
    } else {
      user.systemCount--;
    }

    await userRepository.save(user);
  }
};
