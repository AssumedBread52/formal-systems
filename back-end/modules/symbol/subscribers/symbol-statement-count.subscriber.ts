import { StatementEntity } from '@/statement/statement.entity';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent } from 'typeorm';

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

  private async adjustSymbolStatementCounts(connection: DataSource, statement: StatementEntity, increment: boolean): Promise<void> {
    const { distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion } = statement;

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
      if (increment) {
        symbol.axiomAppearances++;
      } else {
        symbol.axiomAppearances--;
      }
    });

    await symbolRepository.save(symbols);
  }
};
