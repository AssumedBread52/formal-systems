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

    this.adjustSystemCount(connection, entity);
  }

  async afterRemove(event: RemoveEvent<SystemEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    this.adjustSystemCount(connection, databaseEntity);
  }

  private async adjustSystemCount(connection: DataSource, system: SystemEntity): Promise<void> {
    const { createdByUserId } = system;

    const systemRepository = connection.getMongoRepository(SystemEntity);
    const userRepository = connection.getMongoRepository(UserEntity);

    const user = await userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    user.systemCount = await systemRepository.count({
      createdByUserId
    });

    userRepository.save(user);
  }
};
