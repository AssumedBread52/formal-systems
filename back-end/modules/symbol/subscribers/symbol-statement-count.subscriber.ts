import { StatementEntity } from '@/statement/statement.entity';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';

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

    Promise.all(symbols.map((symbol: SymbolEntity): Promise<SymbolEntity> => {
      return symbolRepository.save(symbol);
    }));
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

    Promise.all(symbols.map((symbol: SymbolEntity): Promise<SymbolEntity> => {
      return symbolRepository.save(symbol);
    }));
  }

  async afterUpdate(event: UpdateEvent<StatementEntity>): Promise<void> {
    const { connection, databaseEntity, entity } = event;

    if (!entity) {
      return;
    }

    const { distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion } = databaseEntity;

    if (distinctVariableRestrictions.length === entity.distinctVariableRestrictions.length && distinctVariableRestrictions.reduce((check: boolean, distinctVariableRestriction: [ObjectId, ObjectId], currentIndex: number): boolean => {
      return check && distinctVariableRestriction[0].toString() === entity.distinctVariableRestrictions[currentIndex][0].toString() && distinctVariableRestriction[1].toString() === entity.distinctVariableRestrictions[currentIndex][1].toString();
    }, true) && variableTypeHypotheses.length === entity.variableTypeHypotheses.length && variableTypeHypotheses.reduce((check: boolean, variableTypeHypothesis: [ObjectId, ObjectId], currentIndex: number): boolean => {
      return check && variableTypeHypothesis[0].toString() === entity.variableTypeHypotheses[currentIndex][0].toString() && variableTypeHypothesis[1].toString() === entity.variableTypeHypotheses[currentIndex][1].toString();
    }, true) && logicalHypotheses.length === entity.logicalHypotheses.length && logicalHypotheses.reduce((check: boolean, logicalHypothesis: ObjectId[], currentIndex: number): boolean => {
      return check && logicalHypothesis.length === entity.logicalHypotheses[currentIndex].length && logicalHypothesis.reduce((symbolCheck: boolean, symbolId: ObjectId, index: number): boolean => {
        return symbolCheck && symbolId.toString() === entity.logicalHypotheses[currentIndex][index].toString();
      }, true);
    }, true) && assertion.length === entity.assertion.length && assertion.reduce((check: boolean, symbolId: ObjectId, currentIndex: number): boolean => {
      return check && symbolId.toString() === entity.assertion[currentIndex].toString();
    }, true)) {
      return;
    }

    const symbolRepository = connection.getMongoRepository(SymbolEntity);

    const beforeSymbolIds = assertion.concat(...distinctVariableRestrictions, ...variableTypeHypotheses, ...logicalHypotheses);
    const afterSymbolIds = entity.assertion.concat(...entity.distinctVariableRestrictions, ...entity.variableTypeHypotheses, ...entity.logicalHypotheses);

    const symbols = await symbolRepository.find({
      _id: {
        $in: beforeSymbolIds.concat(afterSymbolIds)
      }
    });

    if (0 === symbols.length) {
      throw new NotFoundException('Symbols not found.');
    }

    symbols.forEach((symbol: SymbolEntity): void => {
      const { _id } = symbol;

      const id = _id.toString();

      if (beforeSymbolIds.reduce((exists: boolean, beforeSymbolId: ObjectId): boolean => {
        return exists || beforeSymbolId.toString() === id;
      }, false)) {
        symbol.axiomAppearances--;
      }

      if (afterSymbolIds.reduce((exists: boolean, afterSymbolId: ObjectId): boolean => {
        return exists || afterSymbolId.toString() === id;
      }, false)) {
        symbol.axiomAppearances++;
      }
    });

    Promise.all(symbols.map((symbol: SymbolEntity): Promise<SymbolEntity> => {
      return symbolRepository.save(symbol);
    }));
  }
};
