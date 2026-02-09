import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { validatePayload } from '@/common/helpers/validate-payload';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { InUseException } from '@/symbol/exceptions/in-use.exception';
import { SymbolNotFoundException } from '@/symbol/exceptions/symbol-not-found.exception';
import { UniqueTitleException } from '@/symbol/exceptions/unique-title.exception';
import { EditSymbolPayload } from '@/symbol/payloads/edit-symbol.payload';
import { NewSymbolPayload } from '@/symbol/payloads/new-symbol.payload';
import { SymbolRepository } from '@/symbol/repositories/symbol.repository';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { SystemRepository } from '@/system/repositories/system.repository';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { isMongoId } from 'class-validator';

@Injectable()
export class SymbolWriteService {
  public constructor(private readonly eventEmitter2: EventEmitter2, private readonly symbolRepository: SymbolRepository, private readonly systemRepository: SystemRepository) {
  }

  public async create(sessionUserId: string, systemId: string, newSymbolPayload: NewSymbolPayload): Promise<SymbolEntity> {
    try {
      if (!isMongoId(sessionUserId)) {
        throw new Error('Invalid session user ID');
      }

      if (!isMongoId(systemId)) {
        throw new Error('Invalid system ID');
      }

      const validatedNewSymbolPayload = validatePayload(newSymbolPayload, NewSymbolPayload);

      const system = await this.systemRepository.findOneBy({
        id: systemId
      });

      if (!system) {
        throw new SystemNotFoundException();
      }

      if (sessionUserId !== system.createdByUserId) {
        throw new OwnershipException();
      }

      const conflict = await this.symbolRepository.findOneBy({
        title: validatedNewSymbolPayload.title,
        systemId
      });

      if (conflict) {
        throw new UniqueTitleException();
      }

      const symbol = new SymbolEntity();

      symbol.title = validatedNewSymbolPayload.title;
      symbol.description = validatedNewSymbolPayload.description;
      symbol.type = validatedNewSymbolPayload.type;
      symbol.content = validatedNewSymbolPayload.content;
      symbol.systemId = systemId;
      symbol.createdByUserId = sessionUserId;

      const savedSymbol = await this.symbolRepository.save(symbol);

      this.eventEmitter2.emit('symbol.create.completed', savedSymbol);

      return savedSymbol;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Creating symbol failed');
    }
  }

  public async delete(sessionUserId: string, systemId: string, symbolId: string): Promise<SymbolEntity> {
    try {
      if (!isMongoId(sessionUserId)) {
        throw new Error('Invalid session user ID');
      }

      if (!isMongoId(systemId)) {
        throw new Error('Invalid system ID');
      }

      if (!isMongoId(symbolId)) {
        throw new Error('Invalid symbol ID');
      }

      const symbol = await this.symbolRepository.findOneBy({
        id: symbolId,
        systemId
      });

      if (!symbol) {
        throw new SymbolNotFoundException();
      }

      if (sessionUserId !== symbol.createdByUserId) {
        throw new OwnershipException();
      }

      if (0 < symbol.axiomAppearanceCount) {
        throw new InUseException();
      }

      if (0 < symbol.theoremAppearanceCount) {
        throw new InUseException();
      }

      if (0 < symbol.deductionAppearanceCount) {
        throw new InUseException();
      }

      if (0 < symbol.proofAppearanceCount) {
        throw new InUseException();
      }

      const deletedSymbol = await this.symbolRepository.remove(symbol);

      this.eventEmitter2.emit('symbol.delete.completed', deletedSymbol);

      return deletedSymbol;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Deleting symbol failed');
    }
  }

  public async update(sessionUserId: string, systemId: string, symbolId: string, editSymbolPayload: EditSymbolPayload): Promise<SymbolEntity> {
    try {
      if (!isMongoId(sessionUserId)) {
        throw new Error('Invalid session user ID');
      }

      if (!isMongoId(systemId)) {
        throw new Error('Invalid system ID');
      }

      if (!isMongoId(symbolId)) {
        throw new Error('Invalid symbol ID');
      }

      const validatedEditSymbolPayload = validatePayload(editSymbolPayload, EditSymbolPayload);

      const symbol = await this.symbolRepository.findOneBy({
        id: symbolId,
        systemId
      });

      if (!symbol) {
        throw new SymbolNotFoundException();
      }

      if (sessionUserId !== symbol.createdByUserId) {
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
        if (0 < symbol.axiomAppearanceCount) {
          throw new InUseException();
        }

        if (0 < symbol.theoremAppearanceCount) {
          throw new InUseException();
        }

        if (0 < symbol.deductionAppearanceCount) {
          throw new InUseException();
        }

        if (0 < symbol.proofAppearanceCount) {
          throw new InUseException();
        }
      }

      this.eventEmitter2.emit('symbol.update.started', symbol);

      symbol.title = validatedEditSymbolPayload.newTitle;
      symbol.description = validatedEditSymbolPayload.newDescription;
      symbol.type = validatedEditSymbolPayload.newType;
      symbol.content = validatedEditSymbolPayload.newContent;

      const savedSymbol = await this.symbolRepository.save(symbol);

      this.eventEmitter2.emit('symbol.update.completed', savedSymbol);

      return savedSymbol;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating symbol failed');
    }
  }
};
