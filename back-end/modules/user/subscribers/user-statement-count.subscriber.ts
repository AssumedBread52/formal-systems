import { BaseCountSubscriber } from '@/common/subscribers/base-count.subscriber';
import { StatementEntity } from '@/statement/statement.entity';
import { MongoUserEntity } from '@/user/entities/mongo-user.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { DataSource, EventSubscriber } from 'typeorm';

@EventSubscriber()
export class UserStatementCountSubscriber extends BaseCountSubscriber<StatementEntity> {
  constructor() {
    super(StatementEntity);
  }

  protected async adjustCount(connection: DataSource, entity: StatementEntity, shouldIncrement: boolean): Promise<void> {
    const { logicalHypotheses, proofCount, createdByUserId } = entity;

    const userRepository = connection.getMongoRepository(MongoUserEntity);

    const user = await userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    if (0 === proofCount) {
      if (shouldIncrement) {
        user.axiomCount++;
      } else {
        user.axiomCount--;
      }
    } else if (0 === logicalHypotheses.length) {
      if (shouldIncrement) {
        user.theoremCount++;
      } else {
        user.theoremCount--;
      }
    } else {
      if (shouldIncrement) {
        user.deductionCount++;
      } else {
        user.deductionCount--;
      }
    }

    await userRepository.save(user);
  }

  protected shouldAdjust(oldEntity: StatementEntity, newEntity: StatementEntity): boolean {
    const { logicalHypotheses: oldLogicalHypotheses, proofCount: oldProofCount } = oldEntity;
    const { logicalHypotheses: newLogicalHypotheses, proofCount: newProofCount } = newEntity;

    if (0 === oldProofCount) {
      return 0 !== newProofCount;
    }

    if (0 === oldLogicalHypotheses.length) {
      return 0 === newProofCount || 0 !== newLogicalHypotheses.length;
    }

    return 0 === newProofCount || 0 === newLogicalHypotheses.length;
  }
};
