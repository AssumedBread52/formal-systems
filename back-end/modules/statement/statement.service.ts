import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository, RootFilterOperators } from 'typeorm';
import { InvalidSymbolPrefixException } from './exceptions/invalid-symbol-prefix.exception';
import { InvalidVariableTypeException } from './exceptions/invalid-variable-type.exception';
import { MissingVariableTypeHypothesisException } from './exceptions/missing-variable-type-hypothesis.exception';
import { StatementUniqueTitleException } from './exceptions/statement-unique-title.exception';
import { EditStatementPayload } from './payloads/edit-statement.payload';
import { NewStatementPayload } from './payloads/new-statement.payload';
import { StatementEntity } from './statement.entity';

@Injectable()
export class StatementService {
  constructor(@InjectRepository(StatementEntity) private statementRepository: MongoRepository<StatementEntity>) {
  }

  async create(newStatementPayload: NewStatementPayload, systemId: ObjectId, sessionUserId: ObjectId, symbolDictionary: Record<string, SymbolEntity>): Promise<StatementEntity> {
    const { title, description, distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion } = newStatementPayload;

    this.processabilityCheck(distinctVariableRestrictions.map((distinctVariableRestriction: [string, string]): [ObjectId, ObjectId] => {
      const [first, second] = distinctVariableRestriction;

      return [
        new ObjectId(first),
        new ObjectId(second)
      ];
    }), variableTypeHypotheses.map((variableTypeHypothesis: [string, string]): [ObjectId, ObjectId] => {
      const [type, variable] = variableTypeHypothesis;

      return [
        new ObjectId(type),
        new ObjectId(variable)
      ];
    }), logicalHypotheses.map((logicalHypothesis: [string, ...string[]]): ObjectId[] => {
      return logicalHypothesis.map((symbolId: string): ObjectId => {
        return new ObjectId(symbolId);
      });
    }), assertion.map((symbolId: string): ObjectId => {
      return new ObjectId(symbolId);
    }), symbolDictionary);

    await this.conflictCheck(title, systemId);

    const statement = new StatementEntity();

    statement.title = title;
    statement.description = description;
    statement.distinctVariableRestrictions = distinctVariableRestrictions.map((distinctVariableRestriction: [string, string]): [ObjectId, ObjectId] => {
      const [first, second] = distinctVariableRestriction;

      return [
        new ObjectId(first),
        new ObjectId(second)
      ];
    });
    statement.variableTypeHypotheses = variableTypeHypotheses.map((variableTypeHypothesis: [string, string]): [ObjectId, ObjectId] => {
      const [type, variable] = variableTypeHypothesis;

      return [
        new ObjectId(type),
        new ObjectId(variable)
      ];
    });
    statement.logicalHypotheses = logicalHypotheses.map((logicalHypothesis: [string, ...string[]]): [ObjectId, ...ObjectId[]] => {
      const [prefix, ...expression] = logicalHypothesis;

      return [
        new ObjectId(prefix),
        ...expression.map((symbolId: string): ObjectId => {
          return new ObjectId(symbolId);
        })
      ];
    });
    const [prefix, ...expression] = assertion;
    statement.assertion = [
      new ObjectId(prefix),
      ...expression.map((symbolId: string): ObjectId => {
        return new ObjectId(symbolId);
      })
    ];
    statement.systemId = systemId;
    statement.createdByUserId = sessionUserId;

    return this.statementRepository.save(statement);
  }

  readById(systemId: ObjectId, statementId: ObjectId): Promise<StatementEntity | null> {
    return this.statementRepository.findOneBy({
      _id: statementId,
      systemId
    });
  }

  readStatements(page: number, count: number, keywords: string[], systemId: ObjectId): Promise<[StatementEntity[], number]> {
    const where = {
      systemId
    } as RootFilterOperators<StatementEntity>;

    if (0 !== keywords.length) {
      where.$text = {
        $caseSensitive: false,
        $search: keywords.join(',')
      };
    }

    return this.statementRepository.findAndCount({
      skip: (page - 1) * count,
      take: count,
      where
    });
  }

  async update(statement: StatementEntity, editStatementPayload: EditStatementPayload, symbolDictionary: Record<string, SymbolEntity>): Promise<StatementEntity> {
    const { title, systemId } = statement;
    const { newTitle, newDescription, newDistinctVariableRestrictions, newVariableTypeHypotheses, newLogicalHypotheses, newAssertion } = editStatementPayload;

    this.processabilityCheck(newDistinctVariableRestrictions, newVariableTypeHypotheses, newLogicalHypotheses, newAssertion, symbolDictionary);

    if (title !== newTitle) {
      await this.conflictCheck(newTitle, systemId);
    }

    statement.title = newTitle;
    statement.description = newDescription;
    statement.distinctVariableRestrictions = newDistinctVariableRestrictions;
    statement.variableTypeHypotheses = newVariableTypeHypotheses;
    statement.logicalHypotheses = newLogicalHypotheses.map((logicalHypothesis: ObjectId[]): [ObjectId, ...ObjectId[]] => {
      const [prefix, ...expression] = logicalHypothesis;

      return [
        prefix,
        ...expression
      ];
    });
    const [prefix, ...expression] = newAssertion;
    statement.assertion = [
      prefix,
      ...expression
    ];

    return this.statementRepository.save(statement);
  }

  delete(statement: StatementEntity): Promise<StatementEntity> {
    return this.statementRepository.remove(statement);
  }

  private async conflictCheck(title: string, systemId: ObjectId): Promise<void> {
    const collision = await this.statementRepository.findOneBy({
      title,
      systemId
    });

    if (collision) {
      throw new StatementUniqueTitleException();
    }
  }

  private processabilityCheck(distinctVariableRestrictions: [ObjectId, ObjectId][], variableTypeHypotheses: [ObjectId, ObjectId][], logicalHypotheses: ObjectId[][], assertion: ObjectId[], symbolDictionary: Record<string, SymbolEntity>): void {
    distinctVariableRestrictions.forEach((distinctVariableRestriction: [ObjectId, ObjectId]): void => {
      if (SymbolType.Variable !== symbolDictionary[distinctVariableRestriction[0].toString()].type) {
        throw new InvalidVariableTypeException();
      }

      if (SymbolType.Variable !== symbolDictionary[distinctVariableRestriction[1].toString()].type) {
        throw new InvalidVariableTypeException();
      }
    });

    const types = variableTypeHypotheses.reduce((types: Record<string, string>, variableTypeHypothesis: [ObjectId, ObjectId]): Record<string, string> => {
      const constant = variableTypeHypothesis[0].toString();
      const variable = variableTypeHypothesis[1].toString();

      if (SymbolType.Constant !== symbolDictionary[constant].type) {
        throw new InvalidVariableTypeException();
      }
      
      if (SymbolType.Variable !== symbolDictionary[variable].type) {
        throw new InvalidVariableTypeException();
      }

      types[variable] = constant;

      return types;
    }, {});

    [...logicalHypotheses, assertion].forEach((expression: ObjectId[]): void => {
      if (symbolDictionary[expression[0].toString()].type !== SymbolType.Constant) {
        throw new InvalidSymbolPrefixException();
      }

      expression.forEach((symbolId: ObjectId): void => {
        const id = symbolId.toString();

        if (SymbolType.Variable === symbolDictionary[id].type && !types[id]) {
          throw new MissingVariableTypeHypothesisException();
        }
      });
    });
  }
};
