import { StatementEntity } from '@/statement/entities/statement.entity';
import { StatementNotFoundException } from '@/statement/exceptions/statement-not-found.exception';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class StatementReadService {
  public constructor(@InjectRepository(StatementEntity) private readonly repository: Repository<StatementEntity>) {
  }

  public async selectById(systemId: string, statementId: string): Promise<StatementEntity> {
    try {
      const statement = await this.repository.findOneBy({
        id: statementId,
        systemId
      });

      if (!statement) {
        throw new StatementNotFoundException();
      }

      return statement;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Reading statement failed');
    }
  }
};
