import { BaseCountSubscriber } from '@/common/subscribers/base-count.subscriber';
import { StatementEntity } from '@/statement/statement.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { UserEntity } from '@/user/user.entity';
import { DataSource, EventSubscriber } from 'typeorm';

@EventSubscriber()
export class UserStatementCountSubscriber extends BaseCountSubscriber<StatementEntity> {
  constructor() {
    super(StatementEntity);
  }

  protected async adjustCount(connection: DataSource, entity: StatementEntity, increment: boolean): Promise<void> {
    const { logicalHypotheses, proofCount, createdByUserId } = entity;

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
