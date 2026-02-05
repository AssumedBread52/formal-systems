import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { InvalidObjectIdException } from '@/common/exceptions/invalid-object-id.exception';
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
import { HttpException, Injectable, InternalServerErrorException, ValidationPipe } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { isMongoId, validateSync } from 'class-validator';
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

  async update(sessionUserId: string, containingSystemId: any, symbolId: any, payload: any): Promise<SymbolEntity> {
    const symbol = await this.selectById(containingSystemId, symbolId);

    const { title, type, axiomAppearanceCount, theoremAppearanceCount, deductionAppearanceCount, proofAppearanceCount, systemId, createdByUserId } = symbol;

    if (createdByUserId.toString() !== sessionUserId) {
      throw new OwnershipException();
    }

    const editSymbolPayload = this.payloadCheck(payload, EditSymbolPayload);

    const { newTitle, newDescription, newType, newContent } = editSymbolPayload;

    if (title !== newTitle) {
      await this.conflictCheck(newTitle, systemId);
    }

    if (type !== newType && (axiomAppearanceCount > 0 || theoremAppearanceCount > 0 || deductionAppearanceCount > 0 || proofAppearanceCount > 0)) {
      throw new InUseException();
    }

    symbol.title = newTitle;
    symbol.description = newDescription;
    symbol.type = newType;
    symbol.content = newContent;

    return this.symbolRepository.save(symbol);
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

  async selectById(systemId: any, symbolId: any): Promise<SymbolEntity> {
    const symbol = await this.symbolRepository.findOneBy({
      id: this.idCheck(symbolId).toString(),
      systemId: this.idCheck(systemId).toString()
    });

    if (!symbol) {
      throw new SymbolNotFoundException();
    }

    return symbol;
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

  private async conflictCheck(title: string, systemId: string): Promise<void> {
    const collision = await this.symbolRepository.findOneBy({
      title,
      systemId
    });

    if (collision) {
      throw new UniqueTitleException();
    }
  }

  private idCheck(id: any): ObjectId {
    if (!isMongoId(id)) {
      throw new InvalidObjectIdException();
    }

    return new ObjectId(id);
  }

  private payloadCheck<Payload extends object>(payload: any, payloadConstructor: ClassConstructor<Payload>): Payload {
    const newPayload = plainToClass(payloadConstructor, payload);

    const errors = validateSync(newPayload);

    if (0 < errors.length) {
      const validationPipe = new ValidationPipe();

      throw validationPipe.createExceptionFactory()(errors);
    }

    return newPayload;
  }
};
