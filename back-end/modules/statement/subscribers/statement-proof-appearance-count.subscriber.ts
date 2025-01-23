import { BaseCountSubscriber } from '@/common/subscribers/base-count.subscriber';
import { ProofEntity } from '@/proof/proof.entity';
import { StatementEntity } from '@/statement/statement.entity';
import { ObjectId } from 'mongodb';
import { DataSource, EventSubscriber } from 'typeorm';

@EventSubscriber()
export class StatementProofAppearanceCountSubsciber extends BaseCountSubscriber<ProofEntity> {
  constructor() {
    super(ProofEntity);
  }

  protected async adjustCount(connection: DataSource, entity: ProofEntity, shouldIncrement: boolean): Promise<void> {
    const { steps } = entity;

    const statementIds = steps.map((step: [ObjectId, [ObjectId, ObjectId[]][]]): ObjectId => {
      const [statementId] = step;

      return statementId;
    });

    const statementRepository = connection.getMongoRepository(StatementEntity);

    const statements = await statementRepository.find({
      where: {
        _id: {
          $in: statementIds
        }
      }
    });

    statements.forEach((statement: StatementEntity): void => {
      if (shouldIncrement) {
        statement.proofAppearanceCount++;
      } else {
        statement.proofAppearanceCount--;
      }
    });

    await statementRepository.save(statements);
  }

  protected shouldAdjust(oldEntity: ProofEntity, newEntity: ProofEntity): boolean {
    const { steps: oldSteps } = oldEntity;
    const { steps: newSteps } = newEntity;

    const oldStatementIds = new Set<string>();
    for (const oldStep of oldSteps) {
      const [statementId] = oldStep;

      oldStatementIds.add(statementId.toString());
    }

    const newStatementIds = new Set<string>();
    for (const newStep of newSteps) {
      const [statementId] = newStep;

      newStatementIds.add(statementId.toString());
    }

    if (oldStatementIds.size !== newStatementIds.size) {
      return true;
    }

    for (const oldStatementId of oldStatementIds) {
      if (!newStatementIds.has(oldStatementId)) {
        return true;
      }
    }

    return false;
  }
};
