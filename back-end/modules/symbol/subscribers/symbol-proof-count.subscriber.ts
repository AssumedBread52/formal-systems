import { BaseCountSubscriber } from '@/common/subscribers/base-count.subscriber';
import { ProofEntity } from '@/proof/proof.entity';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { ObjectId } from 'mongodb';
import { DataSource, EventSubscriber } from 'typeorm';

@EventSubscriber()
export class SymbolProofCountSubscriber extends BaseCountSubscriber<ProofEntity> {
  constructor() {
    super(ProofEntity);
  }

  protected async adjustCount(connection: DataSource, entity: ProofEntity, shouldIncrement: boolean): Promise<void> {
    const { steps } = entity;

    const symbolIds = [] as ObjectId[];
    for (const step of steps) {
      const[, substitutions] = step;

      for (const substitution of substitutions) {
        const [variableSymbolId, expression] = substitution;

        symbolIds.push(variableSymbolId);

        for (const symbolId of expression) {
          symbolIds.push(symbolId);
        }
      }
    }

    const symbolRepository = connection.getMongoRepository(SymbolEntity);

    const symbols = await symbolRepository.find({
      where: {
        _id: {
          $in: symbolIds
        }
      }
    });

    symbols.forEach((symbol: SymbolEntity): void => {
      if (shouldIncrement) {
        symbol.proofAppearanceCount++;
      } else {
        symbol.proofAppearanceCount--;
      }
    });

    await symbolRepository.save(symbols);
  }

  protected shouldAdjust(oldEntity: ProofEntity, newEntity: ProofEntity): boolean {
    const { steps: oldSteps } = oldEntity;
    const { steps: newSteps } = newEntity;

    const oldSymbolIds = new Set<string>();
    for (const oldStep of oldSteps) {
      const [, substitutions] = oldStep;

      for (const substitution of substitutions) {
        const [variableSymbolId, expression] = substitution;

        oldSymbolIds.add(variableSymbolId.toString());

        for (const symbolId of expression) {
          oldSymbolIds.add(symbolId.toString());
        }
      }
    }

    const newSymbolIds = new Set<string>();
    for (const newStep of newSteps) {
      const [, substitutions] = newStep;

      for (const substitution of substitutions) {
        const [variableSymbolId, expression] = substitution;

        newSymbolIds.add(variableSymbolId.toString());

        for (const symbolId of expression) {
          newSymbolIds.add(symbolId.toString());
        }
      }
    }

    if (oldSymbolIds.size !== newSymbolIds.size) {
      return true;
    }

    for (const oldSymbolId of oldSymbolIds) {
      if (!newSymbolIds.has(oldSymbolId)) {
        return true;
      }
    }

    return false;
  }
};
