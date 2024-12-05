import { BaseCountSubscriber } from '@/common/subscribers/base-count.subscriber';
import { SystemEntity } from '@/system/system.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { UserEntity } from '@/user/user.entity';
import { DataSource, EventSubscriber } from 'typeorm';

@EventSubscriber()
export class UserSystemCountSubscriber extends BaseCountSubscriber<SystemEntity> {
  constructor() {
    super(SystemEntity);
  }

  protected async adjustCount(connection: DataSource, entity: SystemEntity, increment: boolean): Promise<void> {
    const { createdByUserId } = entity;

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

  protected shouldAdjust = undefined;
};
