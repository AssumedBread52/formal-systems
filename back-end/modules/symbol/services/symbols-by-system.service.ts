import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';

@Injectable({
  scope: Scope.REQUEST
})
export class SymbolsBySystemService {
  public constructor(@InjectRepository(SymbolEntity) private readonly repository: Repository<SymbolEntity>) {
  }

  public readonly loader = new DataLoader(async (systemIds: readonly string[]): Promise<SymbolEntity[][]> => {
    try {
      const symbols = await this.repository.findBy({
        systemId: In(systemIds)
      });

      const symbolsMap = symbols.reduce((map: Map<string, SymbolEntity[]>, symbol: SymbolEntity): Map<string, SymbolEntity[]> => {
        const symbolsInSystem = map.get(symbol.systemId);

        if (!symbolsInSystem) {
          map.set(symbol.systemId, [
            symbol
          ]);
        } else {
          symbolsInSystem.push(symbol);
        }

        return map;
      }, new Map<string, SymbolEntity[]>());

      return systemIds.map((systemId: string): SymbolEntity[] => {
        const symbols = symbolsMap.get(systemId);

        if (!symbols) {
          return [];
        }

        return symbols;
      });
    } catch {
      throw new InternalServerErrorException('Loading symbols failed');
    }
  });
};
