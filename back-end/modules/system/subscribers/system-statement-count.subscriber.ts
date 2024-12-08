import { BaseCountSubscriber } from '@/common/subscribers/base-count.subscriber';
import { StatementEntity } from '@/statement/statement.entity';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { SystemEntity } from '@/system/system.entity';
import { DataSource, EventSubscriber } from 'typeorm';

@EventSubscriber()
export class SystemStatementCountSubscriber extends BaseCountSubscriber<StatementEntity> {
  constructor() {
    super(StatementEntity);
  }

  protected async adjustCount(connection: DataSource, entity: StatementEntity, shouldIncrement: boolean): Promise<void> {
    const { logicalHypotheses, proofCount, systemId } = entity;

    const systemRepository = connection.getMongoRepository(SystemEntity);

    const system = await systemRepository.findOneBy({
      _id: systemId
    });

    if (!system) {
      throw new SystemNotFoundException();
    }

    if (0 === proofCount) {
      if (shouldIncrement) {
        system.axiomCount++;
      } else {
        system.axiomCount--;
      }
    } else if (0 === logicalHypotheses.length) {
      if (shouldIncrement) {
        system.theoremCount++;
      } else {
        system.theoremCount--;
      }
    } else {
      if (shouldIncrement) {
        system.deductionCount++;
      } else {
        system.deductionCount--;
      }
    }

    await systemRepository.save(system);
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
