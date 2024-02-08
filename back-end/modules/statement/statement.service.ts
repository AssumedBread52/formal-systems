import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { NewStatementPayload } from './payloads/new-statement.payload';
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
};
