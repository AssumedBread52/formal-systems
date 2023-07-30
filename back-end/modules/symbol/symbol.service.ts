import { IdPayload } from '@/common/payloads/id.payload';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId, RootFilterOperators } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { EditSymbolPayload } from './payloads/edit-symbol.payload';
import { NewSymbolPayload } from './payloads/new-symbol.payload';
import { PaginatedResultsPayload } from './payloads/paginated-results.payload';
import { SymbolEntity } from './symbol.entity';

@Injectable()
export class SymbolService {
  constructor(@InjectRepository(SymbolEntity) private symbolRepository: MongoRepository<SymbolEntity>) {
  }

  async checkForConflict(content: string, systemId: ObjectId): Promise<void> {
    const collision = await this.symbolRepository.findOneBy({
      content,
      systemId
    });

    if (collision) {
      throw new ConflictException('Symbols within a formal system must have unique content.');
    }
  }

  async create(newSymbolPayload: NewSymbolPayload, sessionUserId: ObjectId, systemId: ObjectId): Promise<SymbolEntity> {
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

  readById(id: string): Promise<SymbolEntity | null> {
    return this.symbolRepository.findOneBy({
      _id: new ObjectId(id)
    });
  }

  async readSymbols(systemId: string, page: number, take: number, keywords?: string | string[]): Promise<PaginatedResultsPayload> {
    const skip = (page - 1) * take;
    const where = {
      systemId: new ObjectId(systemId)
    } as RootFilterOperators<SymbolEntity>;

    if (keywords && 0 !== keywords.length) {
      where.$text = {
        $caseSensitive: false,
        $search: Array.isArray(keywords) ? keywords.join(',') : keywords
      };
    }

    const [results, total] = await this.symbolRepository.findAndCount({
      where,
      skip,
      take
    });

    return new PaginatedResultsPayload(total, results);
  }

  async update(symbol: SymbolEntity, editSymbolPayload: EditSymbolPayload): Promise<IdPayload> {
    const { _id, content, systemId } = symbol;
    const { newTitle, newDescription, newType, newContent } = editSymbolPayload;

    if (content !== newContent) {
      await this.checkForConflict(newContent, systemId);
    }

    symbol.title = newTitle;
    symbol.description = newDescription;
    symbol.type = newType;
    symbol.content = newContent;

    await this.symbolRepository.save(symbol);

    return new IdPayload(_id);
  }

  async delete(symbol: SymbolEntity): Promise<IdPayload> {
    const { _id } = symbol;

    await this.symbolRepository.remove(symbol);

    return new IdPayload(_id);
  }
};
