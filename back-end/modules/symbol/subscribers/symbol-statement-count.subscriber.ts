import { StatementEntity } from '@/statement/statement.entity';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';

@EventSubscriber()
export class SymbolStatementCountSubscriber implements EntitySubscriberInterface<StatementEntity> {
  listenTo(): Function | string {
    return StatementEntity;
  }

  async afterInsert(event: InsertEvent<StatementEntity>): Promise<void> {
    const { connection, entity } = event;

    await this.adjustSymbolStatementCounts(connection, entity, true);
  }

  async afterRemove(event: RemoveEvent<StatementEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    await this.adjustSymbolStatementCounts(connection, databaseEntity, false);
  }

  async afterUpdate(event: UpdateEvent<StatementEntity>): Promise<void> {
    const { connection, databaseEntity, entity } = event;

    if (!entity) {
      return;
    }

    await this.adjustSymbolStatementCounts(connection, databaseEntity, false);
    await this.adjustSymbolStatementCounts(connection, entity as StatementEntity, true);
  }

  private async adjustSymbolStatementCounts(connection: DataSource, statement: StatementEntity, increment: boolean): Promise<void> {
    const { distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion, proofCount } = statement;

    const symbolIds = assertion.concat(...logicalHypotheses, ...variableTypeHypotheses, ...distinctVariableRestrictions);

    const symbolRepository = connection.getMongoRepository(SymbolEntity);

    const symbols = await symbolRepository.findBy({
      _id: {
        $in: symbolIds
      }
    });

    if (0 === symbols.length) {
      return;
    }

    symbols.forEach((symbol: SymbolEntity): void => {
      if (0 === proofCount) {
        if (increment) {
          symbol.axiomAppearanceCount++;
        } else {
          symbol.axiomAppearanceCount--;
        }
      } else if (0 === logicalHypotheses.length) {
        if (increment) {
          symbol.theoremAppearanceCount++;
        } else {
          symbol.theoremAppearanceCount--;
        }
      } else {
        if (increment) {
          symbol.deductionAppearanceCount++;
        } else {
          symbol.deductionAppearanceCount--;
        }
      }
    });

    await symbolRepository.save(symbols);
  }
};
