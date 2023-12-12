import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository, RootFilterOperators } from 'typeorm';
import { EditSymbolPayload } from './payloads/edit-symbol.payload';
import { NewSymbolPayload } from './payloads/new-symbol.payload';
import { PaginatedResultsPayload } from './payloads/paginated-results.payload';
import { SymbolEntity } from './symbol.entity';

@Injectable()
export class SymbolService {
  constructor(@InjectRepository(SymbolEntity) private symbolRepository: MongoRepository<SymbolEntity>) {
  }

  private async checkForConflict(content: string, systemId: ObjectId): Promise<void> {
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

    await this.checkForConflict(content, systemId);

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

  async readSymbols(systemId: ObjectId, page: number, count: number, keywords?: string | string[]): Promise<PaginatedResultsPayload> {
    const where = {
      systemId
    } as RootFilterOperators<SymbolEntity>;

    if (keywords && 0 !== keywords.length) {
      where.$text = {
        $caseSensitive: false,
        $search: Array.isArray(keywords) ? keywords.join(',') : keywords
      };
    }

    const [results, total] = await this.symbolRepository.findAndCount({
      skip: (page - 1) * count,
      take: count,
      where
    });

    return new PaginatedResultsPayload(total, results);
  }

  async update(symbol: SymbolEntity, editSymbolPayload: EditSymbolPayload): Promise<SymbolEntity> {
    const { type, content, axiomaticStatementAppearances, nonAxiomaticStatementAppearances, systemId } = symbol;
    const { newTitle, newDescription, newType, newContent } = editSymbolPayload;

    if (content !== newContent) {
      await this.checkForConflict(newContent, systemId);
    }

    if (type !== newType && (axiomaticStatementAppearances > 0 || nonAxiomaticStatementAppearances > 0)) {
      throw new ConflictException('Symbols in use cannot change their symbol type.');
    }

    symbol.title = newTitle;
    symbol.description = newDescription;
    symbol.type = newType;
    symbol.content = newContent;

    return this.symbolRepository.save(symbol);
  }

  delete(symbol: SymbolEntity): Promise<SymbolEntity> {
    return this.symbolRepository.remove(symbol);
  }
};
