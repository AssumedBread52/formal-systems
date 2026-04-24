import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolNotFoundException } from '@/symbol/exceptions/symbol-not-found.exception';
import { HttpException, Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';

@Injectable({
  scope: Scope.REQUEST
})
export class SymbolLoadingService {
  public constructor(@InjectRepository(SymbolEntity) private readonly repository: Repository<SymbolEntity>) {
  }

  public readonly loaderByIds = new DataLoader(async (symbolIds: readonly string[]): Promise<SymbolEntity[]> => {
    try {
      const symbols = await this.repository.findBy({
        id: In(symbolIds)
      });

      const symbolsMap = symbols.reduce((map: Map<string, SymbolEntity>, symbol: SymbolEntity): Map<string, SymbolEntity> => {
        if (!map.has(symbol.id)) {
          map.set(symbol.id, symbol);
        }

        return map;
      }, new Map<string, SymbolEntity>());

      return symbolIds.map((symbolId: string): SymbolEntity => {
        const symbol = symbolsMap.get(symbolId);

        if (!symbol) {
          throw new SymbolNotFoundException();
        }

        return symbol;
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Loading symbols by ID failed');
    }
  });

  public readonly loaderBySystemIds = new DataLoader(async (systemIds: readonly string[]): Promise<SymbolEntity[][]> => {
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
        const systemSymbols = symbolsMap.get(systemId);

        if (!systemSymbols) {
          return [];
        }

        return systemSymbols;
      });
    } catch {
      throw new InternalServerErrorException('Loading symbols by system ID failed');
    }
  });
};
