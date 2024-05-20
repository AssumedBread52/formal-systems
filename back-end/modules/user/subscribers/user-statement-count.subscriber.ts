import { StatementEntity } from '@/statement/statement.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { UserEntity } from '@/user/user.entity';
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent } from 'typeorm';

@EventSubscriber()
export class UserStatementCountSubscriber implements EntitySubscriberInterface<StatementEntity> {
  listenTo(): string | Function {
    return StatementEntity;
  }

  async afterInsert(event: InsertEvent<StatementEntity>): Promise<void> {
    const { connection, entity } = event;

    const { createdByUserId } = entity;

    const userRepository = connection.getMongoRepository(UserEntity);

    const user = await userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    user.axiomCount++;

    userRepository.save(user);
  }

  async afterRemove(event: RemoveEvent<StatementEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    const { createdByUserId } = databaseEntity;

    const userRepository = connection.getMongoRepository(UserEntity);

    const user = await userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    user.axiomCount--;

    userRepository.save(user);
  }
};
