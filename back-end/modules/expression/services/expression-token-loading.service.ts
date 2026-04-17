import { ExpressionTokenEntity } from '@/expression/entities/expression-token.entity';
import { Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';

@Injectable({
  scope: Scope.REQUEST
})
export class ExpressionTokenLoadingService {
  public constructor(@InjectRepository(ExpressionTokenEntity) private readonly repository: Repository<ExpressionTokenEntity>) {
  }

  public readonly loaderBySymbolIds = new DataLoader(async (symbolIds: readonly string[]): Promise<ExpressionTokenEntity[][]> => {
    try {
      const expressionTokens = await this.repository.findBy({
        symbolId: In(symbolIds)
      });

      const expressionTokensMap = expressionTokens.reduce((map: Map<string, ExpressionTokenEntity[]>, expressionToken: ExpressionTokenEntity): Map<string, ExpressionTokenEntity[]> => {
        const expressionTokensWithSymbol = map.get(expressionToken.symbolId);

        if (!expressionTokensWithSymbol) {
          map.set(expressionToken.symbolId, [
            expressionToken
          ]);
        } else {
          expressionTokensWithSymbol.push(expressionToken);
        }

        return map;
      }, new Map<string, ExpressionTokenEntity[]>());

      return symbolIds.map((symbolId: string): ExpressionTokenEntity[] => {
        const symbolExpressionTokens = expressionTokensMap.get(symbolId);

        if (!symbolExpressionTokens) {
          return [];
        }

        return symbolExpressionTokens;
      });
    } catch {
      throw new InternalServerErrorException('Loading expression tokens by symbol ID failed');
    }
  });

  public readonly loaderBySystemIds = new DataLoader(async (systemIds: readonly string[]): Promise<ExpressionTokenEntity[][]> => {
    try {
      const expressionTokens = await this.repository.findBy({
        systemId: In(systemIds)
      });

      const expressionTokensMap = expressionTokens.reduce((map: Map<string, ExpressionTokenEntity[]>, expressionToken: ExpressionTokenEntity): Map<string, ExpressionTokenEntity[]> => {
        const expressionTokensInSystem = map.get(expressionToken.systemId);

        if (!expressionTokensInSystem) {
          map.set(expressionToken.systemId, [
            expressionToken
          ]);
        } else {
          expressionTokensInSystem.push(expressionToken);
        }

        return map;
      }, new Map<string, ExpressionTokenEntity[]>());

      return systemIds.map((systemId: string): ExpressionTokenEntity[] => {
        const systemExpressionTokens = expressionTokensMap.get(systemId);

        if (!systemExpressionTokens) {
          return [];
        }

        return systemExpressionTokens;
      });
    } catch {
      throw new InternalServerErrorException('Loading expression tokens by system ID failed');
    }
  });
};
