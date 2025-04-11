import { BaseCountSubscriber } from '@/common/subscribers/base-count.subscriber';
import { SystemEntity } from '@/system/system.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { DataSource, EventSubscriber } from 'typeorm';

@EventSubscriber()
export class UserSystemCountSubscriber extends BaseCountSubscriber<SystemEntity> {
  constructor() {
    super(SystemEntity);
  }

  protected async adjustCount(connection: DataSource, entity: SystemEntity, shouldIncrement: boolean): Promise<void> {
    const { createdByUserId } = entity;

    const userRepository = connection.getMongoRepository(UserEntity);

    const user = await userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    if (shouldIncrement) {
      user.systemCount++;
    } else {
      user.systemCount--;
    }

    await userRepository.save(user);
  }

  protected shouldAdjust = undefined;
};
