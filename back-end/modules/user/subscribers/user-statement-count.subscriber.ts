import { StatementEntity } from '@/statement/statement.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { UserEntity } from '@/user/user.entity';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent } from 'typeorm';

@EventSubscriber()
export class UserStatementCountSubscriber implements EntitySubscriberInterface<StatementEntity> {
  listenTo(): Function | string {
    return StatementEntity;
  }

  async afterInsert(event: InsertEvent<StatementEntity>): Promise<void> {
    const { connection, entity } = event;

    await this.adjustUserStatementCounts(connection, entity, true);
  }

  async afterRemove(event: RemoveEvent<StatementEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    await this.adjustUserStatementCounts(connection, databaseEntity, false);
  }

  private async adjustUserStatementCounts(connection: DataSource, statement: StatementEntity, increment: boolean): Promise<void> {
    const { createdByUserId } = statement;

    const userRepository = connection.getMongoRepository(UserEntity);

    const user = await userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    if (increment) {
      user.axiomCount++;
    } else {
      user.axiomCount--;
    }

    await userRepository.save(user);
  }
};
