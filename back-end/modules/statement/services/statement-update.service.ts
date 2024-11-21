import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { EditStatementPayload } from '@/statement/payloads/edit-statement.payload';
import { StatementEntity } from '@/statement/statement.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { StatementReadService } from './statement-read.service';
import { ValidateService } from './validate.service';

@Injectable()
export class StatementUpdateService {
  constructor(@InjectRepository(StatementEntity) private statementRepository: MongoRepository<StatementEntity>, private statementReadService: StatementReadService, private validateService: ValidateService) {
  }

  async update(sessionUserId: ObjectId, containingSystemId: any, statementId: any, payload: any): Promise<StatementEntity> {
    const statement = await this.statementReadService.readById(containingSystemId, statementId);

    const { title, systemId, createdByUserId } = statement;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    const editStatementPayload = this.validateService.payloadCheck(payload, EditStatementPayload);

    const { newTitle, newDescription, newDistinctVariableRestrictions, newVariableTypeHypotheses, newLogicalHypotheses, newAssertion } = editStatementPayload;

    if (title !== newTitle) {
      await this.validateService.conflictCheck(newTitle, systemId);
    }

    await this.validateService.editStructureCheck(systemId, editStatementPayload);

    const [newPrefix, ...newExpression] = newAssertion;

    statement.title = newTitle;
    statement.description = newDescription;
    statement.distinctVariableRestrictions = newDistinctVariableRestrictions.map((newDistinctVariableRestriction: [string, string]): [ObjectId, ObjectId] => {
      const [newFirst, newSecond] = newDistinctVariableRestriction;

      return [
        new ObjectId(newFirst),
        new ObjectId(newSecond)
      ];
    });
    statement.variableTypeHypotheses = newVariableTypeHypotheses.map((newVariableTypeHypothesis: [string, string]): [ObjectId, ObjectId] => {
      const [newType, newVariable] = newVariableTypeHypothesis;

      return [
        new ObjectId(newType),
        new ObjectId(newVariable)
      ];
    });
    statement.logicalHypotheses = newLogicalHypotheses.map((newLogicalHypothesis: [string, ...string[]]): [ObjectId, ...ObjectId[]] => {
      const [newPrefix, ...newExpression] = newLogicalHypothesis;

      return [
        new ObjectId(newPrefix),
        ...newExpression.map((newSymbolId: string): ObjectId => {
          return new ObjectId(newSymbolId);
        })
      ];
    });
    statement.assertion = [
      new ObjectId(newPrefix),
      ...newExpression.map((newSymbolId: string): ObjectId => {
        return new ObjectId(newSymbolId);
      })
    ];

    return this.statementRepository.save(statement);
  }
};
