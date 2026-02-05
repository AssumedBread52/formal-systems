import { validatePayload } from '@/common/helpers/validate-payload';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SystemEntity } from '@/system/entities/system.entity';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { SystemRepository } from '@/system/repositories/system.repository';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class CountListener {
  public constructor(private readonly systemRepository: SystemRepository) {
  }

  @OnEvent('symbol.create.completed', {
    suppressErrors: false
  })
  @OnEvent('symbol.update.completed', {
    suppressErrors: false
  })
  public async incrementSymbolCount(symbol: SymbolEntity): Promise<SystemEntity> {
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

      return this.systemRepository.save(system);
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
  @OnEvent('symbol.update.started', {
    suppressErrors: false
  })
  public async decrementSymbolCount(symbol: SymbolEntity): Promise<SystemEntity> {
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

      return this.systemRepository.save(system);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating symbol count on system failed');
    }
  }
};
