import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';

@Injectable({
  scope: Scope.REQUEST
})
export class DistinctVariablePairLoadingService {
  public constructor(@InjectRepository(DistinctVariablePairEntity) private readonly repository: Repository<DistinctVariablePairEntity>) {
  }

  public readonly loaderByStatementIds = new DataLoader(async (statementIds: readonly string[]): Promise<DistinctVariablePairEntity[][]> => {
    try {
      const distinctVariablePairs = await this.repository.findBy({
        statementId: In(statementIds)
      });

      const distinctVariablePairsMap = distinctVariablePairs.reduce((map: Map<string, DistinctVariablePairEntity[]>, distinctVariablePair: DistinctVariablePairEntity): Map<string, DistinctVariablePairEntity[]> => {
        const distinctVariablePairsInStatement = map.get(distinctVariablePair.statementId);

        if (!distinctVariablePairsInStatement) {
          map.set(distinctVariablePair.statementId, [
            distinctVariablePair
          ]);
        } else {
          distinctVariablePairsInStatement.push(distinctVariablePair);
        }

        return map;
      }, new Map<string, DistinctVariablePairEntity[]>());

      return statementIds.map((statementId: string): DistinctVariablePairEntity[] => {
        const statementDistinctVariablePairs = distinctVariablePairsMap.get(statementId);

        if (!statementDistinctVariablePairs) {
          return [];
        }

        return statementDistinctVariablePairs;
      });
    } catch {
      throw new InternalServerErrorException('Loading distinct variable pairs by statement ID failed');
    }
  });

  public readonly loaderBySystemIds = new DataLoader(async (systemIds: readonly string[]): Promise<DistinctVariablePairEntity[][]> => {
    try {
      const distinctVariablePairs = await this.repository.findBy({
        systemId: In(systemIds)
      });

      const distinctVariablePairsMap = distinctVariablePairs.reduce((map: Map<string, DistinctVariablePairEntity[]>, distinctVariablePair: DistinctVariablePairEntity): Map<string, DistinctVariablePairEntity[]> => {
        const distinctVariablePairsInSystem = map.get(distinctVariablePair.systemId);

        if (!distinctVariablePairsInSystem) {
          map.set(distinctVariablePair.systemId, [
            distinctVariablePair
          ]);
        } else {
          distinctVariablePairsInSystem.push(distinctVariablePair);
        }

        return map;
      }, new Map<string, DistinctVariablePairEntity[]>());

      return systemIds.map((systemId: string): DistinctVariablePairEntity[] => {
        const systemDistinctVariablePairs = distinctVariablePairsMap.get(systemId);

        if (!systemDistinctVariablePairs) {
          return [];
        }

        return systemDistinctVariablePairs;
      });
    } catch {
      throw new InternalServerErrorException('Loading distinct variable pairs by system ID failed');
    }
  });
};
