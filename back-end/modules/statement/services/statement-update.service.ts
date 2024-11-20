import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { EditStatementPayload } from '@/statement/payloads/edit-statement.payload';
import { StatementEntity } from '@/statement/statement.entity';
import { StatementService } from '@/statement/statement.service';
import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { StatementReadService } from './statement-read.service';
import { ValidateService } from './validate.service';

@Injectable()
export class StatementUpdateService {
  constructor(private statementReadService: StatementReadService, private statementService: StatementService, private validateService: ValidateService) {
  }

  async update(sessionUserId: ObjectId, containingSystemId: any, statementId: any, payload: any): Promise<StatementEntity> {
    const statement = await this.statementReadService.readById(containingSystemId, statementId);

    const { createdByUserId } = statement;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    const editStatementPayload = this.validateService.payloadCheck(payload, EditStatementPayload);

    return this.statementService.update(statement, editStatementPayload);
  }
};
