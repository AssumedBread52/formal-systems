import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { validatePayload } from '@/common/helpers/validate-payload';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { InUseException } from '@/symbol/exceptions/in-use.exception';
import { SymbolNotFoundException } from '@/symbol/exceptions/symbol-not-found.exception';
import { UniqueTitleException } from '@/symbol/exceptions/unique-title.exception';
import { EditSymbolPayload } from '@/symbol/payloads/edit-symbol.payload';
import { NewSymbolPayload } from '@/symbol/payloads/new-symbol.payload';
import { SymbolRepository } from '@/symbol/repositories/symbol.repository';
import { SystemReadService } from '@/system/services/system-read.service';
import { UserReadService } from '@/user/services/user-read.service';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SymbolWriteService {
  public constructor(private readonly eventEmitter2: EventEmitter2, private readonly symbolRepository: SymbolRepository, private readonly systemReadService: SystemReadService, private readonly userReadService: UserReadService) {
  }

  public async create(userId: string, systemId: string, newSymbolPayload: NewSymbolPayload): Promise<SymbolEntity> {
    try {
      const validatedNewSymbolPayload = validatePayload(newSymbolPayload, NewSymbolPayload);

      const system = await this.systemReadService.selectById(systemId);

      const user = await this.userReadService.selectById(userId);

      if (user.id !== system.createdByUserId) {
        throw new OwnershipException();
      }

      const conflict = await this.symbolRepository.findOneBy({
        title: validatedNewSymbolPayload.title,
        systemId: system.id
      });

      if (conflict) {
        throw new UniqueTitleException();
      }

      const symbol = new SymbolEntity();

      symbol.title = validatedNewSymbolPayload.title;
      symbol.description = validatedNewSymbolPayload.description;
      symbol.type = validatedNewSymbolPayload.type;
      symbol.content = validatedNewSymbolPayload.content;
      symbol.systemId = system.id;
      symbol.createdByUserId = user.id;

      const savedSymbol = await this.symbolRepository.save(symbol);

      await this.eventEmitter2.emitAsync('symbol.create.completed', savedSymbol);

      return savedSymbol;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Creating symbol failed');
    }
  }

  public async delete(userId: string, systemId: string, symbolId: string): Promise<SymbolEntity> {
    try {
      const symbol = await this.symbolRepository.findOneBy({
        id: symbolId,
        systemId
      });

      if (!symbol) {
        throw new SymbolNotFoundException();
      }

      const user = await this.userReadService.selectById(userId);

      if (user.id !== symbol.createdByUserId) {
        throw new OwnershipException();
      }

      if (symbol.isInUse()) {
        throw new InUseException();
      }

      const deletedSymbol = await this.symbolRepository.remove(symbol);

      await this.eventEmitter2.emitAsync('symbol.delete.completed', deletedSymbol);

      return deletedSymbol;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Deleting symbol failed');
    }
  }

  public async update(userId: string, systemId: string, symbolId: string, editSymbolPayload: EditSymbolPayload): Promise<SymbolEntity> {
    try {
      const validatedEditSymbolPayload = validatePayload(editSymbolPayload, EditSymbolPayload);

      const symbol = await this.symbolRepository.findOneBy({
        id: symbolId,
        systemId
      });

      if (!symbol) {
        throw new SymbolNotFoundException();
      }

      const user = await this.userReadService.selectById(userId);

      if (user.id !== symbol.createdByUserId) {
        throw new OwnershipException();
      }

      if (validatedEditSymbolPayload.newTitle !== symbol.title) {
        const conflict = await this.symbolRepository.findOneBy({
          title: validatedEditSymbolPayload.newTitle,
          systemId
        });

        if (conflict) {
          throw new UniqueTitleException();
        }
      }

      if (validatedEditSymbolPayload.newType !== symbol.type) {
        if (symbol.isInUse()) {
          throw new InUseException();
        }
      }

      const originalSymbol = Object.assign(new SymbolEntity(), symbol);

      symbol.title = validatedEditSymbolPayload.newTitle;
      symbol.description = validatedEditSymbolPayload.newDescription;
      symbol.type = validatedEditSymbolPayload.newType;
      symbol.content = validatedEditSymbolPayload.newContent;

      const savedSymbol = await this.symbolRepository.save(symbol);

      await this.eventEmitter2.emitAsync('symbol.update.completed', originalSymbol, savedSymbol);

      return savedSymbol;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating symbol failed');
    }
  }
};
