import { validatePayload } from '@/common/helpers/validate-payload';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { StatementNotFoundException } from '@/statement/exceptions/statement-not-found.exception';
import { PaginatedStatementsPayload } from '@/statement/payloads/paginated-statements.payload';
import { SearchStatementsPayload } from '@/statement/payloads/search-statements.payload';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';

@Injectable()
export class StatementReadService {
  public constructor(@InjectRepository(StatementEntity) private readonly repository: Repository<StatementEntity>) {
  }

  public async searchStatements(systemId: string, searchStatementsPayload: SearchStatementsPayload): Promise<PaginatedStatementsPayload> {
    try {
      const validatedSearchStatementsPayload = validatePayload(searchStatementsPayload, SearchStatementsPayload);

      const take = validatedSearchStatementsPayload.pageSize;
      const skip = (validatedSearchStatementsPayload.page - 1) * validatedSearchStatementsPayload.pageSize;

      const where = [] as FindOptionsWhere<StatementEntity>[];
      const textFilter = ILike(`%${validatedSearchStatementsPayload.searchText}%`);
      if (0 < validatedSearchStatementsPayload.searchText.length) {
        where.push({
          systemId,
          name: textFilter
        });
        where.push({
          systemId,
          description: textFilter
        });
      } else {
        where.push({
          systemId
        });
      }

      const [statements, total] = await this.repository.findAndCount({
        skip,
        take,
        where
      });

      return new PaginatedStatementsPayload(statements, total);
    } catch {
      throw new InternalServerErrorException('Reading statements failed');
    }
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

  public async verifyExists(systemId: string, statementId: string): Promise<void> {
    try {
      const exists = await this.repository.existsBy({
        id: statementId,
        systemId
      });

      if (!exists) {
        throw new StatementNotFoundException();
      }
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Verifying statement existence failed');
    }
  }
};
