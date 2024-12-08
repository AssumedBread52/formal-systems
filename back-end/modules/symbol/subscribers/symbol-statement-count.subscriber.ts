import { BaseCountSubscriber } from '@/common/subscribers/base-count.subscriber';
import { StatementEntity } from '@/statement/statement.entity';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { ObjectId } from 'mongodb';
import { DataSource, EventSubscriber } from 'typeorm';

@EventSubscriber()
export class SymbolStatementCountSubscriber extends BaseCountSubscriber<StatementEntity> {
  constructor() {
    super(StatementEntity);
  }

  protected async adjustCount(connection: DataSource, entity: StatementEntity, shouldIncrement: boolean): Promise<void> {
    const { distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion, proofCount } = entity;

    const symbolIds = assertion.concat(...logicalHypotheses, ...variableTypeHypotheses, ...distinctVariableRestrictions);

    const symbolRepository = connection.getMongoRepository(SymbolEntity);

    const symbols = await symbolRepository.find({
      where: {
        _id: {
          $in: symbolIds
        }
      }
    });

    symbols.forEach((symbol: SymbolEntity): void => {
      if (0 === proofCount) {
        if (shouldIncrement) {
          symbol.axiomAppearanceCount++;
        } else {
          symbol.axiomAppearanceCount--;
        }
      } else if (0 === logicalHypotheses.length) {
        if (shouldIncrement) {
          symbol.theoremAppearanceCount++;
        } else {
          symbol.theoremAppearanceCount--;
        }
      } else {
        if (shouldIncrement) {
          symbol.deductionAppearanceCount++;
        } else {
          symbol.deductionAppearanceCount--;
        }
      }
    });

    await symbolRepository.save(symbols);
  }

  protected shouldAdjust(oldEntity: StatementEntity, newEntity: StatementEntity): boolean {
    const { distinctVariableRestrictions: oldDistinctVariableRestrictions, variableTypeHypotheses: oldVariableTypeHypotheses, logicalHypotheses: oldLogicalHypotheses, assertion: oldAssertion, proofCount: oldProofCount } = oldEntity;
    const { distinctVariableRestrictions: newDistinctVariableRestrictions, variableTypeHypotheses: newVariableTypeHypotheses, logicalHypotheses: newLogicalHypotheses, assertion: newAssertion, proofCount: newProofCount } = newEntity;

    const oldSymbolIds = new Set(oldAssertion.concat(...oldLogicalHypotheses, ...oldVariableTypeHypotheses, ...oldDistinctVariableRestrictions).map((oldSymbolId: ObjectId): string => {
      return oldSymbolId.toString();
    }));
    const newSymbolIds = new Set(newAssertion.concat(...newLogicalHypotheses, ...newVariableTypeHypotheses, ...newDistinctVariableRestrictions).map((newSymbolId: ObjectId): string => {
      return newSymbolId.toString();
    }));

    if (oldSymbolIds.size !== newSymbolIds.size) {
      return true;
    }

    for (const oldSymbolId of oldSymbolIds) {
      if (!newSymbolIds.has(oldSymbolId)) {
        return true;
      }
    }

    if (0 === oldProofCount) {
      if (0 !== newProofCount) {
        return true;
      }
    } else if (0 === oldLogicalHypotheses.length) {
      if (0 === newProofCount || 0 !== newLogicalHypotheses.length) {
        return true;
      }
    } else {
      if (0 === newProofCount || 0 === newLogicalHypotheses.length) {
        return true;
      }
    }

    return false;
  }
};
