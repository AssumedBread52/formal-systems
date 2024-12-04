import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { InUseException } from '@/statement/exceptions/in-use.exception';
import { StatementEntity } from '@/statement/statement.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { StatementReadService } from './statement-read.service';

@Injectable()
export class StatementDeleteService {
  constructor(@InjectRepository(StatementEntity) private statementRepository: MongoRepository<StatementEntity>, private statementReadService: StatementReadService) {
  }

  async delete(sessionUserId: ObjectId, systemId: any, statementId: any): Promise<StatementEntity> {
    const statement = await this.statementReadService.readById(systemId, statementId);

    const { _id, proofCount, proofAppearanceCount, createdByUserId } = statement;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    if (proofCount > 0 || proofAppearanceCount > 0) {
      throw new InUseException();
    }

    await this.statementRepository.remove(statement);

    statement._id = _id;

    return statement;
  }
};
