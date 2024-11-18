import { BaseValidateService } from '@/common/services/base-validate.service';
import { InvalidSymbolPrefixException } from '@/statement/exceptions/invalid-symbol-prefix.exception';
import { InvalidVariableTypeException } from '@/statement/exceptions/invalid-variable-type.exception';
import { MissingVariableTypeHypothesisException } from '@/statement/exceptions/missing-variable-type-hypothesis.exception';
import { StatementUniqueTitleException } from '@/statement/exceptions/statement-unique-title.exception';
import { NewStatementPayload } from '@/statement/payloads/new-statement.payload';
import { StatementEntity } from '@/statement/statement.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolReadService } from '@/symbol/services/symbol-read.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';

@Injectable()
export class ValidateService extends BaseValidateService {
  constructor(@InjectRepository(StatementEntity) private statementRepository: MongoRepository<StatementEntity>, private symbolReadService: SymbolReadService) {
    super();
  }

  async conflictCheck(title: string, systemId: ObjectId): Promise<void> {
    const collision = await this.statementRepository.findOneBy({
      title,
      systemId
    });

    if (collision) {
      throw new StatementUniqueTitleException();
    }
  }

  async structureCheck(systemId: ObjectId, newStatementPayload: NewStatementPayload): Promise<void> {
    const { distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion } = newStatementPayload;

    const symbolIds = assertion.concat(...logicalHypotheses, ...variableTypeHypotheses, ...distinctVariableRestrictions);

    const symbolDictionary = await this.symbolReadService.addToSymbolDictionary(systemId, symbolIds.map((symbolId: string): ObjectId => {
      return new ObjectId(symbolId);
    }), {});

    distinctVariableRestrictions.forEach((distinctVariableRestriction: [string, string]): void => {
      const [first, second] = distinctVariableRestriction;

      if (SymbolType.Variable !== symbolDictionary[first].type) {
        throw new InvalidVariableTypeException();
      }

      if (SymbolType.Variable !== symbolDictionary[second].type) {
        throw new InvalidVariableTypeException();
      }
    });

    const types = variableTypeHypotheses.reduce((dictionary: Record<string, string>, variableTypeHypothesis: [string, string]): Record<string, string> => {
      const [type, variable] = variableTypeHypothesis;

      if (SymbolType.Constant !== symbolDictionary[type].type) {
        throw new InvalidVariableTypeException();
      }
      
      if (SymbolType.Variable !== symbolDictionary[variable].type) {
        throw new InvalidVariableTypeException();
      }

      dictionary[variable] = type;

      return dictionary;
    }, {});

    [...logicalHypotheses, assertion].forEach((prefixedExpression: [string, ...string[]]): void => {
      const [prefix, ...expression] = prefixedExpression;

      if (SymbolType.Constant !== symbolDictionary[prefix].type) {
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
