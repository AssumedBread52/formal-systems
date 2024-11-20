import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolReadService } from '@/symbol/services/symbol-read.service';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { InvalidSymbolPrefixException } from './exceptions/invalid-symbol-prefix.exception';
import { InvalidVariableTypeException } from './exceptions/invalid-variable-type.exception';
import { MissingVariableTypeHypothesisException } from './exceptions/missing-variable-type-hypothesis.exception';
import { StatementUniqueTitleException } from './exceptions/statement-unique-title.exception';
import { EditStatementPayload } from './payloads/edit-statement.payload';
import { StatementEntity } from './statement.entity';
import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { StatementNotFoundException } from './exceptions/statement-not-found.exception';
import { isMongoId, validateSync } from 'class-validator';
import { InvalidObjectIdException } from '@/common/exceptions/invalid-object-id.exception';
import { plainToClass } from 'class-transformer';

@Injectable()
export class StatementService {
  constructor(@InjectRepository(StatementEntity) private statementRepository: MongoRepository<StatementEntity>, private symbolReadService: SymbolReadService) {
  }

  readById(systemId: ObjectId, statementId: ObjectId): Promise<StatementEntity | null> {
    return this.statementRepository.findOneBy({
      _id: statementId,
      systemId
    });
  }

  async update(sessionUserId: ObjectId, containingSystemId: any, statementId: any, payload: any): Promise<StatementEntity> {
    if (!isMongoId(containingSystemId) || !isMongoId(statementId)) {
      throw new InvalidObjectIdException();
    }

    const editStatementPayload = plainToClass(EditStatementPayload, payload);

    const errors = validateSync(editStatementPayload);

    if (0 !== errors.length) {
      throw new BadRequestException();
    }

    const statement = await this.readById(new ObjectId(containingSystemId), new ObjectId(statementId));

    if (!statement) {
      throw new StatementNotFoundException();
    }

    const { title, systemId, createdByUserId } = statement;
    const { newTitle, newDescription, newDistinctVariableRestrictions, newVariableTypeHypotheses, newLogicalHypotheses, newAssertion } = editStatementPayload;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    const symbolIds = newAssertion.concat(...newDistinctVariableRestrictions, ...newVariableTypeHypotheses, ...newLogicalHypotheses);


    const symbolDictionary = await this.symbolReadService.addToSymbolDictionary(systemId, symbolIds, {});

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
