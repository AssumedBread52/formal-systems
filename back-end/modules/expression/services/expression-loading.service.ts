import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { ExpressionNotFoundException } from '@/expression/exceptions/expression-not-found.exception';
import { HttpException, Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';

@Injectable({
  scope: Scope.REQUEST
})
export class ExpressionLoadingService {
  public constructor(@InjectRepository(ExpressionEntity) private readonly repository: Repository<ExpressionEntity>) {
  }

  public readonly loaderByIds = new DataLoader(async (expressionIds: readonly string[]): Promise<ExpressionEntity[]> => {
    try {
      const expressions = await this.repository.findBy({
        id: In(expressionIds)
      });

      const expressionsMap = expressions.reduce((map: Map<string, ExpressionEntity>, expression: ExpressionEntity): Map<string, ExpressionEntity> => {
        if (!map.has(expression.id)) {
          map.set(expression.id, expression);
        }

        return map;
      }, new Map<string, ExpressionEntity>());

      return expressionIds.map((expressionId: string): ExpressionEntity => {
        const expression = expressionsMap.get(expressionId);

        if (!expression) {
          throw new ExpressionNotFoundException();
        }

        return expression;
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Loading expressions by ID failed');
    }
  });

  public readonly loaderBySystemIds = new DataLoader(async (systemIds: readonly string[]): Promise<ExpressionEntity[][]> => {
    try {
      const expressions = await this.repository.findBy({
        systemId: In(systemIds)
      });

      const expressionsMap = expressions.reduce((map: Map<string, ExpressionEntity[]>, expression: ExpressionEntity): Map<string, ExpressionEntity[]> => {
        const expressionsInSystem = map.get(expression.systemId);

        if (!expressionsInSystem) {
          map.set(expression.systemId, [
            expression
          ]);
        } else {
          expressionsInSystem.push(expression);
        }

        return map;
      }, new Map<string, ExpressionEntity[]>());

      return systemIds.map((systemId: string): ExpressionEntity[] => {
        const systemExpressions = expressionsMap.get(systemId);

        if (!systemExpressions) {
          return [];
        }

        return systemExpressions;
      });
    } catch {
      throw new InternalServerErrorException('Loading expressions by system ID failed');
    }
  });
};
