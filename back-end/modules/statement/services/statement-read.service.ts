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
