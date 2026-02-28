import { validatePayload } from '@/common/helpers/validate-payload';
import { DistinctVariablePairEntity } from '@/distinct-variable-pair/entities/distinct-variable-pair.entity';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { ExpressionType } from '@/expression/enums/expression-type.enum';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { SystemRepository } from '@/system/repositories/system.repository';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class CountListener {
  public constructor(private readonly systemRepository: SystemRepository) {
  }

  @OnEvent('distinct-variable-pair.create.completed', {
    suppressErrors: false
  })
  public async incrementDistinctVariablePairCount(distinctVariablePair: DistinctVariablePairEntity): Promise<void> {
    try {
      const validatedDistinctVariablePair = validatePayload(distinctVariablePair, DistinctVariablePairEntity);

      const system = await this.systemRepository.findOneBy({
        id: validatedDistinctVariablePair.systemId
      });

      if (!system) {
        throw new SystemNotFoundException();
      }

      system.distinctVariablePairCount++;

      await this.systemRepository.save(system);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating distinct variable pair count on system failed');
    }
  }

  @OnEvent('distinct-variable-pair.delete.completed', {
    suppressErrors: false
  })
  public async decrementDistinctVariablePairCount(distinctVariablePair: DistinctVariablePairEntity): Promise<void> {
    try {
      const validatedDistinctVariablePair = validatePayload(distinctVariablePair, DistinctVariablePairEntity);

      const system = await this.systemRepository.findOneBy({
        id: validatedDistinctVariablePair.systemId
      });

      if (!system) {
        throw new SystemNotFoundException();
      }

      system.distinctVariablePairCount--;

      await this.systemRepository.save(system);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating distinct variable pair count on system failed');
    }
  }

  @OnEvent('expression.create.completed', {
    suppressErrors: false
  })
  public async incrementExpressionCount(expression: ExpressionEntity): Promise<void> {
    try {
      const validatedExpression = validatePayload(expression, ExpressionEntity);

      const system = await this.systemRepository.findOneBy({
        id: validatedExpression.systemId
      });

      if (!system) {
        throw new SystemNotFoundException();
      }

      switch (validatedExpression.type) {
        case ExpressionType.constant_variable_pair:
          system.constantVariablePairExpressionCount++;
          break;
        case ExpressionType.constant_prefixed:
          system.constantPrefixedExpressionCount++;
          break;
        case ExpressionType.standard:
          system.standardExpressionCount++;
          break;
      }

      await this.systemRepository.save(system);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating expression count on system failed');
    }
  }

  @OnEvent('expression.delete.completed', {
    suppressErrors: false
  })
  public async decrementExpressionCount(expression: ExpressionEntity): Promise<void> {
    try {
      const validatedExpression = validatePayload(expression, ExpressionEntity);

      const system = await this.systemRepository.findOneBy({
        id: validatedExpression.systemId
      });

      if (!system) {
        throw new SystemNotFoundException();
      }

      switch (validatedExpression.type) {
        case ExpressionType.constant_variable_pair:
          system.constantVariablePairExpressionCount--;
          break;
        case ExpressionType.constant_prefixed:
          system.constantPrefixedExpressionCount--;
          break;
        case ExpressionType.standard:
          system.standardExpressionCount--;
          break;
      }

      await this.systemRepository.save(system);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating expression count on system failed');
    }
  }

  @OnEvent('symbol.create.completed', {
    suppressErrors: false
  })
  public async incrementSymbolCount(symbol: SymbolEntity): Promise<void> {
    try {
      const validatedSymbol = validatePayload(symbol, SymbolEntity);

      const system = await this.systemRepository.findOneBy({
        id: validatedSymbol.systemId
      });

      if (!system) {
        throw new SystemNotFoundException();
      }

      switch (validatedSymbol.type) {
        case SymbolType.constant:
          system.constantSymbolCount++;
          break;
        case SymbolType.variable:
          system.variableSymbolCount++;
          break;
      }

      await this.systemRepository.save(system);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating symbol count on system failed');
    }
  }

  @OnEvent('symbol.delete.completed', {
    suppressErrors: false
  })
  public async decrementSymbolCount(symbol: SymbolEntity): Promise<void> {
    try {
      const validatedSymbol = validatePayload(symbol, SymbolEntity);

      const system = await this.systemRepository.findOneBy({
        id: validatedSymbol.systemId
      });

      if (!system) {
        throw new SystemNotFoundException();
      }

      switch (validatedSymbol.type) {
        case SymbolType.constant:
          system.constantSymbolCount--;
          break;
        case SymbolType.variable:
          system.variableSymbolCount--;
          break;
      }

      await this.systemRepository.save(system);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating symbol count on system failed');
    }
  }

  @OnEvent('symbol.update.completed', {
    suppressErrors: false
  })
  public async switchSymbolCount(originalSymbol: SymbolEntity, savedSymbol: SymbolEntity): Promise<void> {
    try {
      const validatedOriginalSymbol = validatePayload(originalSymbol, SymbolEntity);
      const validatedSavedSymbol = validatePayload(savedSymbol, SymbolEntity);

      if (validatedOriginalSymbol.type === validatedSavedSymbol.type) {
        return;
      }

      const system = await this.systemRepository.findOneBy({
        id: validatedSavedSymbol.systemId
      });

      if (!system) {
        throw new SystemNotFoundException();
      }

      switch (validatedSavedSymbol.type) {
        case SymbolType.constant:
          system.constantSymbolCount++;
          system.variableSymbolCount--;
          break;
        case SymbolType.variable:
          system.constantSymbolCount--;
          system.variableSymbolCount++;
          break;
      }

      await this.systemRepository.save(system);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating symbol count on system failed');
    }
  }
};
