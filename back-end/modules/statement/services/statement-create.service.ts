import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { InvalidSymbolPrefixException } from '@/statement/exceptions/invalid-symbol-prefix.exception';
import { InvalidVariableTypeException } from '@/statement/exceptions/invalid-variable-type.exception';
import { MissingVariableTypeHypothesisException } from '@/statement/exceptions/missing-variable-type-hypothesis.exception';
import { StatementUniqueTitleException } from '@/statement/exceptions/statement-unique-title.exception';
import { NewStatementPayload } from '@/statement/payloads/new-statement.payload';
import { StatementEntity } from '@/statement/statement.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolReadService } from '@/symbol/services/symbol-read.service';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { SystemEntity } from '@/system/system.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';

@Injectable()
export class StatementCreateService {
  constructor(@InjectRepository(StatementEntity) private statementRepository: MongoRepository<StatementEntity>, @InjectRepository(SystemEntity) private systemRepository: MongoRepository<SystemEntity>, private symbolReadService: SymbolReadService) {
  }

  async create(sessionUserId: ObjectId, systemId: any, payload: NewStatementPayload): Promise<StatementEntity> {
    const system = await this.systemRepository.findOneBy({
      _id: systemId
    });

    if (!system) {
      throw new SystemNotFoundException();
    }

    const { createdByUserId } = system;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    const { title, description, distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion } = payload;

    const symbolIds = assertion.concat(...distinctVariableRestrictions, ...variableTypeHypotheses, ...logicalHypotheses);

    const symbolDictionary = await this.symbolReadService.addToSymbolDictionary(systemId, symbolIds.map((symbolId: string): ObjectId => {
      return new ObjectId(symbolId);
    }), {});

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
