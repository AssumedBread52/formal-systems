import { validatePayload } from '@/common/helpers/validate-payload';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SystemEntity } from '@/system/entities/system.entity';
import { UserNotFoundException } from '@/user/exceptions/user-not-found.exception';
import { UserRepository } from '@/user/repositories/user.repository';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class CountListener {
  public constructor(private readonly userRepository: UserRepository) {
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

      const user = await this.userRepository.findOneBy({
        id: validatedSavedSymbol.createdByUserId
      });

      if (!user) {
        throw new UserNotFoundException();
      }

      switch (validatedSavedSymbol.type) {
        case SymbolType.constant:
          user.constantSymbolCount++;
          user.variableSymbolCount--;
          break;
        case SymbolType.variable:
          user.constantSymbolCount--;
          user.variableSymbolCount++;
          break;
      }

      await this.userRepository.save(user);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating symbol count on user failed');
    }
  }

  @OnEvent('symbol.create.completed', {
    suppressErrors: false
  })
  public async incrementSymbolCount(symbol: SymbolEntity): Promise<void> {
    try {
      const validatedSymbol = validatePayload(symbol, SymbolEntity);

      const user = await this.userRepository.findOneBy({
        id: validatedSymbol.createdByUserId
      });

      if (!user) {
        throw new UserNotFoundException();
      }

      switch (validatedSymbol.type) {
        case SymbolType.constant:
          user.constantSymbolCount++;
          break;
        case SymbolType.variable:
          user.variableSymbolCount++;
          break;
      }

      await this.userRepository.save(user);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating symbol count on user failed');
    }
  }

  @OnEvent('symbol.delete.completed', {
    suppressErrors: false
  })
  public async decrementSymbolCount(symbol: SymbolEntity): Promise<void> {
    try {
      const validatedSymbol = validatePayload(symbol, SymbolEntity);

      const user = await this.userRepository.findOneBy({
        id: validatedSymbol.createdByUserId
      });

      if (!user) {
        throw new UserNotFoundException();
      }

      switch (validatedSymbol.type) {
        case SymbolType.constant:
          user.constantSymbolCount--;
          break;
        case SymbolType.variable:
          user.variableSymbolCount--;
          break;
      }

      await this.userRepository.save(user);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating symbol count on user failed');
    }
  }

  @OnEvent('system.create.completed', {
    suppressErrors: false
  })
  public async incrementSystemCount(system: SystemEntity): Promise<void> {
    try {
      const validatedSystem = validatePayload(system, SystemEntity);

      const user = await this.userRepository.findOneBy({
        id: validatedSystem.createdByUserId
      });

      if (!user) {
        throw new UserNotFoundException();
      }

      user.systemCount++;

      await this.userRepository.save(user);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating system count on user failed');
    }
  }

  @OnEvent('system.delete.completed', {
    suppressErrors: false
  })
  public async decrementSystemCount(system: SystemEntity): Promise<void> {
    try {
      const validatedSystem = validatePayload(system, SystemEntity);

      const user = await this.userRepository.findOneBy({
        id: validatedSystem.createdByUserId
      });

      if (!user) {
        throw new UserNotFoundException();
      }

      user.systemCount--;

      await this.userRepository.save(user);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating system count on user failed');
    }
  }
};
