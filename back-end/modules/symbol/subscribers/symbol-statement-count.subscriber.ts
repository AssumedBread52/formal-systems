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
    }, true) && assertion.length === entity.assertion.length && assertion.reduce((check, symbolId: ObjectId, currentIndex: number): boolean => {
      return check && symbolId.toString() === entity.assertion[currentIndex].toString();
    }, true)) {
      return;
    }

    const symbolRepository = connection.getMongoRepository(SymbolEntity);

    const beforeSymbolIds = assertion.concat(...distinctVariableRestrictions, ...variableTypeHypotheses, ...logicalHypotheses);

    const beforeSymbols = await symbolRepository.find({
      _id: {
        $in: beforeSymbolIds
      }
    });

    if (0 === beforeSymbols.length) {
      throw new NotFoundException('Symbols not found.');
    }

    beforeSymbols.forEach((symbol: SymbolEntity): void => {
      symbol.axiomAppearances--;
    });

    symbolRepository.save(beforeSymbols);

    const afterSymbolIds = entity.assertion.concat(...entity.distinctVariableRestrictions, ...entity.variableTypeHypotheses, ...entity.logicalHypotheses);

    const afterSymbols = await symbolRepository.find({
      _id: {
        $in: afterSymbolIds
      }
    });

    if (0 === afterSymbols.length) {
      throw new NotFoundException('Symbols not found.');
    }

    afterSymbols.forEach((symbol: SymbolEntity): void => {
      symbol.axiomAppearances++;
    });

    symbolRepository.save(afterSymbols);
  }
};
