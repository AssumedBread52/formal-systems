import { StatementEntity } from '@/statement/statement.entity';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { NotFoundException } from '@nestjs/common';
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent } from 'typeorm';

@EventSubscriber()
export class SymbolStatementCountSubscriber implements EntitySubscriberInterface<StatementEntity> {
  listenTo(): string | Function {
    return StatementEntity;
  }

  async afterInsert(event: InsertEvent<StatementEntity>): Promise<void> {
    const { connection, entity } = event;

    const { distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion } = entity;

    const symbolIds = assertion.concat(...distinctVariableRestrictions, ...variableTypeHypotheses, ...logicalHypotheses);

    const symbolRepository = connection.getMongoRepository(SymbolEntity);

    const symbols = await symbolRepository.find({
      _id: {
        $in: symbolIds
      }
    });

    if (0 === symbols.length) {
      throw new NotFoundException('No symbols found.');
    }

    symbols.forEach((symbol: SymbolEntity): void => {
      symbol.axiomAppearances++;
    });

    symbolRepository.save(symbols);
  }

  async afterRemove(event: RemoveEvent<StatementEntity>): Promise<void> {
    const { connection, databaseEntity } = event;

    const { distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion } = databaseEntity;

    const symbolIds = assertion.concat(...distinctVariableRestrictions, ...variableTypeHypotheses, ...logicalHypotheses);

    const symbolRepository = connection.getMongoRepository(SymbolEntity);

    const symbols = await symbolRepository.find({
      _id: {
        $in: symbolIds
      }
    });

    if (0 === symbols.length) {
      return;
    }

    symbols.forEach((symbol: SymbolEntity): void => {
      symbol.axiomAppearances--;
    });

    symbolRepository.save(symbols);
  }
};
