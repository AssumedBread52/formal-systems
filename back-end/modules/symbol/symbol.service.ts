import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository, RootFilterOperators } from 'typeorm';
import { SymbolType } from './enums/symbol-type.enum';
import { EditSymbolPayload } from './payloads/edit-symbol.payload';
import { NewSymbolPayload } from './payloads/new-symbol.payload';
import { SymbolEntity } from './symbol.entity';

@Injectable()
export class SymbolService {
  constructor(@InjectRepository(SymbolEntity) private symbolRepository: MongoRepository<SymbolEntity>) {
  }

  private async conflictCheck(content: string, systemId: ObjectId): Promise<void> {
    const collision = await this.symbolRepository.findOneBy({
      content,
      systemId
    });

    if (collision) {
      throw new ConflictException('Symbols within a formal system must have unique content.');
    }
  }

  async create(newSymbolPayload: NewSymbolPayload, systemId: ObjectId, sessionUserId: ObjectId): Promise<SymbolEntity> {
    const { title, description, type, content } = newSymbolPayload;

    await this.conflictCheck(content, systemId);

    const symbol = new SymbolEntity();

    symbol.title = title;
    symbol.description = description;
    symbol.type = type;
    symbol.content = content;
    symbol.systemId = systemId;
    symbol.createdByUserId = sessionUserId;

    return this.symbolRepository.save(symbol);
  }

  readById(systemId: ObjectId, symbolId: ObjectId): Promise<SymbolEntity | null> {
    return this.symbolRepository.findOneBy({
      _id: symbolId,
      systemId
    });
  }

  readByIds(systemId: ObjectId, symbolIds: ObjectId[]): Promise<SymbolEntity[]> {
    return this.symbolRepository.find({
      _id: {
        $in: symbolIds
      },
      systemId
    });
  }

  readSymbols(page: number, count: number, keywords: string[], types: SymbolType[], systemId: ObjectId): Promise<[SymbolEntity[], number]> {
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
      where.type = {
        $in: types
      };
    }

    return this.symbolRepository.findAndCount({
      skip: (page - 1) * count,
      take: count,
      where
    });
  }

  async update(symbol: SymbolEntity, editSymbolPayload: EditSymbolPayload): Promise<SymbolEntity> {
    const { type, content, axiomAppearances, theoremAppearances, deductionAppearances, systemId } = symbol;
    const { newTitle, newDescription, newType, newContent } = editSymbolPayload;

    if (content !== newContent) {
      await this.conflictCheck(newContent, systemId);
    }

    if (type !== newType && (axiomAppearances > 0 || theoremAppearances > 0 || deductionAppearances > 0)) {
      throw new ConflictException('Symbols in use cannot change their symbol type.');
    }

    symbol.title = newTitle;
    symbol.description = newDescription;
    symbol.type = newType;
    symbol.content = newContent;

    return this.symbolRepository.save(symbol);
  }

  delete(symbol: SymbolEntity): Promise<SymbolEntity> {
    const { axiomAppearances, theoremAppearances, deductionAppearances } = symbol;

    if (axiomAppearances > 0 || theoremAppearances > 0 || deductionAppearances > 0) {
      throw new ConflictException('Symbols in use cannot be deleted.');
    }

    return this.symbolRepository.remove(symbol);
  }
};
