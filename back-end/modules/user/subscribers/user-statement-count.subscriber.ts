import { StatementEntity } from '@/statement/statement.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { UserEntity } from '@/user/user.entity';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';

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

  async afterUpdate(event: UpdateEvent<StatementEntity>): Promise<void> {
    const { connection, databaseEntity, entity } = event;

    if (!entity) {
      return;
    }

    await this.adjustUserStatementCounts(connection, databaseEntity, false);
    await this.adjustUserStatementCounts(connection, entity as StatementEntity, true);
  }

  private async adjustUserStatementCounts(connection: DataSource, statement: StatementEntity, increment: boolean): Promise<void> {
    const { logicalHypotheses, proofCount, createdByUserId } = statement;

    const userRepository = connection.getMongoRepository(UserEntity);

    const user = await userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    if (0 === proofCount) {
      if (increment) {
        user.axiomCount++;
      } else {
        user.axiomCount--;
      }
    } else if (0 === logicalHypotheses.length) {
      if (increment) {
        user.theoremCount++;
      } else {
        user.theoremCount--;
      }
    } else {
      if (increment) {
        user.deductionCount++;
      } else {
        user.deductionCount--;
      }
    }

    await userRepository.save(user);
  }
};
