import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository, RootFilterOperators } from 'typeorm';
import { EditStatementPayload } from './payloads/edit-statement.payload';
import { NewStatementPayload } from './payloads/new-statement.payload';
import { PaginatedResultsPayload } from './payloads/paginated-results.payload';
import { StatementEntity } from './statement.entity';

@Injectable()
export class StatementService {
  constructor(@InjectRepository(StatementEntity) private statementRepository: MongoRepository<StatementEntity>) {
  }

  create(newStatementPayload: NewStatementPayload, systemId: ObjectId, sessionUserId: ObjectId): Promise<StatementEntity> {
    const { title, description, distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion } = newStatementPayload;

    const statement = new StatementEntity();

    statement.title = title;
    statement.description = description;
    statement.distinctVariableRestrictions = distinctVariableRestrictions;
    statement.variableTypeHypotheses = variableTypeHypotheses;
    statement.logicalHypotheses = logicalHypotheses;
    statement.assertion = assertion;
    statement.systemId = systemId;
    statement.createdByUserId = sessionUserId;

    return this.statementRepository.save(statement);
  }

  readById(systemId: ObjectId, statementId: ObjectId): Promise<StatementEntity | null> {
    return this.statementRepository.findOneBy({
      _id: statementId,
      systemId
    });
  }

  async readStatements(systemId: ObjectId, page: number, count: number, keywords?: string | string[]): Promise<PaginatedResultsPayload> {
    const where = {
      systemId
    } as RootFilterOperators<StatementEntity>;

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

  update(statement: StatementEntity, editStatementPayload: EditStatementPayload): Promise<StatementEntity> {
    const { newTitle, newDescription } = editStatementPayload;

    statement.title = newTitle;
    statement.description = newDescription;

    return this.statementRepository.save(statement);
  }

  delete(statement: StatementEntity): Promise<StatementEntity> {
    return this.statementRepository.remove(statement);
  }
};
