import { BaseValidateService } from '@/common/services/base-validate.service';
import { InvalidSymbolTypeException } from '@/statement/exceptions/invalid-symbol-type.exception';
import { MissingVariableTypeHypothesisException } from '@/statement/exceptions/missing-variable-type-hypothesis.exception';
import { StatementUniqueTitleException } from '@/statement/exceptions/statement-unique-title.exception';
import { EditStatementPayload } from '@/statement/payloads/edit-statement.payload';
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

  async newStructureCheck(systemId: ObjectId, newStatementPayload: NewStatementPayload): Promise<void> {
    const { distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion } = newStatementPayload;

    await this.structureCheck(systemId, distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion);
  }

  async editStructureCheck(systemId: ObjectId, editStatementPayload: EditStatementPayload): Promise<void> {
    const { newDistinctVariableRestrictions, newVariableTypeHypotheses, newLogicalHypotheses, newAssertion } = editStatementPayload;

    await this.structureCheck(systemId, newDistinctVariableRestrictions, newVariableTypeHypotheses, newLogicalHypotheses, newAssertion);
  }

  private async structureCheck(systemId: ObjectId, distinctVariableRestrictions: [string, string][], variableTypeHypotheses: [string, string][], logicalHypotheses: [string, ...string[]][], assertion: [string, ...string[]]): Promise<void> {
    const symbolIds = assertion.concat(...logicalHypotheses, ...variableTypeHypotheses, ...distinctVariableRestrictions);

    const symbolDictionary = await this.symbolReadService.addToSymbolDictionary(systemId, symbolIds.map((symbolId: string): ObjectId => {
      return new ObjectId(symbolId);
    }), {});

    distinctVariableRestrictions.forEach((distinctVariableRestriction: [string, string]): void => {
      const [first, second] = distinctVariableRestriction;

      if (SymbolType.Variable !== symbolDictionary[first].type) {
        throw new InvalidSymbolTypeException();
      }

      if (SymbolType.Variable !== symbolDictionary[second].type) {
        throw new InvalidSymbolTypeException();
      }
    });

    const types = variableTypeHypotheses.reduce((dictionary: Record<string, string>, variableTypeHypothesis: [string, string]): Record<string, string> => {
      const [type, variable] = variableTypeHypothesis;

      if (SymbolType.Constant !== symbolDictionary[type].type) {
        throw new InvalidSymbolTypeException();
      }

      if (SymbolType.Variable !== symbolDictionary[variable].type) {
        throw new InvalidSymbolTypeException();
      }

      dictionary[variable] = type;

      return dictionary;
    }, {});

    [...logicalHypotheses, assertion].forEach((prefixedExpression: [string, ...string[]]): void => {
      const [prefix, ...expression] = prefixedExpression;

      if (SymbolType.Constant !== symbolDictionary[prefix].type) {
        throw new InvalidSymbolTypeException();
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
