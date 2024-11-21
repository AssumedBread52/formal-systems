import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { EditStatementPayload } from './payloads/edit-statement.payload';
import { StatementEntity } from './statement.entity';

@Injectable()
export class StatementService {
  constructor(@InjectRepository(StatementEntity) private statementRepository: MongoRepository<StatementEntity>) {
  }

  async update(statement: StatementEntity, editStatementPayload: EditStatementPayload): Promise<StatementEntity> {
    const { newTitle, newDescription, newDistinctVariableRestrictions, newVariableTypeHypotheses, newLogicalHypotheses, newAssertion } = editStatementPayload;

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
};
