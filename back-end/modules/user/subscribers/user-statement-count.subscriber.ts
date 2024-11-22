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

    this.adjustStatementCounts(connection, entity);
  }

  async afterRemove(event: RemoveEvent<StatementEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    this.adjustStatementCounts(connection, databaseEntity);
  }

  private async adjustStatementCounts(connection: DataSource, statement: StatementEntity): Promise<void> {
    const { createdByUserId } = statement;

    const statementRepository = connection.getMongoRepository(StatementEntity);
    const userRepository = connection.getMongoRepository(UserEntity);

    const user = await userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    user.axiomCount = await statementRepository.count({
      createdByUserId
    });

    userRepository.save(user);
  }
};
