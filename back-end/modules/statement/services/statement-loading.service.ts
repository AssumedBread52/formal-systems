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

  public readonly loaderByExpressionIds = new DataLoader(async (expressionIds: readonly string[]): Promise<StatementEntity[][]> => {
    try {
      const statements = await this.repository.findBy({
        assertionExpressionId: In(expressionIds)
      });

      const statementsMap = statements.reduce((map: Map<string, StatementEntity[]>, statement: StatementEntity): Map<string, StatementEntity[]> => {
        const statementsAssertingExpression = map.get(statement.assertionExpressionId);

        if (!statementsAssertingExpression) {
          map.set(statement.assertionExpressionId, [
            statement
          ]);
        } else {
          statementsAssertingExpression.push(statement);
        }

        return map;
      }, new Map<string, StatementEntity[]>());

      return expressionIds.map((expressionId: string): StatementEntity[] => {
        const expressionStatements = statementsMap.get(expressionId);

        if (!expressionStatements) {
          return [];
        }

        return expressionStatements;
      });
    } catch {
      throw new InternalServerErrorException('Loading statements by expression ID failed');
    }
  });

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
