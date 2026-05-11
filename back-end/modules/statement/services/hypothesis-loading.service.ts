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

  public readonly loaderByExpressionIds = new DataLoader(async (expressionIds: readonly string[]): Promise<HypothesisEntity[][]> => {
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

  public readonly loaderBySystemIds = new DataLoader(async (systemIds: readonly string[]): Promise<HypothesisEntity[][]> => {
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
