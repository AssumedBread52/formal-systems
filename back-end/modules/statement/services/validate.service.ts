import { BaseValidateService } from '@/common/services/base-validate.service';
import { StatementUniqueTitleException } from '@/statement/exceptions/statement-unique-title.exception';
import { StatementEntity } from '@/statement/statement.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';

@Injectable()
export class ValidateService extends BaseValidateService {
  constructor(@InjectRepository(StatementEntity) private statementRepository: MongoRepository<StatementEntity>) {
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
};
