import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';

@Injectable({
  scope: Scope.REQUEST
})
export class HypothesisLoadingService {
  public constructor(@InjectRepository(HypothesisEntity) private readonly repository: Repository<HypothesisEntity>) {
  }

  public loadByExpressionId(expressionId: string): Promise<HypothesisEntity[]> {
    return this.loaderByExpressionIds.load(expressionId);
  }

  public loadByStatementId(statementId: string): Promise<HypothesisEntity[]> {
    return this.loaderByStatementIds.load(statementId);
  }

  public loadBySystemId(systemId: string): Promise<HypothesisEntity[]> {
    return this.loaderBySystemIds.load(systemId);
  }

  private readonly loaderByExpressionIds = new DataLoader(async (expressionIds: readonly string[]): Promise<HypothesisEntity[][]> => {
    try {
      const hypotheses = await this.repository.findBy({
        expressionId: In(expressionIds)
      });

      const hypothesesMap = hypotheses.reduce((map: Map<string, HypothesisEntity[]>, hypothesis: HypothesisEntity): Map<string, HypothesisEntity[]> => {
        const hypothesesWithExpression = map.get(hypothesis.expressionId);

        if (!hypothesesWithExpression) {
          map.set(hypothesis.expressionId, [
            hypothesis
          ]);
        } else {
          hypothesesWithExpression.push(hypothesis);
        }

        return map;
      }, new Map<string, HypothesisEntity[]>());

      return expressionIds.map((expressionId: string): HypothesisEntity[] => {
        const expressionHypotheses = hypothesesMap.get(expressionId);

        if (!expressionHypotheses) {
          return [];
        }

        return expressionHypotheses;
      });
    } catch {
      throw new InternalServerErrorException('Loading hypotheses by expression ID failed');
    }
  });

  private readonly loaderByStatementIds = new DataLoader(async (statementIds: readonly string[]): Promise<HypothesisEntity[][]> => {
    try {
      const hypotheses = await this.repository.findBy({
        statementId: In(statementIds)
      });

      const hypothesesMap = hypotheses.reduce((map: Map<string, HypothesisEntity[]>, hypothesis: HypothesisEntity): Map<string, HypothesisEntity[]> => {
        const hypothesesForStatement = map.get(hypothesis.statementId);

        if (!hypothesesForStatement) {
          map.set(hypothesis.statementId, [
            hypothesis
          ]);
        } else {
          hypothesesForStatement.push(hypothesis);
        }

        return map;
      }, new Map<string, HypothesisEntity[]>());

      return statementIds.map((statementId: string): HypothesisEntity[] => {
        const statementHypotheses = hypothesesMap.get(statementId);

        if (!statementHypotheses) {
          return [];
        }

        return statementHypotheses;
      });
    } catch {
      throw new InternalServerErrorException('Loading hypotheses by statement ID failed');
    }
  });

  private readonly loaderBySystemIds = new DataLoader(async (systemIds: readonly string[]): Promise<HypothesisEntity[][]> => {
    try {
      const hypotheses = await this.repository.findBy({
        systemId: In(systemIds)
      });

      const hypothesesMap = hypotheses.reduce((map: Map<string, HypothesisEntity[]>, hypothesis: HypothesisEntity): Map<string, HypothesisEntity[]> => {
        const hypothesesInSystem = map.get(hypothesis.systemId);

        if (!hypothesesInSystem) {
          map.set(hypothesis.systemId, [
            hypothesis
          ]);
        } else {
          hypothesesInSystem.push(hypothesis);
        }

        return map;
      }, new Map<string, HypothesisEntity[]>());

      return systemIds.map((systemId: string): HypothesisEntity[] => {
        const systemHypotheses = hypothesesMap.get(systemId);

        if (!systemHypotheses) {
          return [];
        }

        return systemHypotheses;
      });
    } catch {
      throw new InternalServerErrorException('Loading hypotheses by system ID failed');
    }
  });
};
