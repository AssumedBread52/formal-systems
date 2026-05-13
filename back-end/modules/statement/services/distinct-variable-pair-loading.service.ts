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
