import { StatementNotFoundException } from '@/statement/exceptions/statement-not-found.exception';
import { SearchPayload } from '@/statement/payloads/search.payload';
import { StatementEntity } from '@/statement/statement.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, RootFilterOperators } from 'typeorm';
import { ValidateService } from './validate.service';

@Injectable()
export class StatementReadService {
  constructor(@InjectRepository(StatementEntity) private statementRepository: MongoRepository<StatementEntity>, private validateService: ValidateService) {
  }

  async readById(systemId: any, statementId: any): Promise<StatementEntity> {
    const statement = await this.statementRepository.findOneBy({
      _id: this.validateService.idCheck(statementId),
      systemId: this.validateService.idCheck(systemId)
    });

    if (!statement) {
      throw new StatementNotFoundException();
    }

    return statement;
  }

  readStatements(containingSystemId: any, payload: any): Promise<[StatementEntity[], number]> {
    const searchPayload = this.validateService.payloadCheck(payload, SearchPayload);
    const systemId = this.validateService.idCheck(containingSystemId);

    const { page, count, keywords } = searchPayload;
    const where = {
      systemId
    } as RootFilterOperators<StatementEntity>;

    if (0 !== keywords.length) {
      where.$text = {
        $caseSensitive: false,
        $search: keywords.join(',')
      };
    }

    return this.statementRepository.findAndCount({
      skip: (page - 1) * count,
      take: count,
      where
    });
  }
};
