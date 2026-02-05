import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { validatePayload } from '@/common/helpers/validate-payload';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { InUseException } from '@/symbol/exceptions/in-use.exception';
import { SymbolNotFoundException } from '@/symbol/exceptions/symbol-not-found.exception';
import { UniqueTitleException } from '@/symbol/exceptions/unique-title.exception';
import { EditSymbolPayload } from '@/symbol/payloads/edit-symbol.payload';
import { NewSymbolPayload } from '@/symbol/payloads/new-symbol.payload';
import { PaginatedSymbolsPayload } from '@/symbol/payloads/paginated-symbols.payload';
import { SearchSymbolsPayload } from '@/symbol/payloads/search-symbols.payload';
import { SymbolRepository } from '@/symbol/repositories/symbol.repository';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { SystemRepository } from '@/system/repositories/system.repository';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { isMongoId } from 'class-validator';
import { ObjectId } from 'mongodb';

@Injectable()
export class SymbolService {
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

  public async searchSymbols(systemId: string, searchSymbolsPayload: SearchSymbolsPayload): Promise<PaginatedSymbolsPayload> {
    try {
      if (!isMongoId(systemId)) {
        throw new Error('Invalid system ID');
      }

      const validatedSearchSymbolsPayload = validatePayload(searchSymbolsPayload, SearchSymbolsPayload);

      const take = validatedSearchSymbolsPayload.pageSize;
      const skip = (validatedSearchSymbolsPayload.page - 1) * validatedSearchSymbolsPayload.pageSize;

      const [symbols, total] = await this.symbolRepository.findAndCount({
        skip,
        take,
        systemId,
        keywords: validatedSearchSymbolsPayload.keywords,
        types: validatedSearchSymbolsPayload.types
      });

      return new PaginatedSymbolsPayload(symbols, total);
    } catch {
      throw new InternalServerErrorException('Reading symbols failed');
    }
  }

  public async selectById(systemId: string, symbolId: string): Promise<SymbolEntity> {
    try {
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

      return symbol;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Reading symbol failed');
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

  async addToSymbolDictionary(systemId: ObjectId, symbolIds: ObjectId[], symbolDictionary: Record<string, SymbolEntity>): Promise<Record<string, SymbolEntity>> {
    const missingSymbolIds = symbolIds.filter((symbolId: ObjectId): boolean => {
      if (symbolDictionary[symbolId.toString()]) {
        return false;
      }

      return true;
    });

    const missingSymbols = await this.symbolRepository.find({
      where: {
        _id: {
          $in: missingSymbolIds
        },
        systemId
      }
    });

    const newSymbolDictionary = missingSymbols.reduce((dictionary: Record<string, SymbolEntity>, missingSymbol: SymbolEntity): Record<string, SymbolEntity> => {
      const { id } = missingSymbol;

      dictionary[id] = missingSymbol;

      return dictionary;
    }, symbolDictionary);

    missingSymbolIds.forEach((missingSymbolId: ObjectId): void => {
      if (!newSymbolDictionary[missingSymbolId.toString()]) {
        throw new SymbolNotFoundException();
      }
    });

    return newSymbolDictionary;
  }
};
