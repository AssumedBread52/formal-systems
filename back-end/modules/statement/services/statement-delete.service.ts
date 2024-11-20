import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { StatementEntity } from '@/statement/statement.entity';
import { InUseException } from '@/symbol/exceptions/in-use.exception';
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

    const { _id, proofAppearanceCount, createdByUserId } = statement;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    if (proofAppearanceCount > 0) {
      throw new InUseException();
    }

    await this.statementRepository.remove(statement);

    statement._id = _id;

    return statement;
  }
};
