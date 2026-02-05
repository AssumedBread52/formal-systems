import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { InvalidObjectIdException } from '@/common/exceptions/invalid-object-id.exception';
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
import { Injectable, ValidationPipe } from '@nestjs/common';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { isMongoId, validateSync } from 'class-validator';
import { ObjectId } from 'mongodb';

@Injectable()
export class SymbolService {
  public constructor(private readonly symbolRepository: SymbolRepository, private readonly systemRepository: SystemRepository) {
  }

  async create(sessionUserId: string, systemId: any, payload: any): Promise<SymbolEntity> {
    const system = await this.systemRepository.findOneBy({
      id: systemId
    });

    if (!system) {
      throw new SystemNotFoundException();
    }

    const { id, createdByUserId } = system;

    if (createdByUserId.toString() !== sessionUserId) {
      throw new OwnershipException();
    }

    const newSymbolPayload = this.payloadCheck(payload, NewSymbolPayload);

    const { title, description, type, content } = newSymbolPayload;

    await this.conflictCheck(title, id);

    const symbol = new SymbolEntity();

    symbol.title = title;
    symbol.description = description;
    symbol.type = type;
    symbol.content = content;
    symbol.systemId = id;
    symbol.createdByUserId = sessionUserId;

    return this.symbolRepository.save(symbol);
  }

  async delete(sessionUserId: string, systemId: any, symbolId: any): Promise<SymbolEntity> {
    const symbol = await this.selectById(systemId, symbolId);

    const { id, axiomAppearanceCount, theoremAppearanceCount, deductionAppearanceCount, proofAppearanceCount, createdByUserId } = symbol;

    if (createdByUserId.toString() !== sessionUserId) {
      throw new OwnershipException();
    }

    if (axiomAppearanceCount > 0 || theoremAppearanceCount > 0 || deductionAppearanceCount > 0 || proofAppearanceCount > 0) {
      throw new InUseException();
    }

    await this.symbolRepository.remove(symbol);

    symbol.id = id;

    return symbol;
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

  async searchSymbols(containingSystemId: any, payload: any): Promise<PaginatedSymbolsPayload> {
    const searchPayload = this.payloadCheck(payload, SearchSymbolsPayload);
    const systemId = this.idCheck(containingSystemId);

    const { page, pageSize, keywords, types } = searchPayload;

    const [results, total] = await this.symbolRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      systemId: systemId.toString(),
      keywords,
      types
    });

    return new PaginatedSymbolsPayload(results, total);
  }

  async conflictCheck(title: string, systemId: string): Promise<void> {
    const collision = await this.symbolRepository.findOneBy({
      title,
      systemId
    });

    if (collision) {
      throw new UniqueTitleException();
    }
  }

  idCheck(id: any): ObjectId {
    if (!isMongoId(id)) {
      throw new InvalidObjectIdException();
    }

    return new ObjectId(id);
  }

  payloadCheck<Payload extends object>(payload: any, payloadConstructor: ClassConstructor<Payload>): Payload {
    const newPayload = plainToClass(payloadConstructor, payload);

    const errors = validateSync(newPayload);

    if (0 < errors.length) {
      const validationPipe = new ValidationPipe();

      throw validationPipe.createExceptionFactory()(errors);
    }

    return newPayload;
  }
};
