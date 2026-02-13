import { validatePayload } from '@/common/helpers/validate-payload';
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
};
