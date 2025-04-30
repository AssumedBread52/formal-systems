import { BaseCountSubscriber } from '@/common/subscribers/base-count.subscriber';
import { MongoSystemEntity } from '@/system/entities/mongo-system.entity';
import { MongoUserEntity } from '@/user/entities/mongo-user.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { DataSource, EventSubscriber } from 'typeorm';

@EventSubscriber()
export class UserSystemCountSubscriber extends BaseCountSubscriber<MongoSystemEntity> {
  constructor() {
    super(MongoSystemEntity);
  }

  protected async adjustCount(connection: DataSource, entity: MongoSystemEntity, shouldIncrement: boolean): Promise<void> {
    const { createdByUserId } = entity;

    const userRepository = connection.getMongoRepository(MongoUserEntity);

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
