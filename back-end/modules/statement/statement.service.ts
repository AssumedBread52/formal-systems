import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolReadService } from '@/symbol/services/symbol-read.service';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { InvalidSymbolPrefixException } from './exceptions/invalid-symbol-prefix.exception';
import { InvalidVariableTypeException } from './exceptions/invalid-variable-type.exception';
import { MissingVariableTypeHypothesisException } from './exceptions/missing-variable-type-hypothesis.exception';
import { EditStatementPayload } from './payloads/edit-statement.payload';
import { StatementEntity } from './statement.entity';

@Injectable()
export class StatementService {
  constructor(@InjectRepository(StatementEntity) private statementRepository: MongoRepository<StatementEntity>, private symbolReadService: SymbolReadService) {
  }

  async update(statement: StatementEntity, editStatementPayload: EditStatementPayload): Promise<StatementEntity> {
    const { systemId } = statement;
    const { newTitle, newDescription, newDistinctVariableRestrictions, newVariableTypeHypotheses, newLogicalHypotheses, newAssertion } = editStatementPayload;

    const symbolIds = newAssertion.concat(...newDistinctVariableRestrictions, ...newVariableTypeHypotheses, ...newLogicalHypotheses);

    const symbolDictionary = await this.symbolReadService.addToSymbolDictionary(systemId, symbolIds.map((symbolId: string): ObjectId => {
      return new ObjectId(symbolId);
    }), {});

    this.processabilityCheck(newDistinctVariableRestrictions, newVariableTypeHypotheses, newLogicalHypotheses, newAssertion, symbolDictionary);

    statement.title = newTitle;
    statement.description = newDescription;
    statement.distinctVariableRestrictions = newDistinctVariableRestrictions.map((newDistinctVariableRestriction: [string, string]): [ObjectId, ObjectId] => {
      const [first, second] = newDistinctVariableRestriction;

      return [
        new ObjectId(first),
        new ObjectId(second)
      ];
    });
    statement.variableTypeHypotheses = newVariableTypeHypotheses.map((newVariableTypeHypothesis: [string, string]): [ObjectId, ObjectId] => {
      const [type, variable] = newVariableTypeHypothesis;

      return [
        new ObjectId(type),
        new ObjectId(variable)
      ];
    });
    statement.logicalHypotheses = newLogicalHypotheses.map((logicalHypothesis: [string, ...string[]]): [ObjectId, ...ObjectId[]] => {
      const [prefix, ...expression] = logicalHypothesis;

      return [
        new ObjectId(prefix),
        ...expression.map((symbolId: string): ObjectId => {
          return new ObjectId(symbolId);
        })
      ];
    });
    const [prefix, ...expression] = newAssertion;
    statement.assertion = [
      new ObjectId(prefix),
      ...expression.map((symbolId: string): ObjectId => {
        return new ObjectId(symbolId);
      })
    ];

    return this.statementRepository.save(statement);
  }

  private processabilityCheck(distinctVariableRestrictions: [string, string][], variableTypeHypotheses: [string, string][], logicalHypotheses: [string, ...string[]][], assertion: [string, ...string[]], symbolDictionary: Record<string, SymbolEntity>): void {
    distinctVariableRestrictions.forEach((distinctVariableRestriction: [string, string]): void => {
      const [first, second] = distinctVariableRestriction;

      if (SymbolType.Variable !== symbolDictionary[first].type) {
        throw new InvalidVariableTypeException();
      }

      if (SymbolType.Variable !== symbolDictionary[second].type) {
        throw new InvalidVariableTypeException();
      }
    });

    const types = variableTypeHypotheses.reduce((types: Record<string, string>, variableTypeHypothesis: [string, string]): Record<string, string> => {
      const [type, variable] = variableTypeHypothesis;

      if (SymbolType.Constant !== symbolDictionary[type].type) {
        throw new InvalidVariableTypeException();
      }
      
      if (SymbolType.Variable !== symbolDictionary[variable].type) {
        throw new InvalidVariableTypeException();
      }

      types[variable] = type;

      return types;
    }, {});

    [...logicalHypotheses, assertion].forEach((prefixedExpression: [string, ...string[]]): void => {
      const [prefix, ...expression] = prefixedExpression;
      if (symbolDictionary[prefix].type !== SymbolType.Constant) {
        throw new InvalidSymbolPrefixException();
      }

      expression.forEach((symbolId: string): void => {
        if (SymbolType.Variable !== symbolDictionary[symbolId].type) {
          return;
        }

        if (!types[symbolId]) {
          throw new MissingVariableTypeHypothesisException();
        }
      });
    });
  }
};
