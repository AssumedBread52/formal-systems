import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { SymbolType } from './enums/symbol-type.enum';
import { SymbolEntity } from './symbol.entity';

@Injectable()
export class SymbolService {
  constructor(@InjectRepository(SymbolEntity) private symbolRepository: MongoRepository<SymbolEntity>) {
  }

  readByIds(systemId: ObjectId, symbolIds: ObjectId[]): Promise<SymbolEntity[]> {
    return this.symbolRepository.find({
      _id: {
        $in: symbolIds
      },
      systemId
    });
  }

  readByType(systemId: ObjectId, type: SymbolType): Promise<SymbolEntity[]> {
    return this.symbolRepository.find({
      type,
      systemId
    });
  }
};
