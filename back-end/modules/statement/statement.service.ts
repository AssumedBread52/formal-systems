import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository, RootFilterOperators } from 'typeorm';
import { NewStatementPayload } from './payloads/new-statement.payload';
import { PaginatedResultsPayload } from './payloads/paginated-results.payload';
import { StatementEntity } from './statement.entity';

@Injectable()
export class StatementService {
  constructor(@InjectRepository(StatementEntity) private statementRepository: MongoRepository<StatementEntity>) {
  }

  async create(newStatementPayload: NewStatementPayload, systemId: ObjectId, sessionUserId: ObjectId): Promise<StatementEntity> {
    const { title, description } = newStatementPayload;

    const statement = new StatementEntity();

    statement.title = title;
    statement.description = description;
    statement.systemId = systemId;
    statement.createdByUserId = sessionUserId;

    return this.statementRepository.save(statement);
  }

  async readStatements(page: number, count: number, keywords?: string | string[]): Promise<PaginatedResultsPayload> {
    const where = {} as RootFilterOperators<StatementEntity>;

    if (keywords && 0 !== keywords.length) {
      where.$text = {
        $caseSensitive: false,
        $search: Array.isArray(keywords) ? keywords.join(',') : keywords
      };
    }

    const [results, total] = await this.statementRepository.findAndCount({
      skip: (page - 1) * count,
      take: count,
      where
    });

    return new PaginatedResultsPayload(total, results);
  }
};
