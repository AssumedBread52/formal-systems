import { StatementEntity } from '@/statement/entities/statement.entity';
import { Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';

@Injectable({
  scope: Scope.REQUEST
})
export class StatementLoadingService {
  public constructor(@InjectRepository(StatementEntity) private readonly repository: Repository<StatementEntity>) {
  }

  public readonly loaderBySystemIds = new DataLoader(async (systemIds: readonly string[]): Promise<StatementEntity[][]> => {
    try {
      const statements = await this.repository.findBy({
        systemId: In(systemIds)
      });

      const statementsMap = statements.reduce((map: Map<string, StatementEntity[]>, statement: StatementEntity): Map<string, StatementEntity[]> => {
        const statementsInSystem = map.get(statement.systemId);

        if (!statementsInSystem) {
          map.set(statement.systemId, [
            statement
          ]);
        } else {
          statementsInSystem.push(statement);
        }

        return map;
      }, new Map<string, StatementEntity[]>());

      return systemIds.map((systemId: string): StatementEntity[] => {
        const systemStatements = statementsMap.get(systemId);

        if (!systemStatements) {
          return [];
        }

        return systemStatements;
      });
    } catch {
      throw new InternalServerErrorException('Loading statements by system ID failed');
    }
  });
};
