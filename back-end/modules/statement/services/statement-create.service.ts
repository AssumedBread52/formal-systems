import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { NewStatementPayload } from '@/statement/payloads/new-statement.payload';
import { StatementEntity } from '@/statement/statement.entity';
import { SystemReadService } from '@/system/services/system-read.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { ValidateService } from './validate.service';

@Injectable()
export class StatementCreateService {
  constructor(@InjectRepository(StatementEntity) private statementRepository: MongoRepository<StatementEntity>, private systemReadService: SystemReadService, private validateService: ValidateService) {
  }

  async create(sessionUserId: ObjectId, systemId: any, payload: any): Promise<StatementEntity> {
    const { _id, createdByUserId } = await this.systemReadService.readById(systemId);

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    const newStatementPayload = this.validateService.payloadCheck(payload, NewStatementPayload);

    const { title, description, distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion } = newStatementPayload;

    await this.validateService.conflictCheck(title, _id);

    await this.validateService.newStructureCheck(_id, newStatementPayload);

    const [prefix, ...expression] = assertion;

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
    statement.assertion = [
      new ObjectId(prefix),
      ...expression.map((symbolId: string): ObjectId => {
        return new ObjectId(symbolId);
      })
    ];
    statement.systemId = _id;
    statement.createdByUserId = sessionUserId;

    return this.statementRepository.save(statement);
  }
};
