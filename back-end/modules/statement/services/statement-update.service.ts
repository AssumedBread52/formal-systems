import { StatementEntity } from '@/statement/statement.entity';
import { StatementService } from '@/statement/statement.service';
import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class StatementUpdateService {
  constructor(private statementService: StatementService) {
  }

  update(sessionUserId: ObjectId, containingSystemId: any, statementId: any, payload: any): Promise<StatementEntity> {
    return this.statementService.update(sessionUserId, containingSystemId, statementId, payload);
  }
};
