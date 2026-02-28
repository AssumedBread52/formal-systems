import { validatePayload } from '@/common/helpers/validate-payload';
import { DistinctVariablePairEntity } from '@/distinct-variable-pair/entities/distinct-variable-pair.entity';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { ExpressionType } from '@/expression/enums/expression-type.enum';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolNotFoundException } from '@/symbol/exceptions/symbol-not-found.exception';
import { SymbolRepository } from '@/symbol/repositories/symbol.repository';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class CountListener {
  public constructor(private readonly symbolRepository: SymbolRepository) {
  }

  @OnEvent('distinct-variable-pair.create.completed', {
    suppressErrors: false
  })
  public async incrementDistinctVariablePairAppearanceCount(distinctVariablePair: DistinctVariablePairEntity): Promise<void> {
    try {
      const validatedDistinctVariablePair = validatePayload(distinctVariablePair, DistinctVariablePairEntity);

      const symbols = await this.symbolRepository.find({
        ids: validatedDistinctVariablePair.variableSymbolIds,
        systemId: validatedDistinctVariablePair.systemId
      });

      if (validatedDistinctVariablePair.variableSymbolIds.length !== symbols.length) {
        throw new SymbolNotFoundException();
      }

      await Promise.all(symbols.map(async (symbol: SymbolEntity): Promise<SymbolEntity> => {
        symbol.distinctVariablePairAppearanceCount++;

        return this.symbolRepository.save(symbol);
      }));
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating distinct variable pair appearance count on symbol failed');
    }
  }

  @OnEvent('distinct-variable-pair.delete.completed', {
    suppressErrors: false
  })
  public async decrementDistinctVariablePairAppearanceCount(distinctVariablePair: DistinctVariablePairEntity): Promise<void> {
    try {
      const validatedDistinctVariablePair = validatePayload(distinctVariablePair, DistinctVariablePairEntity);

      const symbols = await this.symbolRepository.find({
        ids: validatedDistinctVariablePair.variableSymbolIds,
        systemId: validatedDistinctVariablePair.systemId
      });

      if (validatedDistinctVariablePair.variableSymbolIds.length !== symbols.length) {
        throw new SymbolNotFoundException();
      }

      await Promise.all(symbols.map(async (symbol: SymbolEntity): Promise<SymbolEntity> => {
        symbol.distinctVariablePairAppearanceCount--;

        return this.symbolRepository.save(symbol);
      }));
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating distinct variable pair appearance count on symbol failed');
    }
  }

  @OnEvent('expression.create.completed', {
    suppressErrors: false
  })
  public async incrementExpressionAppearanceCount(expression: ExpressionEntity): Promise<void> {
    try {
      const validatedExpression = validatePayload(expression, ExpressionEntity);

      const uniqueSymbolIds = validatedExpression.symbolIds.reduce((uniqueIds: string[], symbolId: string): string[] => {
        if (!uniqueIds.includes(symbolId)) {
          uniqueIds.push(symbolId);
        }

        return uniqueIds;
      }, []);

      const symbols = await this.symbolRepository.find({
        ids: uniqueSymbolIds,
        systemId: validatedExpression.systemId
      });

      if (uniqueSymbolIds.length !== symbols.length) {
        throw new SymbolNotFoundException();
      }

      await Promise.all(symbols.map(async (symbol: SymbolEntity): Promise<SymbolEntity> => {
        switch (validatedExpression.type) {
          case ExpressionType.constant_variable_pair:
            symbol.constantVariablePairExpressionAppearanceCount++;
            break;
          case ExpressionType.constant_prefixed:
            symbol.constantPrefixedExpressionAppearanceCount++;
            break;
          case ExpressionType.standard:
            symbol.standardExpressionAppearanceCount++;
            break;
        }

        return this.symbolRepository.save(symbol);
      }));
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating expression appearance count on symbol failed');
    }
  }

  @OnEvent('expression.delete.completed', {
    suppressErrors: false
  })
  public async decrementExpressionAppearanceCount(expression: ExpressionEntity): Promise<void> {
    try {
      const validatedExpression = validatePayload(expression, ExpressionEntity);

      const uniqueSymbolIds = validatedExpression.symbolIds.reduce((uniqueIds: string[], symbolId: string): string[] => {
        if (!uniqueIds.includes(symbolId)) {
          uniqueIds.push(symbolId);
        }

        return uniqueIds;
      }, []);

      const symbols = await this.symbolRepository.find({
        ids: uniqueSymbolIds,
        systemId: validatedExpression.systemId
      });

      if (uniqueSymbolIds.length !== symbols.length) {
        throw new SymbolNotFoundException();
      }

      await Promise.all(symbols.map(async (symbol: SymbolEntity): Promise<SymbolEntity> => {
        switch (validatedExpression.type) {
          case ExpressionType.constant_variable_pair:
            symbol.constantVariablePairExpressionAppearanceCount--;
            break;
          case ExpressionType.constant_prefixed:
            symbol.constantPrefixedExpressionAppearanceCount--;
            break;
          case ExpressionType.standard:
            symbol.standardExpressionAppearanceCount--;
            break;
        }

        return this.symbolRepository.save(symbol);
      }));
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating expression appearance count on symbol failed');
    }
  }
};
