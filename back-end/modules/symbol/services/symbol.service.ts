import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { InvalidObjectIdException } from '@/common/exceptions/invalid-object-id.exception';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { InUseException } from '@/symbol/exceptions/in-use.exception';
import { SymbolNotFoundException } from '@/symbol/exceptions/symbol-not-found.exception';
import { SymbolUniqueTitleException } from '@/symbol/exceptions/symbol-unique-title.exception';
import { EditSymbolPayload } from '@/symbol/payloads/edit-symbol.payload';
import { NewSymbolPayload } from '@/symbol/payloads/new-symbol.payload';
import { SearchPayload } from '@/symbol/payloads/search.payload';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { SystemRepository } from '@/system/repositories/system.repository';
import { Injectable, ValidationPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { isMongoId, validateSync } from 'class-validator';
import { ObjectId } from 'mongodb';
import { MongoRepository, RootFilterOperators } from 'typeorm';

@Injectable()
export class SymbolService {
  public constructor(@InjectRepository(SymbolEntity) private readonly symbolRepository: MongoRepository<SymbolEntity>, private readonly systemRepository: SystemRepository) {
  }

  async create(sessionUserId: ObjectId, systemId: any, payload: any): Promise<SymbolEntity> {
    const system = await this.systemRepository.findOneBy({
      id: systemId
    });

    if (!system) {
      throw new SystemNotFoundException();
    }

    const { id, createdByUserId } = system;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    const newSymbolPayload = this.payloadCheck(payload, NewSymbolPayload);

    const { title, description, type, content } = newSymbolPayload;

    await this.conflictCheck(title, new ObjectId(id));

    const symbol = new SymbolEntity();

    symbol.title = title;
    symbol.description = description;
    symbol.type = type;
    symbol.content = content;
    symbol.systemId = new ObjectId(id);
    symbol.createdByUserId = sessionUserId;

    return this.symbolRepository.save(symbol);
  }

  async delete(sessionUserId: ObjectId, systemId: any, symbolId: any): Promise<SymbolEntity> {
    const symbol = await this.readById(systemId, symbolId);

    const { _id, axiomAppearanceCount, theoremAppearanceCount, deductionAppearanceCount, proofAppearanceCount, createdByUserId } = symbol;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    if (axiomAppearanceCount > 0 || theoremAppearanceCount > 0 || deductionAppearanceCount > 0 || proofAppearanceCount > 0) {
      throw new InUseException();
    }

    await this.symbolRepository.remove(symbol);

    symbol._id = _id;

    return symbol;
  }

  async update(sessionUserId: ObjectId, containingSystemId: any, symbolId: any, payload: any): Promise<SymbolEntity> {
    const symbol = await this.readById(containingSystemId, symbolId);

    const { title, type, axiomAppearanceCount, theoremAppearanceCount, deductionAppearanceCount, proofAppearanceCount, systemId, createdByUserId } = symbol;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
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
      const { _id } = missingSymbol;

      dictionary[_id.toString()] = missingSymbol;

      return dictionary;
    }, symbolDictionary);

    missingSymbolIds.forEach((missingSymbolId: ObjectId): void => {
      if (!newSymbolDictionary[missingSymbolId.toString()]) {
        throw new SymbolNotFoundException();
      }
    });

    return newSymbolDictionary;
  }

  async readById(systemId: any, symbolId: any): Promise<SymbolEntity> {
    const symbol = await this.symbolRepository.findOneBy({
      _id: this.idCheck(symbolId),
      systemId: this.idCheck(systemId)
    });

    if (!symbol) {
      throw new SymbolNotFoundException();
    }

    return symbol;
  }

  readSymbols(containingSystemId: any, payload: any): Promise<[SymbolEntity[], number]> {
    const searchPayload = this.payloadCheck(payload, SearchPayload);
    const systemId = this.idCheck(containingSystemId);

    const { page, count, keywords, types } = searchPayload;
    const where = {
      systemId
    } as RootFilterOperators<SymbolEntity>;

    if (0 !== keywords.length) {
      where.$text = {
        $caseSensitive: false,
        $search: keywords.join(',')
      };
    }

    if (0 !== types.length) {
      where['type'] = {
        $in: types
      };
    }

    return this.symbolRepository.findAndCount({
      skip: (page - 1) * count,
      take: count,
      where
    });
  }

  async conflictCheck(title: string, systemId: ObjectId): Promise<void> {
    const collision = await this.symbolRepository.findOneBy({
      title,
      systemId
    });

    if (collision) {
      throw new SymbolUniqueTitleException();
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
