import { BaseCountSubscriber } from '@/common/subscribers/base-count.subscriber';
import { ProofEntity } from '@/proof/proof.entity';
import { StatementNotFoundException } from '@/statement/exceptions/statement-not-found.exception';
import { StatementEntity } from '@/statement/statement.entity';
import { DataSource, EventSubscriber } from 'typeorm';

@EventSubscriber()
export class StatementProofCountSubsciber extends BaseCountSubscriber<ProofEntity> {
  constructor() {
    super(ProofEntity);
  }

  protected async adjustCount(connection: DataSource, entity: ProofEntity, shouldIncrement: boolean): Promise<void> {
    const { statementId } = entity;

    const statementRepository = connection.getMongoRepository(StatementEntity);

    const statement = await statementRepository.findOneBy({
      _id: statementId
    });

    if (!statement) {
      throw new StatementNotFoundException();
    }

    if (shouldIncrement) {
      statement.proofCount++;
    } else {
      statement.proofCount--;
    }

    await statementRepository.save(statement);
  }

  protected shouldAdjust = undefined;
};
